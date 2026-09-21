import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const adminClient = createClient(SUPABASE_URL, SUPABASE_ROLE_KEY);
const SITE_URL = 'http://localhost:3000';

async function runTests() {
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

  const fetchWithAuth = (url, body) => fetch(`${SITE_URL}${url}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Cookie': cookies },
    body: JSON.stringify(body)
  });

  const sampleScript = `import pandas as pd\n\ndf = pd.read_csv("/Users/me/Desktop/plate_reader_export.csv")\ncontrol = df[df["sample"] == "control"]\ntreated = df[df["sample"] == "treated"]\n\nfold_change = treated["signal"].mean() / control["signal"].mean()\nprint("Fold change:", fold_change)`;

  console.log('Sending first request...');
  const res1 = await fetchWithAuth('/api/review', { code: sampleScript });
  const data1 = await res1.json();
  console.log('--- RESPONSE 1 RAW JSON ---');
  console.log(JSON.stringify(data1, null, 2));

  console.log('\nWaiting 65 seconds to avoid Gemini free tier rate limit (15 requests/minute)...');
  await new Promise(r => setTimeout(r, 65000));

  console.log('\nSending second request...');
  const res2 = await fetchWithAuth('/api/review', { code: sampleScript });
  const data2 = await res2.json();
  console.log('--- RESPONSE 2 RAW JSON ---');
  console.log(JSON.stringify(data2, null, 2));

  await adminClient.auth.admin.deleteUser(userId);
}

runTests().catch(console.error);
