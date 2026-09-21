import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { callGemini, parseJson } from '@/lib/gemini';
import { CODE_REVIEW_SYSTEM } from '@/lib/prompts';
import { checkAndConsume } from '@/lib/limits';

export const runtime = 'nodejs';
export const maxDuration = 60;

const MAX_CHARS = 60_000;

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: { code?: string; filename?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const code = body.code?.trim() ?? '';
  const filename = body.filename?.trim() || 'script.py';

  if (code.length < 30) {
    return NextResponse.json({ error: 'Code is too short to review.' }, { status: 400 });
  }
  if (code.length > MAX_CHARS) {
    return NextResponse.json(
      { error: `Code exceeds the ${MAX_CHARS.toLocaleString()} character limit.` },
      { status: 413 }
    );
  }

  const gate = await checkAndConsume(supabase, user.id, 'review');
  if (!gate.ok) {
    return NextResponse.json({ error: gate.message, upgrade: true }, { status: 402 });
  }

  const prompt = `Review this Python file: ${filename}\n\n\`\`\`python\n${code}\n\`\`\``;

  let result: Record<string, unknown>;
  try {
    const raw = await callGemini({
      system: CODE_REVIEW_SYSTEM,
      prompt,
      json: true,
      temperature: 0.05,
    });
    result = parseJson(raw);
  } catch (e) {
    console.error('[review] gemini failed', e);
    return NextResponse.json(
      { error: 'The review engine is busy. Please try again in a moment.' },
      { status: 502 }
    );
  }

  const { data: saved } = await supabase
    .from('reviews')
    .insert({
      user_id: user.id,
      filename,
      score: typeof result.score === 'number' ? result.score : null,
      result,
    })
    .select('id')
    .single();

  return NextResponse.json({
    id: saved?.id ?? null,
    ...result,
    remaining: gate.remaining,
  });
}
