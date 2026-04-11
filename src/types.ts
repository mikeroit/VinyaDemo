export type Lead = {
  // Required (logical, not enforced at type level)
  fullName?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;

  // Existing
  source?: string;
  message?: string;

  // New structured fields
  leadId?: string;
  leadDate?: string;

  creditRating?: string;
  propertyCountyAndState?: string;
  propertyZip?: string;
  propertyValue?: number;

  servedInMilitary?: boolean;
  bankruptcy?: boolean;
  hasRealEstateAgent?: boolean;

  loanType?: string;
  loanProduct?: string;

  propertyType?: string;
  propertyUse?: string;
  propertyCity?: string;

  employmentStatus?: string;
  grossIncome?: number;

  firstTimePurchase?: boolean;
  livingSituation?: string;
  purchaseStatus?: string;

  downPayment?: number;
  downPaymentPercent?: number;

  ipAddress?: string;
};
export type GmailMessage = {
  id: string;
  threadId?: string;
  subject?: string;
  from?: string;
  snippet?: string;
  plainTextBody?: string;
  htmlBody?: string;
};

export type CrmCreateLeadResult = {
  created: boolean;
  recordId: string;
};

export type RunLeadIngestResult =
  | {
      status: "success";
      gmailMessageId: string;
      parsedLead: Lead;
      crmResponse: CrmCreateLeadResult;
    }
  | {
      status: "no_message_found";
    }
  | {
      status: "parse_failed";
      reason: string;
    }
  | {
      status: "crm_failed";
      reason: string;
    };