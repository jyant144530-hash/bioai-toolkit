import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const adminClient = createClient(SUPABASE_URL, SUPABASE_ROLE_KEY);
const SITE_URL = 'http://localhost:3000';

async function runTest() {
  const email = `test-${Date.now()}@edu.in`;
  const { data: userRes, error: userErr } = await adminClient.auth.admin.createUser({
    email,
    password: 'password123',
    email_confirm: true,
  });
  if (userErr) throw new Error('Failed to create user: ' + userErr.message);
  const userId = userRes.user.id;

  const authClient = createClient(SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  await authClient.auth.signInWithPassword({ email, password: 'password123' });
  const { data: { session } } = await authClient.auth.getSession();
  const cookies = `sb-${new URL(SUPABASE_URL).hostname.split('.')[0]}-auth-token=${JSON.stringify(session)}`;

  const sampleScript = `import pandas as pd\n\ndf = pd.read_csv("/Users/me/Desktop/plate_reader_export.csv")\ncontrol = df[df["sample"] == "control"]\ntreated = df[df["sample"] == "treated"]\n\nfold_change = treated["signal"].mean() / control["signal"].mean()\nprint("Fold change:", fold_change)`;

  console.log('Sending single review request...');
  const res = await fetch(`${SITE_URL}/api/review`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Cookie': cookies },
    body: JSON.stringify({ code: sampleScript })
  });
  const data = await res.json();
  
  console.log('--- RESPONSE RAW JSON ---');
  console.log(JSON.stringify(data, null, 2));

  await adminClient.auth.admin.deleteUser(userId);
}

runTest().catch(console.error);
