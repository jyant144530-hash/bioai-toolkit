import type { SupabaseClient } from '@supabase/supabase-js';

const FREE_LIMITS = { review: 5, research: 3 } as const;
const PERIOD_DAYS = 30;

export type GateResult =
  | { ok: true; remaining: number }
  | { ok: false; message: string };

export async function checkAndConsume(
  supabase: SupabaseClient,
  userId: string,
  kind: 'review' | 'research'
): Promise<GateResult> {
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('tier, reviews_used, research_used, period_start')
    .eq('id', userId)
    .single();

  if (error || !profile) return { ok: false, message: 'Profile not found' };

  const daysSince =
    (Date.now() - new Date(profile.period_start).getTime()) / 86_400_000;

  let used = kind === 'review' ? profile.reviews_used : profile.research_used;

  if (daysSince > PERIOD_DAYS) {
    await supabase
      .from('profiles')
      .update({
        reviews_used: 0,
        research_used: 0,
        period_start: new Date().toISOString(),
      })
      .eq('id', userId);
    used = 0;
  }

  if (profile.tier === 'pro') return { ok: true, remaining: Infinity };

  const limit = FREE_LIMITS[kind];
  if (used >= limit) {
    return {
      ok: false,
      message: `Free plan limit reached (${limit} per month). Upgrade to Student Pro for unlimited access.`,
    };
  }

  await supabase
    .from('profiles')
    .update(
      kind === 'review'
        ? { reviews_used: used + 1 }
        : { research_used: used + 1 }
    )
    .eq('id', userId);

  return { ok: true, remaining: limit - used - 1 };
}
