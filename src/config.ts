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
  creditRating: process.env.CLOSE_CF_CREDIT_RATING || "",
  propertyValue: process.env.CLOSE_CF_PROPERTY_VALUE || "",
  propertyCity: process.env.CLOSE_CF_PROPERTY_CITY || "",
  propertyZip: process.env.CLOSE_CF_PROPERTY_ZIP || "",
  propertyCountyAndState: process.env.CLOSE_CF_PROPERTY_COUNTY_AND_STATE || "",
  loanProduct: process.env.CLOSE_CF_LOAN_PRODUCT || "",
  employmentStatus: process.env.CLOSE_CF_EMPLOYMENT_STATUS || "",
  grossIncome: process.env.CLOSE_CF_GROSS_INCOME || "",
  downPayment: process.env.CLOSE_CF_DOWN_PAYMENT || "",
  },

   pollIntervalMs: Number(process.env.POLL_INTERVAL_MS) || 30000,
}