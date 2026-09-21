import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { callGemini, parseJson } from '@/lib/gemini';
import { ENTITY_SYSTEM, SYNTHESIS_SYSTEM } from '@/lib/prompts';
import { searchPubMed, searchTrials, lookupCompound } from '@/lib/biomedical';
import { checkAndConsume } from '@/lib/limits';

export const runtime = 'nodejs';
export const maxDuration = 60;

type Entities = {
  drug: string | null;
  disease: string | null;
  genes: string[];
  organism: string | null;
  pubmed_query: string;
  trial_query: string;
};

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: { query?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const query = body.query?.trim() ?? '';
  if (query.length < 8) {
    return NextResponse.json(
      { error: 'Please enter a more specific research question.' },
      { status: 400 }
    );
  }

  const gate = await checkAndConsume(supabase, user.id, 'research');
  if (!gate.ok) {
    return NextResponse.json({ error: gate.message, upgrade: true }, { status: 402 });
  }

  // Step 1: entity extraction
  let entities: Entities;
  try {
    const raw = await callGemini({
      system: ENTITY_SYSTEM,
      prompt: query,
      json: true,
      temperature: 0.1,
    });
    entities = parseJson<Entities>(raw);
  } catch (e) {
    console.error('[research] entity extraction failed', e);
    return NextResponse.json({ error: 'Could not parse your query.' }, { status: 502 });
  }

  // Step 2: parallel database queries
  let [papers, trials, compound] = await Promise.all([
    searchPubMed(entities.pubmed_query || query, 15),
    searchTrials(entities.trial_query || query, 10),
    entities.drug ? lookupCompound(entities.drug) : Promise.resolve(null),
  ]);

  if (papers.length === 0) {
    const fallbackQuery = [entities.drug, entities.disease]
      .filter(Boolean)
      .join(' AND ') || query;
    console.log('[research] strict query returned 0, retrying with:', fallbackQuery);
    papers = await searchPubMed(fallbackQuery, 15);
  }

  // Filter trials: require the disease term to appear in the title or conditions
  if (entities.disease && trials.length > 0) {
    const diseaseWords = entities.disease
      .toLowerCase()
      .split(/\s+/)
      .filter((w) => w.length > 3);
    if (diseaseWords.length > 0) {
      trials = trials.filter((t) => {
        const haystack = (t.title + ' ' + t.conditions.join(' ')).toLowerCase();
        return diseaseWords.some((w) => haystack.includes(w));
      });
    }
  }

  if (papers.length === 0 && trials.length === 0) {
    return NextResponse.json(
      {
        error:
          'No results found in PubMed or ClinicalTrials.gov for this query. Try broader or different terms.',
      },
      { status: 404 }
    );
  }

  // Step 3: synthesis
  let report: Record<string, unknown>;
  try {
    const raw = await callGemini({
      system: SYNTHESIS_SYSTEM,
      prompt: JSON.stringify(
        { question: query, entities, papers, trials, compound },
        null,
        2
      ),
      json: true,
      temperature: 0.25,
    });
    report = parseJson(raw);
  } catch (e) {
    console.error('[research] synthesis failed', e);
    return NextResponse.json({ error: 'Report synthesis failed.' }, { status: 502 });
  }

  const payload = {
    ...report,
    sources: { papers, trials, compound },
  };

  const { data: saved } = await supabase
    .from('research_reports')
    .insert({ user_id: user.id, query, result: payload })
    .select('id')
    .single();

  return NextResponse.json({
    id: saved?.id ?? null,
    ...payload,
    remaining: gate.remaining,
  });
}
