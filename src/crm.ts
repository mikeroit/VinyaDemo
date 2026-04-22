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

function buildCustomFieldPayload(lead: Lead): Record<string, unknown> {
  const custom: Record<string, unknown> = {};
  const cf = config.closeCustomFields;

  if (cf.creditRating && lead.creditRating !== undefined) {
    custom[`custom.${cf.creditRating}`] = lead.creditRating;
  }

  if (cf.propertyValue && lead.propertyValue !== undefined) {
    custom[`custom.${cf.propertyValue}`] = lead.propertyValue;
  }

  if (cf.propertyCity && lead.propertyCity !== undefined) {
    custom[`custom.${cf.propertyCity}`] = lead.propertyCity;
  }

  if (cf.propertyZip && lead.propertyZip !== undefined) {
    custom[`custom.${cf.propertyZip}`] = lead.propertyZip;
  }

  if (cf.propertyCountyAndState && lead.propertyCountyAndState !== undefined) {
    custom[`custom.${cf.propertyCountyAndState}`] = lead.propertyCountyAndState;
  }

  if (cf.loanProduct && lead.loanProduct !== undefined) {
    custom[`custom.${cf.loanProduct}`] = lead.loanProduct;
  }

  if (cf.employmentStatus && lead.employmentStatus !== undefined) {
    custom[`custom.${cf.employmentStatus}`] = lead.employmentStatus;
  }

  if (cf.grossIncome && lead.grossIncome !== undefined) {
    custom[`custom.${cf.grossIncome}`] = lead.grossIncome;
  }

  if (cf.downPayment && lead.downPayment !== undefined) {
    custom[`custom.${cf.downPayment}`] = lead.downPayment;
  }

  if (cf.leadId && lead.leadId !== undefined) {
    custom[`custom.${cf.leadId}`] = lead.leadId;
  }

  if (cf.leadDate && lead.leadDate !== undefined) {
    custom[`custom.${cf.leadDate}`] = lead.leadDate;
  }

  if (cf.servedInMilitary && lead.servedInMilitary !== undefined) {
    custom[`custom.${cf.servedInMilitary}`] = lead.servedInMilitary;
  }

  if (cf.bankruptcy && lead.bankruptcy !== undefined) {
    custom[`custom.${cf.bankruptcy}`] = lead.bankruptcy;
  }

  if (cf.militaryBranch && lead.militaryBranch !== undefined) {
    custom[`custom.${cf.militaryBranch}`] = lead.militaryBranch;
  }

  if (cf.hasRealEstateAgent && lead.hasRealEstateAgent !== undefined) {
    custom[`custom.${cf.hasRealEstateAgent}`] = lead.hasRealEstateAgent;
  }

  if (cf.refinanceValue && lead.refinanceValue !== undefined) {
    custom[`custom.${cf.refinanceValue}`] = lead.refinanceValue;
  }

  if (cf.downPaymentBalance && lead.downPaymentBalance !== undefined) {
    custom[`custom.${cf.downPaymentBalance}`] = lead.downPaymentBalance;
  }

  if (cf.propertyType && lead.propertyType !== undefined) {
    custom[`custom.${cf.propertyType}`] = lead.propertyType;
  }

  if (cf.propertyUse && lead.propertyUse !== undefined) {
    custom[`custom.${cf.propertyUse}`] = lead.propertyUse;
  }

  if (cf.firstTimePurchase && lead.firstTimePurchase !== undefined) {
    custom[`custom.${cf.firstTimePurchase}`] = lead.firstTimePurchase;
  }

  if (cf.livingSituation && lead.livingSituation !== undefined) {
    custom[`custom.${cf.livingSituation}`] = lead.livingSituation;
  }

  if (cf.purchaseStatus && lead.purchaseStatus !== undefined) {
    custom[`custom.${cf.purchaseStatus}`] = lead.purchaseStatus;
  }

  if (cf.address && lead.address !== undefined) {
    custom[`custom.${cf.address}`] = lead.address;
  }

  if (cf.ipAddress && lead.ipAddress !== undefined) {
    custom[`custom.${cf.ipAddress}`] = lead.ipAddress;
  }

  return custom;
}