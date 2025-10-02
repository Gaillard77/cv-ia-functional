import type { NextApiRequest, NextApiResponse } from 'next';
import OpenAI from 'openai';

export default async function handler(req: NextApiRequest, res: NextApiResponse){
  if(req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { cvText, jobText } = req.body || {};
  if(!cvText || !jobText) return res.status(400).json({ error: 'Champs manquants' });

  try {
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const completion = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'Tu es un expert RH concis et concret.' },
        { role: 'user', content: `Optimise ce CV:\n${cvText}\n---\nPour cette offre:\n${jobText}\n` }
      ]
    });

    const text = completion.choices[0].message?.content || '';
    return res.status(200).json({
      cvOptimise: text,
      lettre: text,
      checklist: text,
      score: 75
    });
  } catch (e:any) {
    return res.status(500).json({ error: 'Erreur serveur' });
  }
}
