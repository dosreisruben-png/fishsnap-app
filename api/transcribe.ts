import type { VercelRequest, VercelResponse } from '@vercel/node';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY!;
export const config = { api: { bodyParser: false } };

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).end();
  }
  try {
    if (!OPENAI_API_KEY) {
      return res.status(500).json({ error: 'AI not configured' });
    }
    const form = await (await import('formidable')).default({ multiples: false });
    form.parse(req, async (err, fields, files: any) => {
      if (err) return res.status(400).json({ error: 'upload failed' });
      const file = files?.file;
      const fd = new (require('form-data'))();
      fd.append('file', require('fs').createReadStream(file.filepath), file.originalFilename);
      fd.append('model', 'whisper-1');
      const r = await fetch('https://api.openai.com/v1/audio/transcriptions', {
        method: 'POST',
        headers: { Authorization: `Bearer ${OPENAI_API_KEY}` },
        body: fd,
      });
      const data = await r.json();
      return res.status(200).json({ text: data?.text || '' });
    });
  } catch (e: any) {
    return res.status(500).json({ error: e.message });
  }
}
