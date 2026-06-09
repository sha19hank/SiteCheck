import { runAudit } from "../lib/audit/index";
import fs from "fs";
import { loadEnvConfig } from "@next/env";
loadEnvConfig(process.cwd());

const SITES = [
  { url: "https://github.com", name: "github" },
  { url: "https://canva.com", name: "canva" },
  { url: "https://notion.so", name: "notion" },
  { url: "https://aliabdaal.com", name: "ali_abdaal" }
];

const ARTIFACT_DIR = "C:/Users/KIIT0001/.gemini/antigravity-ide/brain/072c3184-1014-432f-ac73-07caf9204e82/scratch";

async function testPhase4() {
  console.log("Running Phase 4 Benchmark...\n");
  
  if (!fs.existsSync(ARTIFACT_DIR)) {
    fs.mkdirSync(ARTIFACT_DIR, { recursive: true });
  }

  for (const site of SITES) {
    console.log(`Auditing: ${site.url}...`);
    try {
      const record = await runAudit({ url: site.url });
      
      const filename = `${ARTIFACT_DIR}/${site.name}_consultant.json`;
      fs.writeFileSync(filename, JSON.stringify(record.consultantReport, null, 2));
      console.log(`Saved consultant report to ${filename}`);
      
    } catch (err: any) {
      console.error(`Audit failed for ${site.url}:`, err.message);
    }
  }

  console.log("Phase 4 deliverables generated.");
}

testPhase4().catch(console.error);
