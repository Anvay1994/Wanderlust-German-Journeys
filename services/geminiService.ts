import { GoogleGenAI, Type } from "@google/genai";
import { CurriculumModule, UserProfile, GermanLevel, SuggestedResponse, MissionBriefing, ChatMessage, PerformanceReview, PracticeDrill } from "../types";

const getAiClient = () => {
  const apiKey = (import.meta as any).env?.VITE_GEMINI_API_KEY || '';
  if (!apiKey) {
    throw new Error("Missing VITE_GEMINI_API_KEY. Set it in your .env (local) or Vercel Environment Variables.");
  }
  return new GoogleGenAI({ apiKey });
};

export interface MissionResponse {
  narrative: string;
  agentMessage: string; // The German dialogue
  englishTranslation: string;
  objectivesUpdate: boolean[]; // Status of objectives
  missionStatus: 'active' | 'completed' | 'failed';
  xpAwarded: number;
  correction?: string;
  culturalNote?: string; // New field for travel facts
  objectives?: string[]; // Specific mission goals
  suggestedResponses?: SuggestedResponse[]; // Scaffolding for beginners
  performanceReview?: PerformanceReview; // End of mission summary
}

export interface GrammarLesson {
  title: string;
  explanation: string;
  example: string;
  grammarTable?: { headers: string[], rows: string[][] }; 
  commonMistakes?: string[];
}

const RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    narrative: { type: Type.STRING, description: "Atmospheric scene setting in English." },
    agentMessage: { type: Type.STRING, description: "The Local's dialogue in German." },
    englishTranslation: { type: Type.STRING, description: "Translation of the dialogue." },
    culturalNote: { type: Type.STRING, description: "A fun fact about German culture or history related to the scene." },
    objectives: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "3 specific travel goals (e.g. 'Order a cappuccino')"
    },
    suggestedResponses: {
      type: Type.ARRAY,
      description: "3 options for what the user could say next (German + English). Crucial for beginners.",
      items: {
        type: Type.OBJECT,
        properties: {
          german: { type: Type.STRING },
          english: { type: Type.STRING }
        }
      }
    },
    objectivesUpdate: { 
      type: Type.ARRAY, 
      items: { type: Type.BOOLEAN },
      description: "Boolean status of the 3 objectives."
    },
    missionStatus: { type: Type.STRING, enum: ["active", "completed", "failed"] },
    xpAwarded: { type: Type.INTEGER, description: "Miles earned this turn (0-50)." },
    correction: { type: Type.STRING, description: "Grammar/Vocab correction if needed." },
    performanceReview: {
      type: Type.OBJECT,
      description: "Only required when missionStatus is 'completed'. Analysis of user performance.",
      properties: {
        strengths: { type: Type.STRING, description: "What the user did well (grammar, vocab, politeness)." },
        weaknesses: { type: Type.STRING, description: "What to practice more." },
        feedback: { type: Type.STRING, description: "Encouraging closing remark from the guide." }
      }
    }
  },
  required: ["narrative", "agentMessage", "englishTranslation", "suggestedResponses"]
};

