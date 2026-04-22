import dotenv from "dotenv";

dotenv.config();

export const config = {
  port: Number(process.env.PORT) || 3000,
  gmailQuery: process.env.GMAIL_QUERY || "is:unread",
  gmailCredentialsPath: process.env.GMAIL_CREDENTIALS_PATH || "credentials.json",
  gmailTokenPath: process.env.GMAIL_TOKEN_PATH || "token.json",

  closeClientId: process.env.CLOSE_CLIENT_ID || "",
  closeClientSecret: process.env.CLOSE_CLIENT_SECRET || "",
  closeRedirectUri: process.env.CLOSE_REDIRECT_URI || "http://localhost:3000/close/callback",
  closeTokenPath: process.env.CLOSE_TOKEN_PATH || "close-token.json",

  closeCustomFields: {
    leadId: process.env.CLOSE_CF_LEAD_ID || "",
    leadDate: process.env.CLOSE_CF_LEAD_DATE || "",
    creditRating: process.env.CLOSE_CF_CREDIT_RATING || "",
    propertyCountyAndState: process.env.CLOSE_CF_PROPERTY_COUNTY_AND_STATE || "",
    propertyZip: process.env.CLOSE_CF_PROPERTY_ZIP || "",
    propertyValue: process.env.CLOSE_CF_PROPERTY_VALUE || "",
    propertyCity: process.env.CLOSE_CF_PROPERTY_CITY || "",
    propertyType: process.env.CLOSE_CF_PROPERTY_TYPE || "",
    propertyUse: process.env.CLOSE_CF_PROPERTY_USE || "",
    servedInMilitary: process.env.CLOSE_CF_SERVED_IN_MILITARY || "",
    bankruptcy: process.env.CLOSE_CF_BANKRUPTCY || "",
    militaryBranch: process.env.CLOSE_CF_MILITARY_BRANCH || "",
    hasRealEstateAgent: process.env.CLOSE_CF_HAS_REAL_ESTATE_AGENT || "",
    refinanceValue: process.env.CLOSE_CF_REFINANCE_VALUE || "",
    downPaymentBalance: process.env.CLOSE_CF_DOWN_PAYMENT_BALANCE || "",
    loanProduct: process.env.CLOSE_CF_LOAN_PRODUCT || "",
    employmentStatus: process.env.CLOSE_CF_EMPLOYMENT_STATUS || "",
    grossIncome: process.env.CLOSE_CF_GROSS_INCOME || "",
    firstTimePurchase: process.env.CLOSE_CF_FIRST_TIME_PURCHASE || "",
    livingSituation: process.env.CLOSE_CF_LIVING_SITUATION || "",
    purchaseStatus: process.env.CLOSE_CF_PURCHASE_STATUS || "",
    downPayment: process.env.CLOSE_CF_DOWN_PAYMENT || "",
    address: process.env.CLOSE_CF_ADDRESS || "",
    ipAddress: process.env.CLOSE_CF_IP_ADDRESS || "",
  },

   pollIntervalMs: Number(process.env.POLL_INTERVAL_MS) || 30000,
}