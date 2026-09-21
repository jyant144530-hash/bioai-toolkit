import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const adminClient = createClient(SUPABASE_URL, SUPABASE_ROLE_KEY);

async function runTests() {
  const SITE_URL = 'http://localhost:3000';
  let passed = 0;
  let failed = 0;
  
  const report = (name, ok, msg = '') => {
    console.log(`[${ok ? 'PASS' : 'FAIL'}] ${name} ${msg ? '- ' + msg : ''}`);
    if (ok) passed++; else failed++;
  };

  // Test 1: POST /api/review with no session -> 401
  const res1 = await fetch(`${SITE_URL}/api/review`, { method: 'POST', body: JSON.stringify({}) });
  report('Test 1: No session review', res1.status === 401, `Status: ${res1.status}`);

  // Create a test user
  const email = `test-${Date.now()}@edu.in`;
  const { data: userRes, error: userErr } = await adminClient.auth.admin.createUser({
    email,
    password: 'password123',
    email_confirm: true,
  });
  if (userErr) throw new Error('Failed to create user: ' + userErr.message);
  const userId = userRes.user.id;

  // Sign in to get session cookie
  const authClient = createClient(SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  await authClient.auth.signInWithPassword({ email, password: 'password123' });
  const { data: { session } } = await authClient.auth.getSession();
  const cookies = `sb-${new URL(SUPABASE_URL).hostname.split('.')[0]}-auth-token=${JSON.stringify(session)}`;

  const fetchWithAuth = (url, body) => fetch(`${SITE_URL}${url}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Cookie': cookies },
    body: JSON.stringify(body)
  });

  // Test 2: POST /api/review with 5-char code -> 400 "too short"
  const res2 = await fetchWithAuth('/api/review', { code: 'print' });
  const data2 = await res2.json();
  report('Test 2: 5-char code', res2.status === 400 && data2.error?.includes('too short'), `Status: ${res2.status}, Error: ${data2.error}`);

  // Test 4: Submit sample script once
  const sampleScript = `import pandas as pd\n\ndf = pd.read_csv("/Users/me/Desktop/plate_reader_export.csv")\ncontrol = df[df["sample"] == "control"]\ntreated = df[df["sample"] == "treated"]\n\nfold_change = treated["signal"].mean() / control["signal"].mean()\nprint("Fold change:", fold_change)`;
  const res4 = await fetchWithAuth('/api/review', { code: sampleScript });
  const data4 = await res4.json();
  let flagsDivision = false;
  let flagsPath = false;
  if (data4.issues) {
    flagsDivision = data4.issues.some(i => i.severity === 'critical' && i.explanation.toLowerCase().includes('zero'));
    flagsPath = data4.issues.some(i => i.severity === 'reproducibility' && i.title.toLowerCase().includes('path'));
  }
  report('Test 4: Review bot flags', flagsDivision && flagsPath, `Flags division: ${flagsDivision}, Flags path: ${flagsPath}`);

  // Test 3: Submit sample script 6 times on free account -> 6th returns 402
  let got402 = false;
  for (let i = 0; i < 5; i++) {
    const r = await fetchWithAuth('/api/review', { code: sampleScript });
    if (r.status === 402) got402 = true;
  }
  report('Test 3: 6th request 402', got402, `Got 402: ${got402}`);

  // Test 5: Set period_start 40 days ago -> resets to 0
  await adminClient.from('profiles').update({ period_start: new Date(Date.now() - 40 * 86400000).toISOString() }).eq('id', userId);
  const res5 = await fetchWithAuth('/api/review', { code: sampleScript });
  const { data: prof } = await adminClient.from('profiles').select('reviews_used').eq('id', userId).single();
  report('Test 5: Period reset', res5.status === 200 && prof.reviews_used === 1, `Status: ${res5.status}, Used: ${prof.reviews_used}`);

  // Test 7: POST /api/research with asdfgh -> 400
  const res7 = await fetchWithAuth('/api/research', { query: 'asdfgh' });
  const data7 = await res7.json();
  report('Test 7: Short research query', res7.status === 400 && data7.error?.includes('specific'), `Status: ${res7.status}`);

  // Test 6: POST /api/research with Metformin...
  const res6 = await fetchWithAuth('/api/research', { query: "Metformin and Alzheimer's disease" });
  const data6 = await res6.json();
  report('Test 6: Research PMIDs', res6.status === 200 && data6.sources?.papers?.length > 0 && data6.sources.papers[0].pmid, `Papers count: ${data6.sources?.papers?.length}`);

  // Cleanup user
  await adminClient.auth.admin.deleteUser(userId);
  console.log(`\nTests finished: ${passed} Passed, ${failed} Failed`);
}

runTests().catch(console.error);
