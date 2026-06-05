import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";

const env = fs.readFileSync(".env.local", "utf8");
let supabaseUrl = "";
let supabaseKey = "";
for (const line of env.split("\n")) {
  if (line.startsWith("NEXT_PUBLIC_SUPABASE_URL=")) supabaseUrl = line.split("=")[1].trim();
  if (line.startsWith("SUPABASE_SERVICE_ROLE_KEY=")) supabaseKey = line.split("=")[1].trim();
}

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function verifySchema() {
  console.log("Verifying audits table schema...");
  
  // Try to query a row to see what columns PostgREST returns
  const { data, error } = await supabase.from('audits').select('*').limit(1);
  
  if (error) {
    console.error("❌ Failed to query audits table:", error.message);
  } else {
    if (data && data.length > 0) {
      const columns = Object.keys(data[0]);
      console.log("Columns currently visible to the API:");
      console.log(columns.join(", "));
      
      if (!columns.includes("category_audit")) {
        console.log("❌ category_audit is MISSING from the API response.");
      } else {
        console.log("✅ category_audit is PRESENT in the API response.");
      }
    } else {
      console.log("⚠️ No rows in audits table. Testing insert to check for category_audit...");
    }
  }

  // Attempt a dummy insert to specifically test the column
  const { error: insertError } = await supabase.from('audits').insert({
    id: "00000000-0000-0000-0000-000000000000",
    url: "https://schema-test.com",
    domain: "schema-test.com",
    share_token: "test_schema_token",
    scores: {},
    scraped_data: {},
    category_audit: { test: true },
    is_public: false,
    is_paid: false
  }).select();

  if (insertError) {
    if (insertError.message.includes("category_audit")) {
      console.error("❌ Insert failed specifically on category_audit column:", insertError.message);
    } else if (insertError.code === "23505") { // Unique violation, ignore
      console.log("✅ Insert unique violation (expected if testing twice), but schema accepted category_audit.");
    } else {
      console.error("❌ Insert failed:", insertError.message);
    }
  } else {
    console.log("✅ Insert succeeded with category_audit. Deleting test row...");
    await supabase.from('audits').delete().eq('id', "00000000-0000-0000-0000-000000000000");
  }
}

verifySchema();
