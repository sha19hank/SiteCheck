const { createClient } = require("@supabase/supabase-js");
require("dotenv").config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error("Missing Supabase credentials in .env.local");
  process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function verifyAuthTrigger() {
  const testEmail = `test.user.${Date.now()}@example.com`;
  console.log(`[1] Creating test user in auth.users: ${testEmail}...`);

  const { data: userData, error: userError } = await supabaseAdmin.auth.admin.createUser({
    email: testEmail,
    email_confirm: true,
  });

  if (userError) {
    console.error("❌ Failed to create user:", userError.message);
    process.exit(1);
  }

  const userId = userData.user.id;
  console.log(`✅ User created successfully in auth.users. ID: ${userId}`);

  console.log(`[2] Verifying on_auth_user_created trigger inserted into public.user_profiles...`);
  
  // Give the trigger a millisecond just in case, though it's synchronous in postgres
  await new Promise(r => setTimeout(r, 100));

  const { data: profileData, error: profileError } = await supabaseAdmin
    .from("user_profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (profileError || !profileData) {
    console.error("❌ Failed to find user profile. Trigger may have failed.");
    console.error(profileError);
    // Cleanup
    await supabaseAdmin.auth.admin.deleteUser(userId);
    process.exit(1);
  }

  console.log(`✅ Profile successfully found in user_profiles!`);
  console.log(profileData);

  console.log(`[3] Cleaning up test user...`);
  await supabaseAdmin.auth.admin.deleteUser(userId);
  console.log(`✅ Test user deleted. Verification complete.`);
}

verifyAuthTrigger();
