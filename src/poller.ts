import { config } from "./config.js";
import { runLeadIngest } from "./runLeadIngest.js";

let isRunning = false;

export function startPolling(): void {
  console.log(`Polling started. Interval: ${config.pollIntervalMs} ms`);

  setInterval(async () => {
    if (isRunning) {
      console.log("Previous poll still running. Skipping this cycle.");
      return;
    }

    isRunning = true;

    try {
      console.log("Polling cycle started...");
      const result = await runLeadIngest();
      console.log("Polling result:", JSON.stringify(result, null, 2));
    } catch (error) {
      console.error("Polling cycle failed:", error);
    } finally {
      isRunning = false;
    }
  }, config.pollIntervalMs);
}