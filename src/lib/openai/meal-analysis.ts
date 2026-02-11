import { getGenAI } from './client';
import { MEAL_ANALYSIS_PROMPT } from '@/lib/constants/prompts';
import type { MealAnalysisResult } from '@/types';

export async function analyzeMealImage(imageBase64: string): Promise<MealAnalysisResult> {
  const genAI = getGenAI();
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

  const result = await model.generateContent([
    { text: MEAL_ANALYSIS_PROMPT },
    { text: 'この食事を分析してください。' },
    {
      inlineData: {
        mimeType: 'image/jpeg',
        data: imageBase64,
      },
    },
  ]);

  const content = result.response.text();
  if (!content) throw new Error('No response from Gemini');

  const cleaned = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  return JSON.parse(cleaned) as MealAnalysisResult;
}
