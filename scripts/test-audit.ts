// Removed dotenv

import { runAudit } from "../lib/audit/index";

async function testAudit() {
  console.log("Running full audit for timing and AI log validation...");
  const url = "https://github.com";
  
  const originalEnv = process.env.NODE_ENV;
  // Make sure we have a key
  
  try {
    const record = await runAudit({ url });
    
    console.log("\n=== EXECUTION TIMING ===");
    console.log(JSON.stringify(record.executionTiming, null, 2));
    
    console.log("\n=== AI LOGS (SUCCESS) ===");
    console.log(JSON.stringify(record.aiLogs, null, 2));

    console.log("\n=== SIMULATING AI FAILURE ===");
    const originalKey = process.env.GEMINI_API_KEY;
    process.env.GEMINI_API_KEY = "invalid-key";
    
    const recordFail = await runAudit({ url });
    console.log("\n=== AI LOGS (FAILED) ===");
    console.log(JSON.stringify(recordFail.aiLogs, null, 2));
    
    // Restore
    process.env.GEMINI_API_KEY = originalKey;
    
  } catch (err) {
    console.error("Audit failed:", err);
  }
}

testAudit().catch(console.error);
