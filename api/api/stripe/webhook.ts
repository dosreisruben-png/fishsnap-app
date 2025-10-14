import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // TODO: verify signature and update user_plans in Supabase
  return res.status(200).json({ ok: true });
}