export const generateMissionBriefing = async (
  module: CurriculumModule
): Promise<MissionBriefing> => {
  const model = "gemini-2.5-flash"; // Supports Thinking Config
  const ai = getAiClient();
  const prompt = `
    Create a COMPREHENSIVE educational dossier for a German learner.
    This is the "Mission Prep" phase. It MUST be detailed and complete.
    
    Module: ${module.title} (${module.level})
    Grammar Focus: ${module.grammarFocus.join(', ')}
    Vocab Theme: ${module.vocabularyTheme}

    Output JSON with:
    1. missionGoal: A 1-sentence strategic objective (e.g. "Master the verb 'sein' to introduce yourself.").
    2. vocabulary: 8 essential words (German/English) relevant to the scenario.
    3. lesson:
       - title: The specific Grammar Rule name.
       - explanation: A detailed, step-by-step explanation. DO NOT truncate. Explain *how* and *when* to use it. (approx 4-5 sentences).
       - keyPoints: 3 concise bullet points.
       - example: A sentence demonstrating the rule in context.
       - grammarTable: A structured table. 'headers' (list of strings) and 'rows' (list of lists of strings).
       - commonMistakes: 2-3 common errors.
    4. keyPhrases: 4 useful sentences for the scenario.
    5. culturalFact: A fascinating tidbit about Germany.
    6. strategyTip: A specific linguistic or cultural hack to succeed in this mission (e.g., "In German, always look the person in the eye when toasting.").
    7. securityClearance: EXACTLY 5 multiple-choice questions testing the *Grammar Rule*.
       - Each question has 4 options.
       - correctAnswer is an index 0-3.
       - Include a short explanation for why the correct option is correct.
  `;

  const schema = {
    type: Type.OBJECT,
    properties: {
      missionGoal: { type: Type.STRING },
      vocabulary: {
        type: Type.ARRAY,
        items: {
           type: Type.OBJECT,
           properties: { german: { type: Type.STRING }, english: { type: Type.STRING } }
        }
      },
      lesson: {
        type: Type.OBJECT,
        properties: { 
          title: { type: Type.STRING }, 
          explanation: { type: Type.STRING },
          keyPoints: { type: Type.ARRAY, items: { type: Type.STRING } },
          example: { type: Type.STRING },
          grammarTable: {
            type: Type.OBJECT,
            properties: {
              headers: { type: Type.ARRAY, items: { type: Type.STRING } },
              rows: { type: Type.ARRAY, items: { type: Type.ARRAY, items: { type: Type.STRING } } }
            }
          },
          commonMistakes: { type: Type.ARRAY, items: { type: Type.STRING } }
        }
      },
      keyPhrases: {
        type: Type.ARRAY,
        items: {
           type: Type.OBJECT,
           properties: { german: { type: Type.STRING }, english: { type: Type.STRING } }
        }
      },
      culturalFact: { type: Type.STRING },
      strategyTip: { type: Type.STRING },
      securityClearance: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            question: { type: Type.STRING },
            options: { type: Type.ARRAY, items: { type: Type.STRING } },
            correctAnswer: { type: Type.INTEGER },
            explanation: { type: Type.STRING }
          }
        }
      }
    }
  };

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
        thinkingConfig: { thinkingBudget: 1024 } // Ensure AI thinks to generate complete content
      }
    });
    
    const data = JSON.parse(response.text || "{}");
    
    // PARTIAL RECOVERY STRATEGY
    const safeBriefing: MissionBriefing = {
        missionGoal: data.missionGoal || `Master ${module.grammarFocus[0]} to complete your mission.`,
        vocabulary: Array.isArray(data.vocabulary) ? data.vocabulary : [],
        lesson: {
            title: data.lesson?.title || module.title,
            explanation: data.lesson?.explanation || `Focus on ${module.grammarFocus[0]} and prepare for your mission.`,
            keyPoints: Array.isArray(data.lesson?.keyPoints) ? data.lesson.keyPoints : ["Review the grammar table.", "Watch out for exceptions.", "Practice the example sentence."],
            example: data.lesson?.example || "",
            grammarTable: data.lesson?.grammarTable || { headers: [], rows: [] },
            commonMistakes: Array.isArray(data.lesson?.commonMistakes) ? data.lesson.commonMistakes : []
        },
        keyPhrases: Array.isArray(data.keyPhrases) ? data.keyPhrases : [],
        culturalFact: data.culturalFact || "German is spoken by over 100 million people worldwide.",
        strategyTip: data.strategyTip || "Take your time and speak clearly.",
        quiz: data.quiz,
        securityClearance: Array.isArray(data.securityClearance) ? data.securityClearance : []
    };

    if (safeBriefing.lesson.grammarTable) {
        if (!Array.isArray(safeBriefing.lesson.grammarTable.headers) || !Array.isArray(safeBriefing.lesson.grammarTable.rows)) {
            safeBriefing.lesson.grammarTable = { headers: [], rows: [] };
        }
    }

    if (safeBriefing.vocabulary.length === 0 && safeBriefing.keyPhrases.length === 0 && !data.lesson) {
        throw new Error("Briefing data completely empty");
    }

    if (!Array.isArray(safeBriefing.securityClearance) || safeBriefing.securityClearance.length < 5) {
      safeBriefing.securityClearance = [
        ...(safeBriefing.securityClearance || []),
        {
          question: "Which option is correct?",
          options: ["Option A", "Option B", "Option C", "Option D"],
          correctAnswer: 0,
          explanation: "Fallback question. Configure the AI key to generate full clearance."
        }
      ].slice(0, 5);
    }
    
    return safeBriefing;
  } catch (e) {
    console.warn("Gemini Error or Validation Failure (using fallback):", e);
    // Hard Fallback data if API fails completely
    return {
      missionGoal: "Master the basics of communication to navigate your arrival.",
      vocabulary: [{ german: 'Hallo', english: 'Hello' }, { german: 'Danke', english: 'Thank you' }],
      lesson: { 
        title: 'Mission Basics', 
        explanation: 'German verbs change their ending depending on who is speaking (conjugation). The formal "Sie" is essential for polite interactions with strangers.', 
        keyPoints: ["Verbs change based on the person.", "Formal 'Sie' is used for strangers.", "The verb is usually in position 2."],
        example: 'Guten Tag, wie geht es Ihnen?', 
        commonMistakes: ['Forgetting to capitalize nouns', 'Mixing up Du and Sie'],
        grammarTable: {
          headers: ["Person", "Verb Ending"],
          rows: [["ich", "-e"], ["du", "-st"], ["er/sie/es", "-t"]]
        }
      },
      keyPhrases: [{ german: 'Ich möchte...', english: 'I would like...' }, { german: 'Können Sie mir helfen?', english: 'Can you help me?'}],
      culturalFact: 'Germany has over 20,000 castles and a rich history of folklore.',
      strategyTip: 'When in doubt, smile and use the formal "Sie". Politeness opens doors.',
      securityClearance: [
        { question: 'Which pronoun is used for formal address?', options: ['du', 'ihr', 'Sie', 'er'], correctAnswer: 2, explanation: 'Sie (capitalized) is the formal form.' },
        { question: 'What is the correct form of "sein" for "ich"?', options: ['bist', 'bin', 'ist', 'seid'], correctAnswer: 1, explanation: '"Ich bin" is correct.' },
        { question: 'Which word means "thank you"?', options: ['Bitte', 'Danke', 'Hallo', 'Tschüss'], correctAnswer: 1, explanation: 'Danke means thank you.' },
        { question: 'Where does the conjugated verb go in a main clause?', options: ['Last', 'Second position', 'Always first', 'Anywhere'], correctAnswer: 1, explanation: 'In main clauses, the verb is position 2.' },
        { question: 'Which article is always used for plural (nominative)?', options: ['der', 'die', 'das', 'ein'], correctAnswer: 1, explanation: 'Plural nouns use "die".' }
      ]
    };
  }
};

