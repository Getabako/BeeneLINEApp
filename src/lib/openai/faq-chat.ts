import { getGenAI } from './client';
import { FAQ_SYSTEM_PROMPT } from '@/lib/constants/prompts';

export async function getFaqResponse(userMessage: string): Promise<string> {
  const genAI = getGenAI();
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.0-flash',
    systemInstruction: FAQ_SYSTEM_PROMPT,
  });

  const result = await model.generateContent(userMessage);
  return result.response.text() ?? 'すみません、応答を生成できませんでした。';
}
