export type Paper = {
  title: string;
  authors: string;
  journal: string;
  year: string;
  doi?: string;
  pmid?: string;
  abstract?: string;
  url: string;
};

export type Trial = {
  nctId: string;
  title: string;
  status: string;
  phase?: string;
  conditions: string[];
  url: string;
};

export type Compound = {
  name: string;
  formula?: string;
  weight?: string;
  smiles?: string;
  url: string;
};

const TIMEOUT = 12_000;

async function safeFetch(url: string, revalidate = 3600) {
  try {
    const res = await fetch(url, {
      signal: AbortSignal.timeout(TIMEOUT),
      next: { revalidate },
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function searchPubMed(query: string, limit = 15): Promise<Paper[]> {
  // Sanitize: strip apostrophes and smart quotes — Europe PMC chokes on them
  const sanitized = query
    .replace(/[\u2018\u2019\u201C\u201D']/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  const url = new URL('https://www.ebi.ac.uk/europepmc/webservices/rest/search');
  url.searchParams.set('query', sanitized);
  url.searchParams.set('format', 'json');
  url.searchParams.set('resultType', 'core');
  url.searchParams.set('pageSize', String(limit));

  const headers = {
    'User-Agent': 'BioAI-Toolkit/1.0 (mailto:hello@bioai.dev)',
    'Accept': 'application/json',
  };

  console.log('[pubmed] sanitized query:', sanitized);
  console.log('[pubmed] full URL:', url.toString());

  try {
    const res = await fetch(url.toString(), {
      headers,
      signal: AbortSignal.timeout(15000),
    });

    console.log('[pubmed] HTTP status:', res.status);

    if (!res.ok) {
      console.error('[pubmed] non-200 status:', res.status);
      return [];
    }

    const data = await res.json();

    // CRITICAL: Europe PMC returns HTTP 200 even on errors.
    // Check for errCode in the body BEFORE looking at results.
    if (data?.errCode) {
      console.error(`[pubmed] Europe PMC error: errCode=${data.errCode} errMsg=${data.errMsg}`);
      return [];
    }

    // Log the query as Europe PMC actually parsed it
    const parsedQuery = data?.request?.queryString;
    if (parsedQuery) {
      console.log('[pubmed] query AS PARSED by Europe PMC:', parsedQuery);
    }

    const hitCount = data?.hitCount ?? 0;
    const results = data?.resultList?.result ?? [];
    console.log(`[pubmed] hitCount=${hitCount} returned=${results.length}`);

    if (results.length === 0 && hitCount === 0) {
      console.warn('[pubmed] zero hits — query may be malformed. Full response keys:',
        Object.keys(data).join(', '));
    }

    return results.map((r: Record<string, any>) => ({
      title: r.title ?? '',
      authors: r.authorString ?? '',
      journal: r.journalInfo?.journal?.title ?? r.journalTitle ?? '',
      year: r.pubYear ?? '',
      doi: r.doi,
      pmid: r.pmid,
      abstract: r.abstractText?.slice(0, 1200),
      url: r.pmid
        ? `https://pubmed.ncbi.nlm.nih.gov/${r.pmid}/`
        : r.doi
          ? `https://doi.org/${r.doi}`
          : '',
    }));
  } catch (e) {
    console.error('[pubmed] fetch threw:', e);
    return [];
  }
}

export async function searchTrials(query: string, limit = 10): Promise<Trial[]> {
  const url = new URL('https://clinicaltrials.gov/api/v2/studies');
  url.searchParams.set('query.term', query);
  url.searchParams.set('pageSize', String(limit));

  const data = await safeFetch(url.toString());
  const studies = data?.studies ?? [];

  return studies.map((s: Record<string, any>) => {
    const p = s.protocolSection ?? {};
    const nctId = p.identificationModule?.nctId ?? '';
    return {
      nctId,
      title: p.identificationModule?.briefTitle ?? '',
      status: p.statusModule?.overallStatus ?? '',
      phase: p.designModule?.phases?.join(', '),
      conditions: p.conditionsModule?.conditions ?? [],
      url: `https://clinicaltrials.gov/study/${nctId}`,
    };
  });
}

export async function lookupCompound(name: string): Promise<Compound | null> {
  if (!name || name.length < 2) return null;

  const cleaned = name.trim();
  const url = `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/${encodeURIComponent(
    cleaned
  )}/property/MolecularFormula,MolecularWeight,CanonicalSMILES,IUPACName/JSON`;

  console.log('[pubchem] looking up:', cleaned);

  try {
    const res = await fetch(url, {
      signal: AbortSignal.timeout(12000),
      next: { revalidate: 86400 },
      headers: { 'User-Agent': 'BioAI-Toolkit/1.0 (mailto:hello@bioai.dev)' },
    });

    console.log('[pubchem] status:', res.status);
    if (!res.ok) return null;

    const data = await res.json();
    const p = data?.PropertyTable?.Properties?.[0];
    if (!p) {
      console.warn('[pubchem] no properties in response');
      return null;
    }

    return {
      name: cleaned,
      formula: p.MolecularFormula ?? undefined,
      weight: p.MolecularWeight ? String(p.MolecularWeight) : undefined,
      smiles: p.CanonicalSMILES ?? undefined,
      url: `https://pubchem.ncbi.nlm.nih.gov/compound/${encodeURIComponent(cleaned)}`,
    };
  } catch (e) {
    console.error('[pubchem] fetch failed:', e);
    return null;
  }
}
