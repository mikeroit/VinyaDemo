import fs from "node:fs/promises";
import axios from "axios";
import { config } from "./config.js";

type CloseTokenStore = {
  access_token: string;
  refresh_token?: string;
  token_type: string;
  expires_in: number;
  expires_at: number;
  scope?: string;
  organization_id?: string;
  user_id?: string;
};

const CLOSE_AUTHORIZE_URL = "https://app.close.com/oauth2/authorize/";
const CLOSE_TOKEN_URL = "https://api.close.com/oauth2/token/";

export function getCloseAuthorizeUrl(): string {
  const url = new URL(CLOSE_AUTHORIZE_URL);
  url.searchParams.set("client_id", config.closeClientId);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("redirect_uri", config.closeRedirectUri);
  url.searchParams.set("scope", "all.full_access offline_access");
  return url.toString();
}

async function readCloseTokenFile(): Promise<CloseTokenStore | null> {
  try {
    const raw = await fs.readFile(config.closeTokenPath, "utf8");
    return JSON.parse(raw) as CloseTokenStore;
  } catch {
    return null;
  }
}

async function writeCloseTokenFile(token: CloseTokenStore): Promise<void> {
  await fs.writeFile(config.closeTokenPath, JSON.stringify(token, null, 2), "utf8");
}

export async function exchangeCloseCodeForToken(code: string): Promise<CloseTokenStore> {
  const body = new URLSearchParams({
    client_id: config.closeClientId,
    client_secret: config.closeClientSecret,
    grant_type: "authorization_code",
    code,
    redirect_uri: config.closeRedirectUri,
  });

  const response = await axios.post(CLOSE_TOKEN_URL, body.toString(), {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  });

  const data = response.data as {
    access_token: string;
    refresh_token?: string;
    token_type: string;
    expires_in: number;
    scope?: string;
    organization_id?: string;
    user_id?: string;
  };

  const token: CloseTokenStore = {
    ...data,
    expires_at: Date.now() + data.expires_in * 1000,
  };

  await writeCloseTokenFile(token);
  return token;
}

async function refreshCloseToken(refreshToken: string): Promise<CloseTokenStore> {
  const body = new URLSearchParams({
    client_id: config.closeClientId,
    client_secret: config.closeClientSecret,
    grant_type: "refresh_token",
    refresh_token: refreshToken,
  });

  const response = await axios.post(CLOSE_TOKEN_URL, body.toString(), {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  });

  const data = response.data as {
    access_token: string;
    refresh_token?: string;
    token_type: string;
    expires_in: number;
    scope?: string;
    organization_id?: string;
    user_id?: string;
  };

  const token: CloseTokenStore = {
    ...data,
    expires_at: Date.now() + data.expires_in * 1000,
  };

  await writeCloseTokenFile(token);
  return token;
}

export async function getValidCloseAccessToken(): Promise<string> {
  const saved = await readCloseTokenFile();

  if (!saved) {
    throw new Error("Close is not connected yet. Visit /close/connect first.");
  }

  const bufferMs = 60_000;
  const isStillValid = saved.expires_at > Date.now() + bufferMs;

  if (isStillValid) {
    return saved.access_token;
  }

  if (!saved.refresh_token) {
    throw new Error("Close access token expired and no refresh token is available.");
  }

  const refreshed = await refreshCloseToken(saved.refresh_token);
  return refreshed.access_token;
}