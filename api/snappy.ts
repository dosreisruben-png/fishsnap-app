import type { VercelRequest, VercelResponse } from '@vercel/node';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY!;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const { prompt, page, tankId } = req.body || {};
    if (!OPENAI_API_KEY) {
      return res.status(500).json({ error: 'AI not configured' });
    }
    const r = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        // Use GPT‑3.5 Turbo instead of GPT‑4o Mini
        model: 'gpt-3.5-turbo',
        temperature: 0.2,
        messages: [
          {
            role: 'system',
            content: `You are Snappy, FishSNAP’s assistant. Be concise, safety-first. Context: page=${page || 'unknown'}, tankId=${tankId || 'none'}.`,
          },
          {
            role: 'user',
            content: prompt || 'Help with aquarium tasks.',
          },
        ],
      }),
    });
    const data = await r.json();
    const text = data?.choices?.[0]?.message?.content || 'No reply.';
    return res.status(200).json({ answer: text });
  } catch (e: any) {
    return res.status(500).json({ error: e.message });
  }
}

