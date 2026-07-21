// Supabase Edge Function: recognize-food
// -----------------------------------------------------------------------------
// Receives a base64 JPEG, asks Claude Haiku (vision) to identify the dish(es)
// and estimate calories + macros, and returns structured JSON. The photo is
// never stored — it lives only for the duration of this request.
//
// Deploy:
//   supabase secrets set ANTHROPIC_API_KEY=sk-ant-...
//   supabase functions deploy recognize-food
//
// Cost note: Haiku 4.5 keeps this at roughly $0.003 / photo. Uzbek/regional
// cuisine is prioritised in the prompt because global databases under-cover it.
// -----------------------------------------------------------------------------

const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY') ?? '';
const MODEL = 'claude-haiku-4-5';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const SYSTEM_PROMPT = `Ты — нутрициолог, оценивающий еду по фотографии.
Определи все блюда/продукты на фото и оцени для каждого: название (на русском),
примерный вес порции в граммах, калории (ккал) и БЖУ (белки, жиры, углеводы в граммах).
ПРИОРИТЕТ: узбекская и региональная кухня (плов, лагман, самса, манты, шурпа, нон,
чучвара, димлама, ачичук и т.д.) — учитывай типичные порции и способ приготовления
(много масла в плове и т.п.). Если не уверен — дай реалистичную оценку и понизь confidence.
Оценки приблизительные; пользователь потом их скорректирует.`;

// Structured-output schema: Haiku 4.5 supports output_config.format.
const SCHEMA = {
  type: 'object',
  additionalProperties: false,
  properties: {
    items: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        properties: {
          name: { type: 'string' },
          grams: { type: 'number' },
          macros: {
            type: 'object',
            additionalProperties: false,
            properties: {
              kcal: { type: 'number' },
              protein: { type: 'number' },
              fat: { type: 'number' },
              carbs: { type: 'number' },
            },
            required: ['kcal', 'protein', 'fat', 'carbs'],
          },
          confidence: { type: 'number' },
        },
        required: ['name', 'grams', 'macros', 'confidence'],
      },
    },
  },
  required: ['items'],
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });

  try {
    if (!ANTHROPIC_API_KEY) {
      return json({ error: 'ANTHROPIC_API_KEY not set' }, 500);
    }

    const { image } = await req.json();
    if (typeof image !== 'string' || image.length < 100) {
      return json({ error: 'missing image' }, 400);
    }

    const resp = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 1024,
        system: SYSTEM_PROMPT,
        output_config: { format: { type: 'json_schema', schema: SCHEMA } },
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'image',
                source: { type: 'base64', media_type: 'image/jpeg', data: image },
              },
              { type: 'text', text: 'Определи блюда и оцени калории и БЖУ.' },
            ],
          },
        ],
      }),
    });

    if (!resp.ok) {
      const detail = await resp.text();
      return json({ error: 'anthropic_error', detail }, 502);
    }

    const data = await resp.json();
    // With structured outputs the text block holds valid JSON matching SCHEMA.
    const text = (data.content ?? []).find((b: { type: string }) => b.type === 'text')?.text ?? '{}';
    const parsed = JSON.parse(text);

    return json({ items: parsed.items ?? [] }, 200);
  } catch (e) {
    return json({ error: 'internal', detail: String(e) }, 500);
  }
});

function json(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS, 'content-type': 'application/json' },
  });
}
