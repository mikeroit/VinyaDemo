import type { Lead } from "./types.js";

function normalize(input: string): string {
  return input.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
}

function extractValue(body: string, labels: string[]): string | undefined {
  const lines = normalize(body).split("\n");

  const normalizedLabels = labels.map((l) => l.toLowerCase());

  for (const line of lines) {
    const trimmed = line.trim().replace(/\*/g, "");
    const lower = trimmed.toLowerCase();

    for (const label of normalizedLabels) {
      if (lower.startsWith(label + ":")) {
        const value = trimmed.slice(label.length + 1).trim();
        if (value) return value;
      }
    }
  }

  return undefined;
}

function parseNumber(value?: string): number | undefined {
  if (!value) return undefined;
  const n = Number(value.replace(/,/g, ""));
  return isNaN(n) ? undefined : n;
}

function parseBooleanYN(value?: string): boolean | undefined {
  if (!value) return undefined;
  if (value.toUpperCase() === "Y") return true;
  if (value.toUpperCase() === "N") return false;
  return undefined;
}

function splitName(fullName?: string) {
  if (!fullName) return {};

  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 1) {
    return { firstName: parts[0] };
  }

  return {
    firstName: parts[0],
    lastName: parts.slice(1).join(" "),
  };
}

export function parseLeadFromText(body: string): Lead {
  const fullName = extractValue(body, ["Lead Name", "Name"]);
  const email = extractValue(body, ["Email", "Email Address"]);
  const phone = extractValue(body, ["Phone", "Phone Number"]);

  const { firstName, lastName } = splitName(fullName);

  return {
    // Core
    fullName,
    firstName,
    lastName,
    email,
    phone,

    // Meta
    leadId: extractValue(body, ["Lead ID"]),
    leadDate: extractValue(body, ["Lead Date"]),

    // Financial / property
    propertyValue: parseNumber(extractValue(body, ["Property Value"])),
    propertyZip: extractValue(body, ["Property Zip"]),
    propertyCountyAndState: extractValue(body, ["Property County and State"]),
    propertyCity: extractValue(body, ["Property City"]),

    // Credit
    creditRating: extractValue(body, ["Credit Rating"]),

    // Loan
    loanType: extractValue(body, ["Loan Type"]),
    loanProduct: extractValue(body, ["Loan Product"]),

    // Property
    propertyType: extractValue(body, ["Property Type"]),
    propertyUse: extractValue(body, ["Property Use"]),

    // Employment
    employmentStatus: extractValue(body, ["Employment Status"]),
    grossIncome: parseNumber(extractValue(body, ["Gross Income"])),

    // Flags
    servedInMilitary: parseBooleanYN(extractValue(body, ["Served in Military"])),
    bankruptcy: parseBooleanYN(extractValue(body, ["Bankruptcy"])),
    hasRealEstateAgent: parseBooleanYN(extractValue(body, ["Has Real Estate Agent"])),
    firstTimePurchase: parseBooleanYN(extractValue(body, ["First Time purchase"])),

    // Buying context
    livingSituation: extractValue(body, ["Living Situation"]),
    purchaseStatus: extractValue(body, ["Purchase Status"]),

    // Down payment
    downPayment: parseNumber(extractValue(body, ["Down Payment"])),
    downPaymentPercent: parseNumber(extractValue(body, ["Down Payment Percent"])),

    // Misc
    ipAddress: extractValue(body, ["IP Address"]),
  };
}