export const generateMissionStart = async (
  module: CurriculumModule, 
  user: UserProfile
): Promise<MissionResponse> => {
  const model = "gemini-2.5-flash";
  const ai = getAiClient();
  
  const systemPrompt = `
    You are a friendly, knowledgeable Local Guide in Germany.
    Scenario: ${module.title}.
    User Level: ${user.level}.
    
    STRICT LANGUAGE CONTROL (CEFR):
    - A1: Use ONLY Present Tense. Short, simple sentences (Subject-Verb-Object). High-frequency vocabulary.
    - A2: Use Present and simple Perfect Tense. Connectors: und, aber, oder.
    - B1+: More complex structures allowed.
    
    Goal: Start the roleplay.
    1. Set the scene in English (narrative).
    2. Initiate the dialogue in German (adhering to Level ${user.level}).
    3. Define 3 specific objectives for the user.
    4. Provide 3 Suggested Responses (Simple German sentences).
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: systemPrompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: RESPONSE_SCHEMA,
        temperature: 0.7
      }
    });

    const data = JSON.parse(response.text || "{}");
    
    if (!data.agentMessage) throw new Error("Incomplete mission data");

    return {
      ...data,
      objectivesUpdate: [false, false, false], 
      missionStatus: 'active',
      xpAwarded: 0
    };
  } catch (error) {
    console.error("Gemini Error:", error);
    throw new Error("Failed to initialize journey.");
  }
};

export const processTurn = async (
  userMessage: string,
  history: ChatMessage[], 
  module: CurriculumModule,
  currentObjectives: string[]
): Promise<MissionResponse> => {
  const model = "gemini-2.5-flash";
  const ai = getAiClient();

  const conversationHistory = history.map(msg => 
    `${msg.role === 'user' ? 'Traveler' : 'Local Guide'}: ${msg.content}`
  ).join('\n');

  const prompt = `
    Roleplay Context: ${module.title} (${module.description}).
    Current Objectives: ${JSON.stringify(currentObjectives)}.
    Module Level: ${module.level}
    
    Previous Conversation History:
    ${conversationHistory}
    
    Latest User Input: "${userMessage}"
    
    Instruction:
    - Act as the Local Guide.
    - STRICTLY adapt your German response to Level ${module.level}. (A1/A2 = Simple sentences, no complex sub-clauses).
    - If user grammar is bad, gently correct in 'correction' field, but accept the input if understandable.
    - Provide "Suggested Responses" that match the user's level (Simple for A1/A2).
    - Check if ALL objectives are met. If so, set missionStatus to "completed".
    - If missionStatus is "completed", you MUST provide a "performanceReview".

    Task:
    1. Evaluate the user's German input.
    2. Check if objectives are met.
    3. Reply as the Local Guide (Level-Appropriate).
    4. Provide 3 NEW Suggested Responses.
    5. Update missionStatus and generate review if done.
  `;

  try {
     const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: RESPONSE_SCHEMA,
        temperature: 0.5 
      }
    });

    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("Turn processing error", error);
    throw error;
  }
};

export const generatePracticeDrills = async (level: GermanLevel, topic?: string): Promise<PracticeDrill[]> => {
  const model = "gemini-2.5-flash";
  const ai = getAiClient();
  const prompt = `
    Generate 5 Training Gym challenges for a German learner (CEFR ${level}).
    ${topic ? `Focus on the grammar topic: "${topic}".` : "Cover various grammar topics appropriate for this level."}

    STRICT CEFR RULES:
    - A1: Present tense only. Very short, simple sentences. High-frequency vocab.
    - A2: Present + simple Perfect. Simple connectors (und/aber/oder).
    - B1+: More complex structures allowed, but keep it learnable.

    The 5 challenges MUST be a mix of types:
    - At least 3 are multiple-choice (type "mcq")
    - At least 1 is matching pairs (type "match")

    Output JSON Array with 5 objects matching this exact schema:
    - id: unique string
    - level: "${level}"
    - category: short category title
    - type: "mcq" | "match"
    - prompt: short instruction shown to the learner
    - correctFeedback: short helpful feedback when correct
    - wrongFeedback: short helpful feedback when wrong (what to work on)

    For type "mcq":
    - question: string
    - options: string[] (exactly 4)
    - correctIndex: number (0-3)

    For type "match":
    - leftItems: { id: string, text: string }[] (3-5 items)
    - rightItems: { id: string, text: string }[] (same count, shuffled order)
    - answerMap: Record<leftId, rightId>

    Important:
    - Make distractors plausible but clearly wrong.
    - Keep everything appropriate for CEFR ${level}.
  `;

  const schema = {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        id: { type: Type.STRING },
        level: { type: Type.STRING },
        category: { type: Type.STRING },
        type: { type: Type.STRING, enum: ["mcq", "match"] },
        prompt: { type: Type.STRING },
        question: { type: Type.STRING },
        options: { type: Type.ARRAY, items: { type: Type.STRING } },
        correctIndex: { type: Type.INTEGER },
        leftItems: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              text: { type: Type.STRING }
            }
          }
        },
        rightItems: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              text: { type: Type.STRING }
            }
          }
        },
        answerMap: { type: Type.OBJECT },
        correctFeedback: { type: Type.STRING },
        wrongFeedback: { type: Type.STRING }
      }
    }
  };

  try {
    const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: schema
        }
    });
    const drills = JSON.parse(response.text || "[]");
    return Array.isArray(drills) ? drills : [];
  } catch (e) {
      console.error(e);
      return [];
  }
};

export const generateGrammarLesson = async (level: string, topic: string): Promise<GrammarLesson> => {
  const model = "gemini-2.5-flash";
  const ai = getAiClient();
  const prompt = `
    Create a detailed Grammar Lesson for German learners.
    Level: ${level}
    Topic: ${topic}
    
    Output JSON:
    - title: Title of the lesson
    - explanation: Clear, concise explanation of the rule.
    - example: A key example sentence.
    - grammarTable: { headers: string[], rows: string[][] } for visualization.
    - commonMistakes: string[] list of common errors.
  `;
  
  const schema = {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING },
      explanation: { type: Type.STRING },
      example: { type: Type.STRING },
      grammarTable: {
        type: Type.OBJECT,
        properties: {
          headers: { type: Type.ARRAY, items: { type: Type.STRING } },
          rows: { type: Type.ARRAY, items: { type: Type.ARRAY, items: { type: Type.STRING } } }
        }
      },
      commonMistakes: { type: Type.ARRAY, items: { type: Type.STRING } }
    },
    required: ["title", "explanation", "example"]
  };

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
        thinkingConfig: { thinkingBudget: 1024 }
      }
    });
    
    const data = JSON.parse(response.text || "{}");
    if (!data.title || !data.explanation) throw new Error("Incomplete grammar lesson");
    return data;
  } catch (e) {
    console.error(e);
    return {
       title: topic,
       explanation: "Content currently unavailable. Please check back later.",
       example: "",
       commonMistakes: []
    };
  }
};
