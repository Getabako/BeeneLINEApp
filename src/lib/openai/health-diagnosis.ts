import { getGenAI } from './client';
import { HEALTH_COMPREHENSIVE_PROMPT } from '@/lib/constants/prompts';
import type { HealthComprehensiveResult } from '@/types';

export async function analyzeHealthComprehensive(params: {
  height: number;
  weight: number;
  bmi: number;
  obesity_level: string;
  weight_diff: number;
  diet_history: string;
  current_concerns: string;
  program_question: string;
}): Promise<HealthComprehensiveResult> {
  const prompt = HEALTH_COMPREHENSIVE_PROMPT
    .replace('{height}', String(params.height))
    .replace('{weight}', String(params.weight))
    .replace('{bmi}', String(params.bmi))
    .replace('{obesity_level}', params.obesity_level)
    .replace('{weight_diff}', String(params.weight_diff))
    .replace('{diet_history}', params.diet_history)
    .replace('{current_concerns}', params.current_concerns)
    .replace('{program_question}', params.program_question);

  const genAI = getGenAI();
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

  const result = await model.generateContent([
    { text: prompt },
    { text: '上記の情報をもとに総合分析結果を出してください。' },
  ]);

  const content = result.response.text();
  if (!content) throw new Error('No response from Gemini');

  const cleaned = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  return JSON.parse(cleaned) as HealthComprehensiveResult;
}
