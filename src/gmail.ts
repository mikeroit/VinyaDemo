import fs from "node:fs/promises";
import path from "node:path";
import { authenticate } from "@google-cloud/local-auth";
import { google } from "googleapis";
import type { OAuth2Client } from "google-auth-library";
import { config } from "./config.js";
import type { GmailMessage } from "./types.js";

const SCOPES = ["https://www.googleapis.com/auth/gmail.modify"];

type OAuthCredentials = {
  installed?: {
    client_id: string;
    client_secret: string;
    redirect_uris: string[];
  };
  web?: {
    client_id: string;
    client_secret: string;
    redirect_uris: string[];
  };
};

async function loadSavedClient() {
  try {
    const tokenPath = path.resolve(config.gmailTokenPath);
    const content = await fs.readFile(tokenPath, "utf8");
    const credentials = JSON.parse(content);
    return google.auth.fromJSON(credentials);
  } catch {
    return null;
  }
}

async function saveClient(auth: any): Promise<void> {
  const credentialsPath = path.resolve(config.gmailCredentialsPath);
  const tokenPath = path.resolve(config.gmailTokenPath);

  const content = await fs.readFile(credentialsPath, "utf8");
  const keys = JSON.parse(content) as OAuthCredentials;
  const key = keys.installed ?? keys.web;

  if (!key) {
    throw new Error("Invalid OAuth credentials file.");
  }

  const payload = JSON.stringify({
    type: "authorized_user",
    client_id: key.client_id,
    client_secret: key.client_secret,
    refresh_token: auth.credentials.refresh_token,
  });

  await fs.writeFile(tokenPath, payload, "utf8");
}

export async function authorize() {
  const savedClient = await loadSavedClient();

  if (savedClient) {
    return savedClient;
  }

  const client = await authenticate({
    scopes: SCOPES,
    keyfilePath: path.resolve(config.gmailCredentialsPath),
  });

  if (client.credentials.refresh_token) {
    await saveClient(client);
  }

  return client;
}

function getHeaderValue(
  headers: Array<{ name?: string | null; value?: string | null }> | undefined,
  headerName: string,
): string | undefined {
  return headers?.find(
    (header) => header.name?.toLowerCase() === headerName.toLowerCase(),
  )?.value ?? undefined;
}

function decodeBase64Url(input: string): string {
  const normalized = input.replace(/-/g, "+").replace(/_/g, "/");
  return Buffer.from(normalized, "base64").toString("utf8");
}

function extractBodies(payload: any): { plainTextBody?: string; htmlBody?: string } {
  let plainTextBody: string | undefined;
  let htmlBody: string | undefined;

  function walk(part: any) {
    if (!part) {
      return;
    }

    if (part.mimeType === "text/plain" && part.body?.data) {
      plainTextBody = decodeBase64Url(part.body.data);
    }

    if (part.mimeType === "text/html" && part.body?.data) {
      htmlBody = decodeBase64Url(part.body.data);
    }

    if (Array.isArray(part.parts)) {
      for (const child of part.parts) {
        walk(child);
      }
    }
  }

  walk(payload);

  return { plainTextBody, htmlBody };
}

export async function getLatestMatchingMessage(): Promise<GmailMessage | null> {
  const auth = await authorize();
  const gmail = google.gmail({ version: "v1", auth: auth as OAuth2Client });

  const listResponse = await gmail.users.messages.list({
    userId: "me",
    q: config.gmailQuery,
    maxResults: 1,
  });

  const messageId = listResponse.data.messages?.[0]?.id;

  if (!messageId) {
    return null;
  }

  const messageResponse = await gmail.users.messages.get({
    userId: "me",
    id: messageId,
    format: "full",
  });

  const message = messageResponse.data;
  const headers = message.payload?.headers;
  const { plainTextBody, htmlBody } = extractBodies(message.payload);

  return {
    id: message.id ?? "",
    threadId: message.threadId ?? undefined,
    subject: getHeaderValue(headers, "Subject"),
    from: getHeaderValue(headers, "From"),
    snippet: message.snippet ?? undefined,
    plainTextBody,
    htmlBody,
  };
}

export async function markMessageAsRead(messageId: string): Promise<void> {
  const auth = await authorize();
  const gmail = google.gmail({ version: "v1", auth: auth as OAuth2Client });

  await gmail.users.messages.modify({
    userId: "me",
    id: messageId,
    requestBody: {
      removeLabelIds: ["UNREAD"],
    },
  });
}