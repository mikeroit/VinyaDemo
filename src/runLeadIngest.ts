import { getLatestMatchingMessage, markMessageAsRead } from "./gmail.js";
import { parseLeadFromText } from "./parser.js";
import { sendLeadToCrm } from "./crm.js";
import type { RunLeadIngestResult } from "./types.js";

export async function runLeadIngest(): Promise<RunLeadIngestResult> {
  console.log("Starting lead ingest run...");

  const message = await getLatestMatchingMessage();

  if (!message) {
    console.log("No matching Gmail message found.");

    return {
      status: "no_message_found",
    };
  }

  console.log("Gmail message found:", {
    id: message.id,
    subject: message.subject,
    from: message.from,
  });

  const rawBody = message.plainTextBody ?? message.htmlBody ?? message.snippet ?? "";
  const bodySource = message.plainTextBody ? "plainText" : message.htmlBody ? "html" : "snippet";
  console.log(`Body source: ${bodySource}, length: ${rawBody.length}`);
  console.log("Body preview:\n", rawBody.slice(0, 600));

  const body = bodySource === "html"
    ? rawBody.replace(/<[^>]*>/g, " ").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/[ \t]+/g, " ").replace(/ *\n */g, "\n").trim()
    : rawBody;

  const parsedLead = parseLeadFromText(body);

  if (!parsedLead.email && !parsedLead.phone && !parsedLead.fullName) {
    return {
      status: "parse_failed",
      reason: "Missing required fields (name, email, phone)",
    };
  }

  if (!parsedLead.email && !parsedLead.phone) {
    return {
      status: "parse_failed",
      reason: "Parsed lead is missing both email and phone.",
    };
  }

  try {
      const crmResponse = await sendLeadToCrm(parsedLead);

      await markMessageAsRead(message.id);

      return {
        status: "success",
        gmailMessageId: message.id,
        parsedLead,
        crmResponse,
      };
    } catch (error) {
      console.error("CRM push failed:", error);
  
      return {
        status: "crm_failed",
        reason: error instanceof Error ? error.message : "Unknown CRM error",
      };
    }
  }