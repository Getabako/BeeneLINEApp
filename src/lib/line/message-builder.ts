import type { SkinAnalysisResult, MealAnalysisResult, HealthDiagnosisResult } from '@/types';

// Use plain object types to avoid conflicts between @line/bot-sdk legacy and messagingApi types.
// These are compatible with messagingApi.FlexMessage at runtime.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type FlexMessageObject = any;

export function buildSkinResultMessage(result: SkinAnalysisResult): FlexMessageObject {
  return {
    type: 'flex',
    altText: `AI肌診断結果: 総合スコア ${result.overall_score}点`,
    contents: {
      type: 'bubble',
      header: {
        type: 'box',
        layout: 'vertical',
        contents: [
          { type: 'text', text: 'AI肌診断結果', weight: 'bold', size: 'lg', color: '#E91E8C' },
        ],
        backgroundColor: '#FFF0F5',
        paddingAll: '15px',
      },
      body: {
        type: 'box',
        layout: 'vertical',
        contents: [
          {
            type: 'box',
            layout: 'horizontal',
            contents: [
              { type: 'text', text: '総合スコア', size: 'sm', color: '#666666', flex: 1 },
              { type: 'text', text: `${result.overall_score}点`, size: 'lg', weight: 'bold', color: '#E91E8C', flex: 1, align: 'end' },
            ],
          },
          { type: 'separator', margin: 'md' },
          buildScoreRow('推定肌年齢', `${result.skin_age}歳`),
          buildScoreRow('水分スコア', `${result.moisture_score}/100`),
          buildScoreRow('シミ', result.spots_level),
          buildScoreRow('たるみ', result.sagging_level),
          buildScoreRow('顔型', result.face_shape),
          { type: 'separator', margin: 'md' },
          { type: 'text', text: '💡 アドバイス', weight: 'bold', size: 'sm', margin: 'md', color: '#E91E8C' },
          { type: 'text', text: result.advice, size: 'xs', color: '#444444', wrap: true, margin: 'sm' },
        ],
        paddingAll: '15px',
      },
      footer: {
        type: 'box',
        layout: 'vertical',
        contents: [
          {
            type: 'button',
            action: { type: 'postback', label: '予約する', data: 'action=reservation' },
            style: 'primary',
            color: '#E91E8C',
          },
        ],
        paddingAll: '10px',
      },
    },
  };
}

export function buildMealResultMessage(result: MealAnalysisResult): FlexMessageObject {
  return {
    type: 'flex',
    altText: `AI食事分析結果: ${result.calories}kcal`,
    contents: {
      type: 'bubble',
      header: {
        type: 'box',
        layout: 'vertical',
        contents: [
          { type: 'text', text: 'AI食事分析結果', weight: 'bold', size: 'lg', color: '#2E7D32' },
        ],
        backgroundColor: '#F0FFF0',
        paddingAll: '15px',
      },
      body: {
        type: 'box',
        layout: 'vertical',
        contents: [
          {
            type: 'box',
            layout: 'horizontal',
            contents: [
              { type: 'text', text: '推定カロリー', size: 'sm', color: '#666666', flex: 1 },
              { type: 'text', text: `${result.calories}kcal`, size: 'lg', weight: 'bold', color: '#2E7D32', flex: 1, align: 'end' },
            ],
          },
          { type: 'separator', margin: 'md' },
          buildScoreRow('タンパク質', `${result.protein}g`),
          buildScoreRow('脂質', `${result.fat}g`),
          buildScoreRow('糖質', `${result.carbs}g`),
          { type: 'separator', margin: 'md' },
          buildScoreRow('温活スコア', `${result.warmth_score}/10`),
          buildScoreRow('消化スコア', `${result.digestion_score}/10`),
          buildScoreRow('水分スコア', `${result.hydration_score}/10`),
          { type: 'separator', margin: 'md' },
          { type: 'text', text: '🍽️ 検出された食品', weight: 'bold', size: 'sm', margin: 'md', color: '#2E7D32' },
          { type: 'text', text: result.food_items.join('、'), size: 'xs', color: '#444444', wrap: true, margin: 'sm' },
          { type: 'text', text: '💡 アドバイス', weight: 'bold', size: 'sm', margin: 'md', color: '#2E7D32' },
          { type: 'text', text: result.advice, size: 'xs', color: '#444444', wrap: true, margin: 'sm' },
        ],
        paddingAll: '15px',
      },
    },
  };
}

export function buildHealthResultMessage(result: HealthDiagnosisResult): FlexMessageObject {
  return {
    type: 'flex',
    altText: `AI健康体重診断結果: BMI ${result.bmi}`,
    contents: {
      type: 'bubble',
      header: {
        type: 'box',
        layout: 'vertical',
        contents: [
          { type: 'text', text: 'AI健康体重診断結果', weight: 'bold', size: 'lg', color: '#1565C0' },
        ],
        backgroundColor: '#F0F8FF',
        paddingAll: '15px',
      },
      body: {
        type: 'box',
        layout: 'vertical',
        contents: [
          {
            type: 'box',
            layout: 'horizontal',
            contents: [
              { type: 'text', text: 'BMI', size: 'sm', color: '#666666', flex: 1 },
              { type: 'text', text: `${result.bmi}（${result.bmi_category}）`, size: 'lg', weight: 'bold', color: '#1565C0', flex: 2, align: 'end' },
            ],
          },
          { type: 'separator', margin: 'md' },
          buildScoreRow('理想体重', `${result.ideal_weight}kg`),
          buildScoreRow('目標カロリー', `${result.calorie_target}kcal/日`),
          { type: 'separator', margin: 'md' },
          { type: 'text', text: '💡 アドバイス', weight: 'bold', size: 'sm', margin: 'md', color: '#1565C0' },
          { type: 'text', text: result.advice, size: 'xs', color: '#444444', wrap: true, margin: 'sm' },
        ],
        paddingAll: '15px',
      },
      footer: {
        type: 'box',
        layout: 'vertical',
        contents: [
          {
            type: 'button',
            action: { type: 'postback', label: '予約して相談する', data: 'action=reservation' },
            style: 'primary',
            color: '#1565C0',
          },
        ],
        paddingAll: '10px',
      },
    },
  };
}

function buildScoreRow(label: string, value: string) {
  return {
    type: 'box',
    layout: 'horizontal',
    contents: [
      { type: 'text', text: label, size: 'xs', color: '#888888', flex: 1 },
      { type: 'text', text: value, size: 'sm', weight: 'bold', color: '#333333', flex: 1, align: 'end' },
    ],
    margin: 'sm',
  };
}
