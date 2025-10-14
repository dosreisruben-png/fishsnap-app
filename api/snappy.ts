import type { VercelRequest, VercelResponse } from '@vercel/node';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY!;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!OPENAI_API_KEY) {
    return res.status(500).json({ error: 'AI not configured' });
  }

  let prompt: string | undefined;
  let page = 'unknown';
  let tankId = 'none';

  if (req.method === 'POST') {
    // Body might be a string; parse if necessary
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    prompt = body?.prompt;
    page = body?.page || page;
    tankId = body?.tankId || tankId;
  } else if (req.method === 'GET') {
    // Allow GET requests for simple testing
    prompt = Array.isArray(req.query.prompt) ? req.query.prompt[0] : req.query.prompt as string;
    page = Array.isArray(req.query.page) ? req.query.page[0] : (req.query.page as string) || page;
    tankId = Array.isArray(req.query.tankId) ? req.query.tankId[0] : (req.query.tankId as string) || tankId;
  }

  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo', // use a widely available model
        temperature: 0.2,
        messages: [
          {
            role: 'system',
            content: `You are Snappy, FishSNAP’s assistant. Be concise, safety-first. Context: page=${page}, tankId=${tankId}.`,
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
      }),
    });

    const data = await response.json();
    const answer = data.choices?.[0]?.message?.content?.trim() || 'No reply.';
    return res.status(200).json({ answer });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
}


