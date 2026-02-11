import { getGenAI } from './client';
import { HEALTH_DIAGNOSIS_PROMPT } from '@/lib/constants/prompts';
import type { HealthDiagnosisResult } from '@/types';

export async function analyzeHealth(
  age: number,
  gender: string,
  height: number,
  weight: number
): Promise<HealthDiagnosisResult> {
  const prompt = HEALTH_DIAGNOSIS_PROMPT
    .replace('{age}', String(age))
    .replace('{gender}', gender)
    .replace('{height}', String(height))
    .replace('{weight}', String(weight));

  const genAI = getGenAI();
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

  const result = await model.generateContent([
    { text: prompt },
    { text: '上記の情報をもとに健康診断結果を出してください。' },
  ]);

  const content = result.response.text();
  if (!content) throw new Error('No response from Gemini');

  const cleaned = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  return JSON.parse(cleaned) as HealthDiagnosisResult;
}
