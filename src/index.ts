import express from "express";
import { config } from "./config.js";
import { runLeadIngest } from "./runLeadIngest.js";
import { exchangeCloseCodeForToken, getCloseAuthorizeUrl } from "./closeAuth.js";
import { startPolling } from "./poller.js";

const app = express();

app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.get("/close/connect", (_req, res) => {
  res.redirect(getCloseAuthorizeUrl());
});

app.get("/close/callback", async (req, res) => {
  try {
    const code = req.query.code;

    if (typeof code !== "string" || !code) {
      res.status(400).json({
        status: "error",
        message: "Missing Close OAuth code.",
      });
      return;
    }

    const token = await exchangeCloseCodeForToken(code);

    res.json({
      status: "connected",
      organizationId: token.organization_id,
      userId: token.user_id,
      scope: token.scope,
    });
  } catch (error) {
    console.error("Close OAuth callback failed:", error);

    res.status(500).json({
      status: "error",
      message: "Failed to exchange Close OAuth code.",
    });
  }
});

app.post("/run", async (_req, res) => {
  try {
    const result = await runLeadIngest();
    res.json(result);
  } catch (error) {
    console.error("Run failed:", error);

    res.status(500).json({
      status: "error",
      message: "Unexpected failure while running lead ingest.",
    });
  }
});

app.listen(config.port, () => {
  console.log(`Server running on port ${config.port}`);
  startPolling();
});