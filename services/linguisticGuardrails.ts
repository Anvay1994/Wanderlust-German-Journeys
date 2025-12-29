import { GoogleGenAI, Type } from "@google/genai";
import { GermanLevel } from "../types";

export type ValidationStatus = "ACCEPT" | "ACCEPT_WITH_FEEDBACK" | "REJECT";

export type ValidationResult = {
  status: ValidationStatus;
  detected_errors: string[];
  preferred_correction: string;
  feedback: string;
};

export type GeneratedSentence = {
  sentence: string;
  cefr_level: string;
  communicative_function: string;
  register: string;
  notes?: string;
};

const getAiClient = () => {
  const apiKey = (import.meta as any).env?.VITE_GEMINI_API_KEY || '';
  if (!apiKey) return null;
  return new GoogleGenAI({ apiKey });
};

const A1_ORIGIN_REGEX = /\bich\s+bin\s+aus\s+([a-zäöüß\- ]+)\b/i;

const applyA1OriginFix = (sentence: string) => {
  const match = sentence.match(A1_ORIGIN_REGEX);
  if (!match) return null;
  const country = match[1].trim();
  if (!country) return null;
  return `Ich komme aus ${country}.`;
};

export const applyPedagogicalGuards = (sentence: string, level?: GermanLevel | string) => {
  const normalizedLevel = typeof level === 'string' ? level.toUpperCase() : level;
  if (!sentence || typeof sentence !== 'string') {
    return { sentence: '', changed: false, reason: '' };
  }

  if (normalizedLevel === GermanLevel.A1 || normalizedLevel === 'A1') {
    const corrected = applyA1OriginFix(sentence);
    if (corrected) {
      return { sentence: corrected, changed: true, reason: 'Use kommen for origin at A1.' };
    }
  }

  return { sentence, changed: false, reason: '' };
};

export const hasBlacklistedPattern = (sentence: string, level?: GermanLevel | string) => {
  const normalizedLevel = typeof level === 'string' ? level.toUpperCase() : level;
  if (normalizedLevel === GermanLevel.A1 || normalizedLevel === 'A1') {
    return A1_ORIGIN_REGEX.test(sentence);
  }
  return false;
};

export const generateGermanSentence = async (
  cefr_level: GermanLevel | string,
  communicative_function: string,
  context?: string,
  register: string = 'neutral'
): Promise<GeneratedSentence> => {
  const ai = getAiClient();
  const level = typeof cefr_level === 'string' ? cefr_level.toUpperCase() : cefr_level;

  if (!ai) {
    const fallback = level === 'A1'
      ? 'Ich bin müde.'
      : 'Ich komme aus Deutschland.';
    const guarded = applyPedagogicalGuards(fallback, level);
    return {
      sentence: guarded.sentence,
      cefr_level: level,
      communicative_function,
      register,
      notes: 'Fallback sentence used (no AI key).'
    };
  }

  const prompt = `
Generate ONE model German sentence for a learner.
CEFR level: ${level}
Communicative function: ${communicative_function}
Context: ${context || 'General travel context'}
Register: ${register}

Rules:
- The sentence must be grammatically correct, model-worthy, and level-appropriate.
- Avoid pedagogically misleading constructions (e.g., do NOT use "Ich bin aus <country>" for origin).
- Keep vocabulary simple and common for A1/A2.

Return JSON only.`;

  const schema = {
    type: Type.OBJECT,
    properties: {
      sentence: { type: Type.STRING },
      cefr_level: { type: Type.STRING },
      communicative_function: { type: Type.STRING },
      register: { type: Type.STRING },
      notes: { type: Type.STRING }
    },
    required: ['sentence']
  };

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: { responseMimeType: 'application/json', responseSchema: schema }
    });
    const data = JSON.parse(response.text || '{}') as GeneratedSentence;
    const guarded = applyPedagogicalGuards(data.sentence || '', level);
    return {
      sentence: guarded.sentence || data.sentence || '',
      cefr_level: data.cefr_level || level,
      communicative_function: data.communicative_function || communicative_function,
      register: data.register || register,
      notes: data.notes
    };
  } catch (e) {
    console.warn('[Guardrails] generateGermanSentence fallback:', e);
    const fallback = level === 'A1'
      ? 'Ich bin müde.'
      : 'Ich komme aus Deutschland.';
    const guarded = applyPedagogicalGuards(fallback, level);
    return {
      sentence: guarded.sentence,
      cefr_level: level,
      communicative_function,
      register,
      notes: 'Fallback sentence used after AI error.'
    };
  }
};

export const validateGermanSentence = async (
  sentence: string,
  cefr_level: GermanLevel | string,
  mode: 'strict' | 'lenient' | 'chat' = 'chat'
): Promise<ValidationResult> => {
  const ai = getAiClient();
  const level = typeof cefr_level === 'string' ? cefr_level.toUpperCase() : cefr_level;

  const blacklisted = applyA1OriginFix(sentence);
  if (blacklisted) {
    return {
      status: 'REJECT',
      detected_errors: ['Origin uses "sein" instead of "kommen".'],
      preferred_correction: blacklisted,
      feedback: 'Use "kommen" to talk about where you are from.'
    };
  }

  if (!ai) {
    return {
      status: 'ACCEPT_WITH_FEEDBACK',
      detected_errors: [],
      preferred_correction: '',
      feedback: 'Auto-check unavailable. Focus on clear word order and verb form.'
    };
  }

  const prompt = `
You are a strict German grammar validator for learners.
Sentence: "${sentence}"
CEFR level: ${level}
Mode: ${mode}

Output rules:
- Return JSON with keys: status, detected_errors, preferred_correction, feedback.
- status is one of: ACCEPT, ACCEPT_WITH_FEEDBACK, REJECT.
- detected_errors is an array of short strings.
- preferred_correction is a corrected model sentence (empty string if none).
- feedback is a short, encouraging explanation.

CEFR fatal thresholds:
- A1: wrong verb choice for core meaning, wrong verb conjugation for sein/haben, or wrong word order that changes meaning => REJECT.
- A2/B1: minor article or adjective ending errors may be ACCEPT_WITH_FEEDBACK if meaning is clear.
- B2+: be stricter on case/word order.

If meaning is wrong or misleading, choose REJECT and provide a corrected model sentence.
Return JSON only.`;

  const schema = {
    type: Type.OBJECT,
    properties: {
      status: { type: Type.STRING, enum: ['ACCEPT', 'ACCEPT_WITH_FEEDBACK', 'REJECT'] },
      detected_errors: { type: Type.ARRAY, items: { type: Type.STRING } },
      preferred_correction: { type: Type.STRING },
      feedback: { type: Type.STRING }
    },
    required: ['status', 'detected_errors', 'preferred_correction', 'feedback']
  };

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: { responseMimeType: 'application/json', responseSchema: schema }
    });
    const data = JSON.parse(response.text || '{}') as ValidationResult;
    return {
      status: data.status || 'ACCEPT_WITH_FEEDBACK',
      detected_errors: Array.isArray(data.detected_errors) ? data.detected_errors : [],
      preferred_correction: data.preferred_correction || '',
      feedback: data.feedback || 'Keep practicing.'
    };
  } catch (e) {
    console.warn('[Guardrails] validateGermanSentence fallback:', e);
    return {
      status: 'ACCEPT_WITH_FEEDBACK',
      detected_errors: [],
      preferred_correction: '',
      feedback: 'Auto-check unavailable. Focus on clear verb forms.'
    };
  }
};
