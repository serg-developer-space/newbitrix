
import { GoogleGenAI } from "@google/genai";

// Безопасное получение API ключа, чтобы не вызывать ошибку ReferenceError: process is not defined
const getApiKey = () => {
  try {
    return (typeof process !== 'undefined' && process.env && process.env.API_KEY) ? process.env.API_KEY : '';
  } catch (e) {
    return '';
  }
};

const apiKey = getApiKey();
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

export const generateTaskDescription = async (title: string): Promise<string> => {
  if (!ai) {
    return 'Функция AI недоступна: отсутствует API_KEY в переменной окружения.';
  }
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Сгенерируй детальное профессиональное описание задачи на русском языке для заголовка: "${title}". 
      Описание должно быть лаконичным, включать цели и возможные шаги выполнения. Используй HTML теги для форматирования (p, h3, ul, li).`,
      config: {
        temperature: 0.7,
        topP: 0.8,
        maxOutputTokens: 500,
        thinkingConfig: { thinkingBudget: 100 },
      }
    });
    return response.text || 'Описание не было сгенерировано.';
  } catch (error) {
    console.error('Gemini Error:', error);
    return 'Ошибка при генерации описания через AI.';
  }
};

export const analyzeTaskload = async (tasks: any[]): Promise<string> => {
  if (!ai) return 'Анализ недоступен без API ключа.';
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Проанализируй эти задачи и дай краткий отчет о состоянии нагрузки команды на русском языке: ${JSON.stringify(tasks)}. 
      Сделай прогноз и дай рекомендации.`,
      config: {
        temperature: 0.2,
        maxOutputTokens: 400,
        thinkingConfig: { thinkingBudget: 100 },
      }
    });
    return response.text || 'Анализ недоступен.';
  } catch (error) {
    return 'Анализ нагрузки в данный момент недоступен.';
  }
};