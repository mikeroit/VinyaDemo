import axios from "axios";
import { getValidCloseAccessToken } from "./closeAuth.js";
import type { CrmCreateLeadResult, Lead } from "./types.js";
import { config } from "./config.js"

function mapLeadToClosePayload(lead: Lead) {
  const contactName =
    (lead.fullName ??
    [lead.firstName, lead.lastName].filter(Boolean).join(" ").trim()) ||
    undefined;

  const contact: Record<string, unknown> = {};

  if (contactName) {
    contact.name = contactName;
  }

  if (lead.email) {
    contact.emails = [
      {
        email: lead.email,
        type: "office",
      },
    ];
  }

  if (lead.phone) {
    contact.phones = [
      {
        phone: lead.phone,
        type: "office",
      },
    ];
  }

  const payload: Record<string, unknown> = {
    name: lead.source ? `${lead.source} Lead` : contactName ?? "Email Lead",
    ...buildCustomFieldPayload(lead),
  };

  payload.description = buildDescription(lead);

  if (lead.message) {
    payload.description = lead.message;
  }

  if (Object.keys(contact).length > 0) {
    payload.contacts = [contact];
  }

  return payload;
}

export async function sendLeadToCrm(lead: Lead): Promise<CrmCreateLeadResult> {
  const accessToken = await getValidCloseAccessToken();
  const payload = mapLeadToClosePayload(lead);

  console.log("Sending lead to Close...");
  console.log(JSON.stringify(payload, null, 2));
  console.log("Close custom field config:", config.closeCustomFields);
  console.log("Lead being mapped:", JSON.stringify(lead, null, 2));
  console.log("Sending lead to Close...");
  console.log(JSON.stringify(payload, null, 2));

  try {
    const response = await axios.post("https://api.close.com/api/v1/lead/", payload, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });

    const recordId = response.data?.id?.toString() ?? "unknown";

    return {
      created: true,
      recordId,
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      const data = error.response?.data;
      throw new Error(
        `Close API request failed${status ? ` (${status})` : ""}: ${JSON.stringify(data)}`
      );
    }

    throw error;
  }
}

function buildDescription(lead: Lead): string {
  const lines: string[] = [];

  if (lead.creditRating) lines.push(`Credit Rating: ${lead.creditRating}`);
  if (lead.propertyValue) lines.push(`Property Value: ${lead.propertyValue}`);
  if (lead.propertyCity) lines.push(`City: ${lead.propertyCity}`);
  if (lead.propertyZip) lines.push(`Zip: ${lead.propertyZip}`);
  if (lead.loanProduct) lines.push(`Loan Product: ${lead.loanProduct}`);
  if (lead.employmentStatus) lines.push(`Employment: ${lead.employmentStatus}`);
  if (lead.grossIncome) lines.push(`Income: ${lead.grossIncome}`);
  if (lead.downPayment) lines.push(`Down Payment: ${lead.downPayment}`);

  if (lead.message) lines.push(`Message: ${lead.message}`);

  return lines.join("\n");
}

function buildCustomFieldPayload(lead: Lead): Record<string, unknown> {
  const custom: Record<string, unknown> = {};
  const cf = config.closeCustomFields;

  if (cf.creditRating && lead.creditRating) {
    custom[`custom.${cf.creditRating}`] = lead.creditRating;
  }

  if (cf.propertyValue && lead.propertyValue !== undefined) {
    custom[`custom.${cf.propertyValue}`] = lead.propertyValue;
  }

  if (cf.propertyCity && lead.propertyCity) {
    custom[`custom.${cf.propertyCity}`] = lead.propertyCity;
  }

  if (cf.propertyZip && lead.propertyZip) {
    custom[`custom.${cf.propertyZip}`] = lead.propertyZip;
  }

  if (cf.propertyCountyAndState && lead.propertyCountyAndState) {
    custom[`custom.${cf.propertyCountyAndState}`] = lead.propertyCountyAndState;
  }

  if (cf.loanProduct && lead.loanProduct) {
    custom[`custom.${cf.loanProduct}`] = lead.loanProduct;
  }

  if (cf.employmentStatus && lead.employmentStatus) {
    custom[`custom.${cf.employmentStatus}`] = lead.employmentStatus;
  }

  if (cf.grossIncome && lead.grossIncome) {
    custom[`custom.${cf.grossIncome}`] = lead.grossIncome;
  }

  if (cf.downPayment && lead.downPayment) {
    custom[`custom.${cf.downPayment}`] = lead.downPayment;
  }

  return custom;
}