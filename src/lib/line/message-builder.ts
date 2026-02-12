import type { SkinAnalysisResult, MealAnalysisResult, HealthDiagnosisResult, HealthComprehensiveResult } from '@/types';
import { STORES } from '@/lib/constants/menus';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type FlexMessageObject = any;

// 店舗予約カードのカルーセル
export function buildStoreCardsMessage(): FlexMessageObject {
  return {
    type: 'flex',
    altText: '店舗一覧 - ご予約はこちら',
    contents: {
      type: 'carousel',
      contents: STORES.map((store) => ({
        type: 'bubble',
        size: 'micro',
        body: {
          type: 'box',
          layout: 'vertical',
          contents: [
            { type: 'text', text: store.name, weight: 'bold', size: 'md', wrap: true },
            { type: 'text', text: store.description, size: 'xs', color: '#888888', margin: 'sm', wrap: true },
          ],
          paddingAll: '12px',
        },
        footer: {
          type: 'box',
          layout: 'vertical',
          contents: [
            {
              type: 'button',
              action: { type: 'uri', label: '予約する', uri: store.url },
              style: 'primary',
              color: '#E91E8C',
              height: 'sm',
            },
          ],
          paddingAll: '8px',
        },
      })),
    },
  };
}

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
    },
  };
}

export function buildHealthBmiMessage(data: {
  height: number;
  weight: number;
  bmi: number;
  obesity_level: string;
  ideal_weight: number;
  weight_diff: number;
}): FlexMessageObject {
  return {
    type: 'flex',
    altText: `BMI計算結果: ${data.bmi}（${data.obesity_level}）`,
    contents: {
      type: 'bubble',
      header: {
        type: 'box',
        layout: 'vertical',
        contents: [
          { type: 'text', text: 'BMI計算結果', weight: 'bold', size: 'lg', color: '#1565C0' },
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
              { type: 'text', text: `${data.bmi}`, size: 'xl', weight: 'bold', color: '#1565C0', flex: 2, align: 'end' },
            ],
          },
          {
            type: 'box',
            layout: 'horizontal',
            contents: [
              { type: 'text', text: '', flex: 1 },
              { type: 'text', text: data.obesity_level, size: 'sm', color: '#E91E8C', flex: 2, align: 'end', weight: 'bold' },
            ],
            margin: 'xs',
          },
          { type: 'separator', margin: 'md' },
          buildScoreRow('身長', `${data.height}cm`),
          buildScoreRow('体重', `${data.weight}kg`),
          buildScoreRow('理想体重', `${data.ideal_weight}kg`),
          buildScoreRow('理想体重との差', `${data.weight_diff > 0 ? '+' : ''}${data.weight_diff}kg`),
        ],
        paddingAll: '15px',
      },
    },
  };
}

export function buildHealthComprehensiveResultMessage(result: HealthComprehensiveResult): FlexMessageObject {
  return {
    type: 'flex',
    altText: 'AI総合分析結果',
    contents: {
      type: 'bubble',
      header: {
        type: 'box',
        layout: 'vertical',
        contents: [
          { type: 'text', text: 'AI総合分析結果', weight: 'bold', size: 'lg', color: '#1565C0' },
        ],
        backgroundColor: '#F0F8FF',
        paddingAll: '15px',
      },
      body: {
        type: 'box',
        layout: 'vertical',
        contents: [
          { type: 'text', text: '📊 総合分析', weight: 'bold', size: 'sm', color: '#1565C0' },
          { type: 'text', text: result.comprehensive_analysis, size: 'xs', color: '#444444', wrap: true, margin: 'sm' },
          { type: 'separator', margin: 'md' },
          { type: 'text', text: '💡 プログラム提案', weight: 'bold', size: 'sm', margin: 'md', color: '#1565C0' },
          { type: 'text', text: result.program_recommendation, size: 'xs', color: '#444444', wrap: true, margin: 'sm' },
          { type: 'separator', margin: 'md' },
          { type: 'text', text: '✨ 今日からのアドバイス', weight: 'bold', size: 'sm', margin: 'md', color: '#1565C0' },
          { type: 'text', text: result.advice, size: 'xs', color: '#444444', wrap: true, margin: 'sm' },
        ],
        paddingAll: '15px',
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
