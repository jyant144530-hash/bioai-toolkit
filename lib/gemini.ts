const MODELS = [
  { name: 'gemini-3.1-flash-lite', thinkingLevel: 'default' },
  { name: 'gemini-3-flash', thinkingLevel: 'high' },
  { name: 'gemini-2.5-flash-lite', thinkingLevel: 'default' },
];

export async function callGemini({
  system,
  prompt,
  json = false,
  temperature = 0.2,
  maxRetriesPerModel = 1,
}: {
  system?: string;
  prompt: string;
  json?: boolean;
  temperature?: number;
  maxRetriesPerModel?: number;
}): Promise<string> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error('GEMINI_API_KEY is not set');

  let lastErr: unknown;

  for (const model of MODELS) {
    for (let attempt = 0; attempt <= maxRetriesPerModel; attempt++) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model.name}:generateContent?key=${key}`;

        const generationConfig: Record<string, unknown> = {
          temperature,
          maxOutputTokens: 8192,
          ...(json ? { responseMimeType: 'application/json' } : {}),
        };

        // Add thinkingLevel only for models that support it
        if (model.thinkingLevel && model.thinkingLevel !== 'default') {
          generationConfig.thinkingLevel = model.thinkingLevel;
        }

        const body: Record<string, unknown> = {
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig,
        };
        
        if (system) body.systemInstruction = { parts: [{ text: system }] };

        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
          signal: AbortSignal.timeout(45000),
        });

        // 503 = model overloaded, 429 = rate limited. Try next model.
        if (res.status === 503 || res.status === 429) {
          lastErr = new Error(`${model.name} returned ${res.status}`);
          const jitter = Math.random() * 500;
          await new Promise((r) => setTimeout(r, 1000 * 2 ** attempt + jitter));
          continue;
        }

        // 404 = model doesn't exist. Skip to next model immediately.
        if (res.status === 404) {
          lastErr = new Error(`${model.name} not found (404)`);
          break;
        }

        if (!res.ok) {
          lastErr = new Error(`${model.name} ${res.status}: ${await res.text()}`);
          break;
        }

        const data = await res.json();
        const text =
          data?.candidates?.[0]?.content?.parts
            ?.map((p: { text?: string }) => p.text ?? '')
            .join('') ?? '';

        if (!text) {
          lastErr = new Error(`${model.name} returned empty response`);
          break;
        }

        console.log(`[gemini] success with ${model.name}`);
        return text;
      } catch (e) {
        lastErr = e;
        if (attempt === maxRetriesPerModel) break;
        const jitter = Math.random() * 500;
        await new Promise((r) => setTimeout(r, 1000 * 2 ** attempt + jitter));
      }
    }
  }

  throw lastErr instanceof Error
    ? lastErr
    : new Error('All Gemini models failed');
}

export function parseJson<T>(raw: string): T {
  const cleaned = raw
    .trim()
    .replace(/^```(?:json)?/i, '')
    .replace(/```$/, '')
    .trim();
  try {
    return JSON.parse(cleaned) as T;
  } catch {
    const start = cleaned.indexOf('{');
    const end = cleaned.lastIndexOf('}');
    if (start !== -1 && end > start) {
      return JSON.parse(cleaned.slice(start, end + 1)) as T;
    }
    throw new Error('Model did not return valid JSON');
  }
}
