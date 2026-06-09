import { runAudit } from "../lib/audit/index";
import fs from "fs";
import { loadEnvConfig } from "@next/env";
loadEnvConfig(process.cwd());

const SITES = [
  "https://github.com",
  "https://notion.so",
  "https://webflow.com",
  "https://canva.com",
  "https://youtube.com"
];

async function run() {
  const results: any = {};
  for (const url of SITES) {
    console.log(`Running ${url}...`);
    try {
      const res = await runAudit({ url });
      results[url] = {
        classification: res.classification,
        scrapeQuality: res.scrapeDiagnostics?.scrapeQuality
      };
    } catch(e: any) {
      console.error(`Failed ${url}: ${e.message}`);
    }
  }
  fs.writeFileSync("task2_diagnostics.json", JSON.stringify(results, null, 2));
  console.log("Done");
}

run().catch(console.error);
