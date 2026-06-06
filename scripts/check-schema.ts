import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSchema() {
  console.log("Verifying schema of 'audits' table...");
  
  // To get the columns, we can just do a select with limit 1
  // Or query the PostgREST openapi spec
  const { data, error } = await supabase.from('audits').select('*').limit(1);
  
  if (error) {
    console.error("Schema Verification Error:", error);
    return;
  }
  
  if (data && data.length > 0) {
    console.log("Columns present in table:");
    const columns = Object.keys(data[0]);
    console.log(columns.join('\n'));
    
    const required = [
      'website_type', 'classification_confidence', 'classification_scores',
      'classification_reasoning', 'category_audit', 'website_understanding',
      'growth_report', 'execution_timing', 'ai_logs'
    ];
    
    const missing = required.filter(c => !columns.includes(c));
    if (missing.length > 0) {
      console.log("\n❌ MISSING COLUMNS:", missing.join(', '));
    } else {
      console.log("\n✅ ALL PHASE 3 COLUMNS PRESENT.");
    }
  } else {
    console.log("No data in table to infer columns from, inserting a test row...");
    const { data: insertData, error: insertError } = await supabase.from('audits').insert({
      id: "test-schema-id-" + Date.now(),
      url: "https://test.com",
      domain: "test.com",
      share_token: "test-token",
      is_public: false,
      is_paid: false,
      execution_timing: { test: true },
      ai_logs: [{ test: true }]
    }).select('*').limit(1);

    if (insertError) {
      console.error("Insert Error (schema issue?):", insertError);
    } else if (insertData && insertData.length > 0) {
      console.log("Columns present in table (after insert):");
      console.log(Object.keys(insertData[0]).join('\n'));
      
      const required = [
        'website_type', 'classification_confidence', 'classification_scores',
        'classification_reasoning', 'category_audit', 'website_understanding',
        'growth_report', 'execution_timing', 'ai_logs'
      ];
      const columns = Object.keys(insertData[0]);
      const missing = required.filter(c => !columns.includes(c));
      if (missing.length > 0) {
        console.log("\n❌ MISSING COLUMNS:", missing.join(', '));
      } else {
        console.log("\n✅ ALL PHASE 3 COLUMNS PRESENT.");
      }
    }
  }
}

checkSchema().catch(console.error);
