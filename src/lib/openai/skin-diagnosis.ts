import { getGenAI } from './client';
import { SKIN_DIAGNOSIS_PROMPT } from '@/lib/constants/prompts';
import type { SkinAnalysisResult } from '@/types';

export async function analyzeSkinImage(imageBase64: string): Promise<SkinAnalysisResult> {
  const genAI = getGenAI();
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

  const result = await model.generateContent([
    { text: SKIN_DIAGNOSIS_PROMPT },
    { text: 'この顔写真を分析してください。' },
    {
      inlineData: {
        mimeType: 'image/jpeg',
        data: imageBase64,
      },
    },
  ]);

  const content = result.response.text();
  if (!content) throw new Error('No response from Gemini');

  // Remove markdown code blocks if present
  const cleaned = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  return JSON.parse(cleaned) as SkinAnalysisResult;
}
