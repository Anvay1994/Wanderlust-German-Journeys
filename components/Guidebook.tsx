import React, { useState, useMemo, useEffect } from 'react';
import { 
  ArrowLeft, Volume2, Book, Hash, Type, ChevronRight, GraduationCap, AlertTriangle, Dumbbell, Mic, Eye, RefreshCw, Check, Loader2, Play, Sparkles
} from 'lucide-react';
import { GermanLevel, PracticeDrill } from '../types';
import { generatePracticeDrills, generateGrammarLesson, GrammarLesson } from '../services/geminiService';
import Button from './Button';
import { useTTS } from '../hooks/useTTS';

interface GuidebookProps {
  onBack: () => void;
  level: GermanLevel;
}

interface GrammarSection {
  id: string;
  title: string;
  level: GermanLevel; // Strict typing for filtering
  content: React.ReactNode | null; // Null means "Load dynamically"
  isDynamic?: boolean;
}

// Helper to check if content should be shown based on user level
const shouldShowContent = (contentLevel: GermanLevel, userLevel: GermanLevel): boolean => {
  const levels = [GermanLevel.A1, GermanLevel.A2, GermanLevel.B1, GermanLevel.B2, GermanLevel.C1, GermanLevel.C2];
  const contentIdx = levels.indexOf(contentLevel);
  const userIdx = levels.indexOf(userLevel);
  // Higher level users can see all lower level content
  return contentIdx <= userIdx;
};

const Guidebook: React.FC<GuidebookProps> = ({ onBack, level }) => {
  const { speak } = useTTS();
  const [activeTab, setActiveTab] = useState<'handbook' | 'alphabet' | 'numbers' | 'practice'>('handbook');
  const [selectedTopicId, setSelectedTopicId] = useState<string>('nouns-articles');

  // Drill State
  const [drills, setDrills] = useState<PracticeDrill[]>([]);
  const [loadingDrills, setLoadingDrills] = useState(false);
  const [drillError, setDrillError] = useState<string | null>(null);
  const [mcqAnswers, setMcqAnswers] = useState<Record<string, number>>({});
  const [matchAnswers, setMatchAnswers] = useState<Record<string, Record<string, string>>>({});
  const [matchChecked, setMatchChecked] = useState<Record<string, boolean>>({});

  // Dynamic Content State
  const [generatedChapters, setGeneratedChapters] = useState<Record<string, GrammarLesson>>({});
  const [loadingChapter, setLoadingChapter] = useState(false);

  // --- AUDIO & SPEECH UTILS ---
  const playAudio = (text: string) => {
    speak(text);
  };

  const handleGenerateDrills = async () => {
    setLoadingDrills(true);
    setDrills([]);
    setDrillError(null);
    try {
      const newDrills = await generatePracticeDrills(level);
      if (!Array.isArray(newDrills) || newDrills.length === 0) {
        setDrillError("Couldn't generate a workout right now. Please try again.");
      }
      setDrills(newDrills);
      setMcqAnswers({});
      setMatchAnswers({});
      setMatchChecked({});
    } catch (error) {
      console.error("Failed to generate drills", error);
      setDrillError("Couldn't generate a workout right now. Please try again.");
    } finally {
      setLoadingDrills(false);
    }
  };

  // --- EXHAUSTIVE GRAMMAR CONTENT ---
  const TEXTBOOK_CHAPTERS: GrammarSection[] = [
    // === A1 CONTENT (Static & Dynamic) ===
    {
      id: 'nouns-articles',
      title: 'A1: Nouns & Articles',
      level: GermanLevel.A1,
      content: (
        <div className="space-y-6">
          <div className="border-l-4 border-[#059669] pl-4">
            <h3 className="text-xl font-bold text-stone-800">The Gender of Nouns</h3>
            <p className="text-stone-600 mt-2">Every noun in German has a gender. It is not about biology, it's about grammar. You must learn the article along with the word.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
              <span className="block text-blue-800 font-bold mb-2">Der (Masculine)</span>
              <ul className="text-sm text-blue-900 space-y-1 list-disc pl-4">
                 <li>Male persons (Der Mann)</li>
                 <li>Days, Months, Seasons (Der Montag)</li>
                 <li>Car brands (Der BMW)</li>
                 <li>Endings: -er, -ling, -ismus</li>
              </ul>
            </div>
            <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
              <span className="block text-red-800 font-bold mb-2">Die (Feminine)</span>
              <ul className="text-sm text-red-900 space-y-1 list-disc pl-4">
                 <li>Female persons (Die Frau)</li>
                 <li>Numbers (Die Eins)</li>
                 <li>Endings: -ung, -heit, -keit, -schaft, -tät, -ion, -ie, -ei</li>
              </ul>
            </div>
            <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
              <span className="block text-green-800 font-bold mb-2">Das (Neutral)</span>
              <ul className="text-sm text-green-900 space-y-1 list-disc pl-4">
                 <li>Colors (Das Blau)</li>
                 <li>Metals (Das Gold)</li>
                 <li>Diminutives (-chen, -lein) like Das Mädchen</li>
                 <li>Verbs used as nouns (Das Essen)</li>
              </ul>
            </div>
          </div>
          <div className="bg-stone-800 text-stone-200 p-4 rounded-lg text-sm font-mono">
            <span className="text-[#059669] font-bold">PRO TIP:</span> All plural nouns use the article <strong>Die</strong> (in Nominative).
          </div>
        </div>
      ),
      isDynamic: false
    },
    {
      id: 'personal-pronouns',
      title: 'A1: Personal Pronouns',
      level: GermanLevel.A1,
      content: (
        <div className="space-y-6">
           <p className="text-stone-600">Pronouns replace nouns. They are the building blocks of sentences.</p>
           <div className="overflow-hidden border border-stone-200 rounded-lg">
             <table className="w-full text-left bg-white">
               <thead className="bg-stone-100 text-stone-600 font-bold uppercase text-xs">
                 <tr>
                   <th className="p-3">English</th>
                   <th className="p-3">German</th>
                   <th className="p-3">Context</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-stone-100 text-sm">
                 <tr><td className="p-3">I</td><td className="p-3 font-bold text-[#059669]">ich</td><td className="p-3">Self</td></tr>
                 <tr><td className="p-3">You (informal)</td><td className="p-3 font-bold text-[#059669]">du</td><td className="p-3">Friend, Child, Family</td></tr>
                 <tr><td className="p-3">He</td><td className="p-3 font-bold text-[#059669]">er</td><td className="p-3">Male</td></tr>
                 <tr><td className="p-3">She</td><td className="p-3 font-bold text-[#059669]">sie</td><td className="p-3">Female</td></tr>
                 <tr><td className="p-3">It</td><td className="p-3 font-bold text-[#059669]">es</td><td className="p-3">Neutral nouns</td></tr>
                 <tr className="bg-stone-50"><td className="p-3">We</td><td className="p-3 font-bold text-[#059669]">wir</td><td className="p-3">Group</td></tr>
                 <tr className="bg-stone-50"><td className="p-3">You (plural)</td><td className="p-3 font-bold text-[#059669]">ihr</td><td className="p-3">"Y'all" (Informal group)</td></tr>
                 <tr className="bg-stone-50"><td className="p-3">They</td><td className="p-3 font-bold text-[#059669]">sie</td><td className="p-3">Plural group</td></tr>
                 <tr className="bg-amber-50"><td className="p-3">You (Formal)</td><td className="p-3 font-bold text-amber-700">Sie</td><td className="p-3">Stranger, Boss (Always Capitalized!)</td></tr>
               </tbody>
             </table>
           </div>
        </div>
      ),
      isDynamic: false
    },
    {
      id: 'sein-haben',
      title: 'A1: Sein & Haben',
      level: GermanLevel.A1,
      content: (
        <div className="space-y-6">
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 text-yellow-800 mb-6">
             <h4 className="font-bold flex items-center gap-2"><AlertTriangle size={18} /> Critical Knowledge</h4>
             <p className="text-sm">These are the two most important verbs in German. You must memorize them immediately.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="bg-white border border-stone-200 rounded-lg p-5">
                <h3 className="text-xl font-display font-bold mb-4 text-[#059669]">Sein (To Be)</h3>
                <div className="space-y-2 text-sm">
                   <div className="flex justify-between border-b pb-1"><span>ich</span><span className="font-bold">bin</span></div>
                   <div className="flex justify-between border-b pb-1"><span>du</span><span className="font-bold">bist</span></div>
                   <div className="flex justify-between border-b pb-1"><span>er/sie/es</span><span className="font-bold">ist</span></div>
                   <div className="flex justify-between border-b pb-1"><span>wir</span><span className="font-bold">sind</span></div>
                   <div className="flex justify-between border-b pb-1"><span>ihr</span><span className="font-bold">seid</span></div>
                   <div className="flex justify-between"><span>sie/Sie</span><span className="font-bold">sind</span></div>
                </div>
             </div>
             <div className="bg-white border border-stone-200 rounded-lg p-5">
                <h3 className="text-xl font-display font-bold mb-4 text-amber-600">Haben (To Have)</h3>
                <div className="space-y-2 text-sm">
                   <div className="flex justify-between border-b pb-1"><span>ich</span><span className="font-bold">habe</span></div>
                   <div className="flex justify-between border-b pb-1"><span>du</span><span className="font-bold">hast</span></div>
                   <div className="flex justify-between border-b pb-1"><span>er/sie/es</span><span className="font-bold">hat</span></div>
                   <div className="flex justify-between border-b pb-1"><span>wir</span><span className="font-bold">haben</span></div>
                   <div className="flex justify-between border-b pb-1"><span>ihr</span><span className="font-bold">habt</span></div>
                   <div className="flex justify-between"><span>sie/Sie</span><span className="font-bold">haben</span></div>
                </div>
             </div>
          </div>
        </div>
      ),
      isDynamic: false
    },
    {
      id: 'regular-verbs',
      title: 'A1: Regular Verbs',
      level: GermanLevel.A1,
      content: (
        <div className="space-y-6">
          <p className="text-stone-600">Most verbs follow a simple pattern. Remove the "-en" ending (e.g., <em>lernen</em> → <em>lern</em>) and add the ending for the person.</p>
          <div className="bg-stone-50 p-6 rounded-lg text-center font-mono text-lg">
             E - ST - T - EN - T - EN
          </div>
          <table className="w-full text-left bg-white border border-stone-200 rounded-lg">
             <tbody className="divide-y divide-stone-100">
               <tr><td className="p-3 text-stone-500">ich</td><td className="p-3">lern<span className="text-[#059669] font-bold">-e</span></td></tr>
               <tr><td className="p-3 text-stone-500">du</td><td className="p-3">lern<span className="text-[#059669] font-bold">-st</span></td></tr>
               <tr><td className="p-3 text-stone-500">er/sie/es</td><td className="p-3">lern<span className="text-[#059669] font-bold">-t</span></td></tr>
               <tr><td className="p-3 text-stone-500">wir</td><td className="p-3">lern<span className="text-[#059669] font-bold">-en</span></td></tr>
               <tr><td className="p-3 text-stone-500">ihr</td><td className="p-3">lern<span className="text-[#059669] font-bold">-t</span></td></tr>
               <tr><td className="p-3 text-stone-500">sie/Sie</td><td className="p-3">lern<span className="text-[#059669] font-bold">-en</span></td></tr>
             </tbody>
          </table>
        </div>
      ),
      isDynamic: false
    },
    {
      id: 'negation',
      title: 'A1: Negation (Nicht/Kein)',
      level: GermanLevel.A1,
      content: (
        <div className="space-y-6">
          <p className="text-stone-600">German has two main ways to say "no" or "not".</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white border-2 border-red-100 p-4 rounded-lg">
               <h4 className="font-bold text-red-700 mb-2">Kein / Keine</h4>
               <p className="text-sm text-stone-600 mb-2">Use for <strong>Nouns</strong> (specifically indefinite nouns like 'a car' or nouns with no article).</p>
               <div className="bg-red-50 p-2 rounded text-sm italic">
                 "Ich habe <strong>kein</strong> Auto."<br/>
                 (I have no car / I don't have a car.)
               </div>
            </div>
            <div className="bg-white border-2 border-stone-200 p-4 rounded-lg">
               <h4 className="font-bold text-stone-700 mb-2">Nicht</h4>
               <p className="text-sm text-stone-600 mb-2">Use for <strong>Verbs, Adjectives, & Proper Nouns</strong>.</p>
               <div className="bg-stone-50 p-2 rounded text-sm italic">
                 "Das Auto ist <strong>nicht</strong> rot." (Adjective)<br/>
                 "Ich schlafe <strong>nicht</strong>." (Verb)
               </div>
            </div>
          </div>
        </div>
      ),
      isDynamic: false
    },
    {
      id: 'questions',
      title: 'A1: W-Questions',
      level: GermanLevel.A1,
      content: (
        <div className="space-y-6">
           <p>To ask open-ended questions, start with a W-word. The verb comes second.</p>
           <div className="grid grid-cols-2 gap-3">
              {[['Was', 'What'], ['Wer', 'Who'], ['Wo', 'Where'], ['Wie', 'How'], ['Wann', 'When'], ['Warum', 'Why']].map(([de, en]) => (
                <div key={de} className="flex justify-between items-center p-3 bg-white border border-stone-200 rounded">
                   <span className="font-bold text-[#059669] text-lg">{de}</span>
                   <span className="text-stone-400 italic">{en}</span>
                </div>
              ))}
           </div>
           <div className="mt-4 bg-emerald-50 p-4 rounded-lg border border-emerald-100">
              <span className="text-xs font-bold uppercase tracking-widest text-emerald-800">Example</span>
              <p className="text-lg text-emerald-900 mt-1"><strong>Wo</strong> <em>wohnst</em> du?</p>
              <p className="text-sm text-emerald-700">Where do you live?</p>
           </div>
        </div>
      ),
      isDynamic: false
    },
    // A1 Dynamic Extensions
    { id: 'a1-accusative', title: 'A1: The Accusative Case', level: GermanLevel.A1, content: null, isDynamic: true },
    { id: 'a1-modals', title: 'A1: Modal Verbs (Können/Müssen)', level: GermanLevel.A1, content: null, isDynamic: true },
    { id: 'a1-plural', title: 'A1: Plural Forms', level: GermanLevel.A1, content: null, isDynamic: true },
    { id: 'a1-separable', title: 'A1: Separable Verbs', level: GermanLevel.A1, content: null, isDynamic: true },
    { id: 'a1-imperative', title: 'A1: The Imperative', level: GermanLevel.A1, content: null, isDynamic: true },
    { id: 'a1-perfect', title: 'A1: Introduction to Perfect Tense', level: GermanLevel.A1, content: null, isDynamic: true },

    // === A2 CONTENT ===
     {
      id: 'sentence-structure-a2',
      title: 'A2: Sentence Structure',
      level: GermanLevel.A2,
      content: (
        <div className="space-y-6">
           <div className="border-l-4 border-amber-500 pl-4 bg-amber-50 p-4 rounded-r-lg">
             <h3 className="font-bold text-amber-900 text-lg">The Golden Rule: Position 2</h3>
             <p className="text-amber-800 text-sm mt-1">
               In a main clause, the conjugated verb MUST be the second element. No exceptions.
             </p>
           </div>
           <div className="space-y-4">
              <div className="bg-white p-3 border border-stone-200 rounded shadow-sm flex items-center gap-2">
                 <span className="bg-stone-200 px-2 py-1 rounded text-xs font-bold uppercase">Pos 1</span>
                 <span className="bg-[#059669] text-white px-2 py-1 rounded text-xs font-bold uppercase">Pos 2 (Verb)</span>
                 <span className="bg-stone-100 px-2 py-1 rounded text-xs font-bold uppercase">Rest</span>
              </div>
           </div>
        </div>
      ),
      isDynamic: false
    },
    { id: 'a2-dative', title: 'A2: The Dative Case', level: GermanLevel.A2, content: null, isDynamic: true },
    { id: 'a2-prepositions-dat', title: 'A2: Prepositions with Dative', level: GermanLevel.A2, content: null, isDynamic: true },
    { id: 'a2-prepositions-switch', title: 'A2: Two-Way Prepositions (Wechselpräpositionen)', level: GermanLevel.A2, content: null, isDynamic: true },
    { id: 'a2-past-praeteritum', title: 'A2: Simple Past (Präteritum) - Basics', level: GermanLevel.A2, content: null, isDynamic: true },
    { id: 'a2-reflexive', title: 'A2: Reflexive Verbs', level: GermanLevel.A2, content: null, isDynamic: true },
    { id: 'a2-adj-endings', title: 'A2: Adjective Endings', level: GermanLevel.A2, content: null, isDynamic: true },
    { id: 'a2-comparison', title: 'A2: Comparative & Superlative', level: GermanLevel.A2, content: null, isDynamic: true },
    { id: 'a2-subordinate', title: 'A2: Subordinate Clauses (weil/dass)', level: GermanLevel.A2, content: null, isDynamic: true },

    // === B1 CONTENT ===
    { id: 'b1-genitive', title: 'B1: The Genitive Case', level: GermanLevel.B1, content: null, isDynamic: true },
    { id: 'b1-passive-present', title: 'B1: Passive Voice (Present)', level: GermanLevel.B1, content: null, isDynamic: true },
    { id: 'b1-passive-past', title: 'B1: Passive Voice (Past)', level: GermanLevel.B1, content: null, isDynamic: true },
    { id: 'b1-relative', title: 'B1: Relative Clauses', level: GermanLevel.B1, content: null, isDynamic: true },
    { id: 'b1-infinitive-zu', title: 'B1: Infinitive with "zu"', level: GermanLevel.B1, content: null, isDynamic: true },
    { id: 'b1-prepositions-gen', title: 'B1: Prepositions with Genitive', level: GermanLevel.B1, content: null, isDynamic: true },
    { id: 'b1-konjunktiv-ii', title: 'B1: Konjunktiv II (Wishes & Politeness)', level: GermanLevel.B1, content: null, isDynamic: true },
    { id: 'b1-n-declension', title: 'B1: N-Declension', level: GermanLevel.B1, content: null, isDynamic: true },
    { id: 'b1-future', title: 'B1: Future I Tense', level: GermanLevel.B1, content: null, isDynamic: true },

    // === B2 CONTENT ===
    { id: 'b2-past-perfect', title: 'B2: Past Perfect (Plusquamperfekt)', level: GermanLevel.B2, content: null, isDynamic: true },
    { id: 'b2-passive-modal', title: 'B2: Passive with Modal Verbs', level: GermanLevel.B2, content: null, isDynamic: true },
    { id: 'b2-participles', title: 'B2: Participles as Adjectives', level: GermanLevel.B2, content: null, isDynamic: true },
    { id: 'b2-connectors', title: 'B2: Two-part Connectors (je...desto, zwar...aber)', level: GermanLevel.B2, content: null, isDynamic: true },
    { id: 'b2-verbs-prepositions', title: 'B2: Verbs with Fixed Prepositions', level: GermanLevel.B2, content: null, isDynamic: true },
    { id: 'b2-word-formation', title: 'B2: Noun Formation (Nominalization Basics)', level: GermanLevel.B2, content: null, isDynamic: true },

    // === C1 CONTENT ===
    { id: 'c1-konjunktiv-i', title: 'C1: Indirect Speech (Konjunktiv I)', level: GermanLevel.C1, content: null, isDynamic: true },
    { id: 'c1-nominal-style', title: 'C1: Nominal Style vs Verbal Style', level: GermanLevel.C1, content: null, isDynamic: true },
    { id: 'c1-participle-constructions', title: 'C1: Extended Participle Constructions', level: GermanLevel.C1, content: null, isDynamic: true },
    { id: 'c1-subjunctive-past', title: 'C1: Konjunktiv II (Past Situations)', level: GermanLevel.C1, content: null, isDynamic: true },
    { id: 'c1-advanced-passive', title: 'C1: Passive Substitutes (sein + zu, lassen)', level: GermanLevel.C1, content: null, isDynamic: true },

    // === C2 CONTENT ===
    { id: 'c2-dialects', title: 'C2: German Dialects (Bairisch, Berlinerisch)', level: GermanLevel.C2, content: null, isDynamic: true },
    { id: 'c2-particles', title: 'C2: Modal Particles (doch, mal, eben, halt)', level: GermanLevel.C2, content: null, isDynamic: true },
    { id: 'c2-rhetoric', title: 'C2: Rhetorical Devices', level: GermanLevel.C2, content: null, isDynamic: true },
    { id: 'c2-nuance', title: 'C2: Nuances in Synonyms', level: GermanLevel.C2, content: null, isDynamic: true },
    { id: 'c2-idioms', title: 'C2: Advanced Idiomatic Expressions', level: GermanLevel.C2, content: null, isDynamic: true },
  ];

  const filteredChapters = useMemo(() => {
    return TEXTBOOK_CHAPTERS.filter(ch => shouldShowContent(ch.level, level));
  }, [level]);

  // Handle Chapter Selection & Dynamic Loading
  useEffect(() => {
    const loadContent = async () => {
      const chapter = TEXTBOOK_CHAPTERS.find(c => c.id === selectedTopicId);
      if (chapter && chapter.isDynamic && !generatedChapters[selectedTopicId]) {
        setLoadingChapter(true);
        try {
           const lesson = await generateGrammarLesson(chapter.level, chapter.title);
           setGeneratedChapters(prev => ({ ...prev, [selectedTopicId]: lesson }));
        } catch (e) {
           console.error(e);
        } finally {
           setLoadingChapter(false);
        }
      }
    };
    loadContent();
  }, [selectedTopicId]);

  // --- ALPHABET DATA ---
  const ALPHABET_DATA = [
    { char: 'A', sound: 'ah' }, { char: 'B', sound: 'beh' }, { char: 'C', sound: 'tseh' }, { char: 'D', sound: 'deh' },
    { char: 'E', sound: 'eh' }, { char: 'F', sound: 'eff' }, { char: 'G', sound: 'geh' }, { char: 'H', sound: 'hah' },
    { char: 'I', sound: 'ee' }, { char: 'J', sound: 'yott' }, { char: 'K', sound: 'kah' }, { char: 'L', sound: 'ell' },
    { char: 'M', sound: 'emm' }, { char: 'N', sound: 'enn' }, { char: 'O', sound: 'oh' }, { char: 'P', sound: 'peh' },
    { char: 'Q', sound: 'koo' }, { char: 'R', sound: 'err' }, { char: 'S', sound: 'ess' }, { char: 'T', sound: 'teh' },
    { char: 'U', sound: 'oo' }, { char: 'V', sound: 'fow' }, { char: 'W', sound: 'veh' }, { char: 'X', sound: 'iks' },
    { char: 'Y', sound: 'yps' }, { char: 'Z', sound: 'tsett' }
  ];
  const SPECIAL_CHARS = [
    { char: 'Ä', sound: 'ae (like melon)' }, { char: 'Ö', sound: 'oe (like bird)' }, { char: 'Ü', sound: 'ue (round lips)' }, { char: 'ß', sound: 'ss (sharp s)' }
  ];
  const DIPHTHONGS = [
    { char: 'ei', sound: 'eye' }, { char: 'ie', sound: 'ee' }, { char: 'eu', sound: 'oy' }, { char: 'äu', sound: 'oy' }
  ];

  // --- NUMBERS DATA ---
  const NUMBERS_BASIC = [
    { n: 0, t: 'null' }, { n: 1, t: 'eins' }, { n: 2, t: 'zwei' }, { n: 3, t: 'drei' }, { n: 4, t: 'vier' },
    { n: 5, t: 'fünf' }, { n: 6, t: 'sechs' }, { n: 7, t: 'sieben' }, { n: 8, t: 'acht' }, { n: 9, t: 'neun' },
    { n: 10, t: 'zehn' }, { n: 11, t: 'elf' }, { n: 12, t: 'zwölf' }
  ];
  const NUMBERS_TEENS = [
    { n: 13, t: 'dreizehn' }, { n: 14, t: 'vierzehn' }, { n: 15, t: 'fünfzehn' }, { n: 16, t: 'sechzehn (!)' }, 
    { n: 17, t: 'siebzehn (!)' }, { n: 18, t: 'achtzehn' }, { n: 19, t: 'neunzehn' }
  ];
  const NUMBERS_TENS = [
    { n: 20, t: 'zwanzig' }, { n: 30, t: 'dreißig (!)' }, { n: 40, t: 'vierzig' }, { n: 50, t: 'fünfzig' },
    { n: 60, t: 'sechzig (!)' }, { n: 70, t: 'siebzig (!)' }, { n: 80, t: 'achtzig' }, { n: 90, t: 'neunzig' }
  ];

  return (
    <div className="h-screen bg-[#f5f5f4] text-stone-800 paper-texture flex flex-col">
      <header className="h-16 border-b border-stone-200 bg-white flex items-center justify-between px-6 shrink-0 shadow-sm z-20">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="text-stone-400 hover:text-[#059669] transition-colors">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-display font-bold text-stone-800 flex items-center gap-2">
             <Book className="text-[#059669]" /> Travel Guide ({level})
          </h1>
        </div>
      </header>

      <main className="flex-1 flex overflow-hidden">
        
        {/* SIDEBAR NAVIGATION */}
        <aside className="w-64 bg-white border-r border-stone-200 hidden md:flex flex-col">
          <div className="p-4 border-b border-stone-100">
             <h2 className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-4">Categories</h2>
             <nav className="space-y-1">
                {[
                  { id: 'handbook', icon: GraduationCap, label: 'Grammar Reference' },
                  { id: 'practice', icon: Dumbbell, label: 'Training Gym' },
                  { id: 'alphabet', icon: Type, label: 'Alphabet & Sounds' },
                  { id: 'numbers', icon: Hash, label: 'Numbers & Prices' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === tab.id ? 'bg-stone-100 text-[#059669]' : 'text-stone-600 hover:bg-stone-50'}`}
                  >
                    <tab.icon size={16} /> {tab.label}
                  </button>
                ))}
             </nav>
          </div>

          {activeTab === 'handbook' && (
             <div className="p-4 flex-1 overflow-y-auto">
                <h2 className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-4">Chapters ({filteredChapters.length})</h2>
                <div className="space-y-1">
                   {filteredChapters.map(chapter => (
                     <button
                       key={chapter.id}
                       onClick={() => setSelectedTopicId(chapter.id)}
                       className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors flex justify-between items-center ${selectedTopicId === chapter.id ? 'bg-[#059669] text-white shadow-md' : 'text-stone-600 hover:bg-stone-50'}`}
                     >
                       <span className="truncate">{chapter.title}</span>
                       {chapter.isDynamic && !generatedChapters[chapter.id] && <Sparkles size={12} className="text-amber-500" />}
                       {!chapter.isDynamic && selectedTopicId === chapter.id && <ChevronRight size={14} />}
                     </button>
                   ))}
                </div>
             </div>
          )}

          {activeTab === 'practice' && (
             <div className="p-4 flex-1 overflow-y-auto">
               <div className="bg-emerald-50 p-4 rounded-lg mb-4 text-xs text-emerald-800">
                  <h4 className="font-bold flex items-center gap-1 mb-1"><Dumbbell size={12}/> Daily Drills</h4>
                  <p>Practice sentence formation here. Speak or type to verify your skills.</p>
               </div>
             </div>
          )}
        </aside>

        {/* MAIN CONTENT AREA */}
        <div className="flex-1 overflow-y-auto p-6 md:p-12 relative">
          
          {/* MOBILE TABS */}
          <div className="md:hidden flex gap-2 mb-6 overflow-x-auto pb-2 border-b border-stone-200">
             {[
                  { id: 'handbook', icon: GraduationCap, label: 'Grammar' },
                  { id: 'practice', icon: Dumbbell, label: 'Drills' },
                  { id: 'alphabet', icon: Type, label: 'ABC' },
                  { id: 'numbers', icon: Hash, label: '123' },
             ].map(t => (
               <button 
                  key={t.id} 
                  onClick={() => setActiveTab(t.id as any)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap ${activeTab === t.id ? 'bg-[#059669] text-white' : 'bg-white text-stone-600'}`}
               >
                  <t.icon size={14} /> {t.label}
               </button>
             ))}
          </div>

          {/* GRAMMAR TAB */}
          {activeTab === 'handbook' && (
             <div className="max-w-3xl mx-auto animate-fade-in bg-white p-8 md:p-12 shadow-sm border border-stone-200 rounded-xl min-h-[600px]">
                {filteredChapters.map(chapter => {
                   if (chapter.id !== selectedTopicId) return null;
                   
                   // Dynamic Content Rendering
                   if (chapter.isDynamic) {
                      const lessonData = generatedChapters[chapter.id];
                      
                      if (loadingChapter && !lessonData) {
                         return (
                            <div key={chapter.id} className="flex flex-col items-center justify-center h-64 text-stone-400">
                               <Loader2 className="w-8 h-8 animate-spin mb-4 text-[#059669]" />
                               <p>Consulting the archives...</p>
                            </div>
                         );
                      }

                      if (lessonData) {
                         return (
                           <div key={chapter.id} className="animate-fade-in space-y-6">
                              <div className="flex items-center justify-between mb-8 border-b border-stone-100 pb-4">
                                 <h2 className="text-3xl font-display font-bold text-stone-800">{lessonData.title}</h2>
                                 <span className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest flex items-center gap-1">
                                   <Sparkles size={12}/> AI Generated
                                 </span>
                              </div>
                              
                              <p className="text-lg text-stone-700 leading-relaxed">{lessonData.explanation}</p>
                              
                              <div className="bg-emerald-50 border-l-4 border-[#059669] p-4">
                                 <span className="text-xs font-bold text-emerald-800 uppercase tracking-widest mb-1 block">Example</span>
                                 <div className="flex items-center justify-between">
                                    <span className="text-xl font-bold text-stone-800">{lessonData.example}</span>
                                    <button
                                      onClick={() => playAudio(lessonData.example)}
                                      disabled={!lessonData.example?.trim()}
                                      className={`text-[#059669] hover:text-emerald-700 ${!lessonData.example?.trim() ? 'opacity-40 cursor-not-allowed' : ''}`}
                                    >
                                      <Volume2 size={24}/>
                                    </button>
                                 </div>
                              </div>

                              {lessonData.grammarTable && (
                                 <div className="bg-stone-50 rounded-lg border border-stone-200 overflow-hidden">
                                    <table className="w-full text-left text-sm">
                                       <thead>
                                          <tr className="bg-stone-100 text-stone-600 border-b border-stone-200">
                                            {lessonData.grammarTable.headers.map((h, i) => (
                                              <th key={i} className="p-3 font-bold">{h}</th>
                                            ))}
                                          </tr>
                                       </thead>
                                       <tbody>
                                          {lessonData.grammarTable.rows.map((row, rIdx) => (
                                            <tr key={rIdx} className="border-b border-stone-100 last:border-0 hover:bg-white">
                                              {row.map((cell, cIdx) => (
                                                <td key={cIdx} className="p-3 text-stone-800 font-medium">{cell}</td>
                                              ))}
                                            </tr>
                                          ))}
                                       </tbody>
                                    </table>
                                 </div>
                              )}

                              {lessonData.commonMistakes && lessonData.commonMistakes.length > 0 && (
                                 <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                                    <h4 className="flex items-center gap-2 text-amber-800 font-bold mb-3">
                                       <AlertTriangle size={18} /> Common Mistakes
                                    </h4>
                                    <ul className="space-y-2">
                                       {lessonData.commonMistakes.map((mistake, i) => (
                                         <li key={i} className="flex gap-2 items-start text-sm text-amber-900">
                                            <span className="text-amber-500 mt-1">•</span>
                                            {mistake}
                                         </li>
                                       ))}
                                    </ul>
                                 </div>
                              )}
                           </div>
                         );
                      }
                      return null; 
                   }

                   // Static Content Rendering
                   return (
                     <div key={chapter.id}>
                        <div className="flex items-center justify-between mb-8 border-b border-stone-100 pb-4">
                           <h2 className="text-3xl font-display font-bold text-stone-800">{chapter.title}</h2>
                           <span className="bg-stone-100 text-stone-500 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest">
                             Level {chapter.level}
                           </span>
                        </div>
                        <div className="prose prose-stone max-w-none">
                           {chapter.content}
                        </div>
                     </div>
                   );
                })}
                {filteredChapters.length === 0 && (
                   <div className="text-center py-20 text-stone-400">
                      No grammar chapters available for level {level}.
                   </div>
                )}
             </div>
          )}

          {/* PRACTICE TAB (NEW & DYNAMIC) */}
          {activeTab === 'practice' && (
            <div className="max-w-3xl mx-auto animate-fade-in space-y-6">
                <header className="mb-8 flex justify-between items-end">
                   <div>
                      <h2 className="text-3xl font-display font-bold text-stone-800">Training Gym</h2>
                      <p className="text-stone-500">MCQs and matching drills tailored to Level {level}.</p>
                   </div>
                   {drills.length > 0 && (
                      <Button size="sm" variant="secondary" onClick={handleGenerateDrills} disabled={loadingDrills}>
                         <RefreshCw size={14} /> New Set
                      </Button>
                   )}
                </header>

                {loadingDrills && (
                   <div className="p-20 flex flex-col items-center justify-center text-stone-400 bg-white rounded-xl border border-stone-200">
                      <Loader2 className="w-10 h-10 animate-spin text-[#059669] mb-4" />
                      <p>Consulting language trainers...</p>
                   </div>
                )}

                {!loadingDrills && drills.length === 0 && (
                  <div className="p-16 text-center bg-white rounded-xl border border-stone-200 shadow-sm flex flex-col items-center">
                     <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center text-[#059669] mb-4">
                        <Dumbbell size={32} />
                     </div>
                     <h3 className="text-xl font-bold text-stone-800 mb-2">Ready for a workout?</h3>
                     <p className="text-stone-500 mb-6 max-w-md">Generate a personalized set of 5 challenges specifically for Level {level}.</p>
                     {drillError && (
                       <div className="mb-4 text-sm text-red-600 font-bold">{drillError}</div>
                     )}
                     <Button onClick={handleGenerateDrills} size="lg">
                        <Play size={18} fill="currentColor" /> Generate New Workout
                     </Button>
                  </div>
                )}

                {!loadingDrills && drills.map((drill) => (
                  <div key={drill.id} className="bg-white rounded-xl shadow-sm border border-stone-200 overflow-hidden animate-fade-in">
                     {/* Card Header */}
                     <div className="bg-stone-50 px-6 py-4 border-b border-stone-100 flex justify-between items-center">
                        <span className="text-xs font-bold uppercase tracking-widest text-stone-400">{drill.category}</span>
                        <span className="text-xs font-bold bg-[#059669] text-white px-2 py-0.5 rounded-full">{drill.level}</span>
                     </div>
                     
                     <div className="p-6">
                        <div className="text-xs font-bold uppercase tracking-widest text-stone-400 mb-2">{drill.prompt}</div>

                        <div className="space-y-4">
                          {drill.type === 'mcq' && (
                            <div className="space-y-3">
                              <h3 className="text-xl font-bold text-stone-800">{drill.question}</h3>
                              <div className="space-y-3">
                                {(drill.options || []).map((opt, i) => {
                                  const selected = mcqAnswers[drill.id];
                                  const isAnswered = typeof selected === 'number';
                                  const isCorrect = isAnswered && selected === drill.correctIndex;
                                  const isThisSelected = selected === i;

                                  const base = 'w-full p-4 rounded-lg text-left font-bold border-2 transition-all text-lg';
                                  const cls = isThisSelected
                                    ? (isCorrect
                                      ? 'bg-green-100 border-green-500 text-green-700'
                                      : 'bg-red-100 border-red-500 text-red-700')
                                    : 'border-stone-200 hover:border-stone-400 bg-stone-50 text-stone-800';

                                  return (
                                    <button
                                      key={i}
                                      onClick={() => setMcqAnswers(prev => ({ ...prev, [drill.id]: i }))}
                                      disabled={isAnswered}
                                      className={`${base} ${cls}`}
                                    >
                                      {opt}
                                    </button>
                                  );
                                })}
                              </div>

                              {typeof mcqAnswers[drill.id] === 'number' && (
                                <div className={`mt-3 p-4 rounded-lg border ${mcqAnswers[drill.id] === drill.correctIndex ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-amber-50 border-amber-200 text-amber-900'}`}>
                                  <div className="font-bold mb-1">
                                    {mcqAnswers[drill.id] === drill.correctIndex ? 'Correct' : 'Not quite'}
                                  </div>
                                  <div className="text-sm leading-relaxed">
                                    {mcqAnswers[drill.id] === drill.correctIndex ? drill.correctFeedback : drill.wrongFeedback}
                                  </div>
                                  <div className="mt-3 flex justify-end">
                                    <button
                                      onClick={() => setMcqAnswers(prev => {
                                        const copy = { ...prev };
                                        delete copy[drill.id];
                                        return copy;
                                      })}
                                      className="text-sm font-bold text-stone-500 hover:text-stone-800"
                                    >
                                      Try Again
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}

                          {drill.type === 'match' && (
                            <div className="space-y-4">
                              <div className="text-lg font-bold text-stone-800">Match the pairs</div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-3">
                                  {(drill.leftItems || []).map((left) => (
                                    <div key={left.id} className="p-3 bg-stone-50 border border-stone-200 rounded-lg">
                                      <div className="font-bold text-stone-800 mb-2">{left.text}</div>
                                      <select
                                        className="w-full p-2 rounded border border-stone-200 bg-white"
                                        value={(matchAnswers[drill.id] || {})[left.id] || ''}
                                        onChange={(e) => setMatchAnswers(prev => ({
                                          ...prev,
                                          [drill.id]: {
                                            ...(prev[drill.id] || {}),
                                            [left.id]: e.target.value
                                          }
                                        }))}
                                      >
                                        <option value="" disabled>Select a match...</option>
                                        {(drill.rightItems || []).map((right) => (
                                          <option key={right.id} value={right.id}>{right.text}</option>
                                        ))}
                                      </select>
                                    </div>
                                  ))}
                                </div>

                                <div className="bg-white border border-stone-200 rounded-lg p-4">
                                  <div className="text-xs font-bold uppercase tracking-widest text-stone-400 mb-3">Options</div>
                                  <ul className="space-y-2">
                                    {(drill.rightItems || []).map((right) => (
                                      <li key={right.id} className="p-2 rounded bg-stone-50 border border-stone-100 text-stone-700 font-medium">
                                        {right.text}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              </div>

                              <div className="flex items-center justify-between">
                                <button
                                  onClick={() => {
                                    setMatchAnswers(prev => ({ ...prev, [drill.id]: {} }));
                                    setMatchChecked(prev => ({ ...prev, [drill.id]: false }));
                                  }}
                                  className="text-stone-400 hover:text-stone-600 text-sm flex items-center gap-1"
                                >
                                  <RefreshCw size={14} /> Clear
                                </button>
                                <Button
                                  size="sm"
                                  variant="secondary"
                                  onClick={() => setMatchChecked(prev => ({ ...prev, [drill.id]: true }))}
                                >
                                  Check Answers
                                </Button>
                              </div>

                              {matchChecked[drill.id] && (
                                <div className="mt-2 space-y-3">
                                  {(() => {
                                    const answers = matchAnswers[drill.id] || {};
                                    const map = drill.answerMap || {};
                                    const left = drill.leftItems || [];
                                    const attempted = left.filter(l => Boolean(answers[l.id])).length;
                                    const correct = left.filter(l => answers[l.id] && answers[l.id] === map[l.id]).length;
                                    const allAnswered = left.length > 0 && attempted === left.length;
                                    const passed = allAnswered && correct === left.length;

                                    return (
                                      <div className={`p-4 rounded-lg border ${passed ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-amber-50 border-amber-200 text-amber-900'}`}>
                                        <div className="font-bold mb-1">
                                          {passed ? 'Perfect match' : `Score: ${correct}/${left.length}`}
                                        </div>
                                        <div className="text-sm leading-relaxed">
                                          {passed ? drill.correctFeedback : drill.wrongFeedback}
                                        </div>
                                      </div>
                                    );
                                  })()}
                                </div>
                              )}
                            </div>
                          )}

                        </div>
                     </div>
                  </div>
                ))}
            </div>
          )}

          {/* ALPHABET TAB */}
          {activeTab === 'alphabet' && (
             <div className="max-w-4xl mx-auto animate-fade-in space-y-8">
                <div className="bg-white p-8 rounded-xl shadow-sm border border-stone-200">
                  <h2 className="text-2xl font-display font-bold mb-6">The Alphabet</h2>
                  <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-9 gap-3">
                    {ALPHABET_DATA.map(({char, sound}) => (
                       <button key={char} onClick={() => playAudio(char)} className="aspect-square bg-stone-50 hover:bg-[#059669] hover:text-white rounded-lg flex flex-col items-center justify-center border border-stone-200 transition-colors group">
                         <span className="text-2xl font-bold">{char}</span>
                         <span className="text-[10px] text-stone-400 uppercase tracking-widest group-hover:text-emerald-100">{sound}</span>
                       </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div className="bg-white p-8 rounded-xl shadow-sm border border-stone-200">
                     <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><Type size={18} /> Umlauts & Special</h3>
                     <div className="grid grid-cols-4 gap-3">
                        {SPECIAL_CHARS.map(({char, sound}) => (
                           <button key={char} onClick={() => playAudio(char)} className="p-3 bg-emerald-50 hover:bg-emerald-100 rounded-lg text-center border border-emerald-100">
                             <span className="block text-xl font-bold text-[#059669]">{char}</span>
                           </button>
                        ))}
                     </div>
                   </div>
                   <div className="bg-white p-8 rounded-xl shadow-sm border border-stone-200">
                     <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><Volume2 size={18} /> Diphthongs</h3>
                     <div className="grid grid-cols-4 gap-3">
                        {DIPHTHONGS.map(({char, sound}) => (
                           <button key={char} onClick={() => playAudio(char)} className="p-3 bg-amber-50 hover:bg-amber-100 rounded-lg text-center border border-amber-100">
                             <span className="block text-xl font-bold text-amber-700">{char}</span>
                             <span className="text-[10px] text-amber-900">{sound}</span>
                           </button>
                        ))}
                     </div>
                   </div>
                </div>
             </div>
          )}
          
          {/* NUMBERS TAB */}
          {activeTab === 'numbers' && (
             <div className="max-w-4xl mx-auto animate-fade-in space-y-8">
                
                {/* 0 - 12 */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-stone-200">
                  <h2 className="text-lg font-bold mb-4 text-stone-500 uppercase tracking-widest text-xs">Basics (0-12)</h2>
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                     {NUMBERS_BASIC.map(({n, t}) => (
                       <button key={n} onClick={() => playAudio(t)} className="flex flex-col items-center justify-center p-3 bg-stone-50 rounded hover:bg-[#059669] hover:text-white transition-colors group">
                          <span className="font-display font-bold text-2xl">{n}</span>
                          <span className="text-xs text-stone-500 group-hover:text-emerald-100">{t}</span>
                       </button>
                     ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   {/* 13 - 19 */}
                   <div className="bg-white p-6 rounded-xl shadow-sm border border-stone-200">
                      <h2 className="text-lg font-bold mb-4 text-stone-500 uppercase tracking-widest text-xs">Teens (13-19)</h2>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                         {NUMBERS_TEENS.map(({n, t}) => (
                           <button key={n} onClick={() => playAudio(t)} className="flex flex-col items-center justify-center p-3 bg-stone-50 rounded hover:bg-[#059669] hover:text-white transition-colors group">
                              <span className="font-display font-bold text-xl">{n}</span>
                              <span className="text-xs text-stone-500 group-hover:text-emerald-100">{t}</span>
                           </button>
                         ))}
                      </div>
                   </div>
                   
                   {/* 20 - 90 */}
                   <div className="bg-white p-6 rounded-xl shadow-sm border border-stone-200">
                      <h2 className="text-lg font-bold mb-4 text-stone-500 uppercase tracking-widest text-xs">Tens (20-90)</h2>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                         {NUMBERS_TENS.map(({n, t}) => (
                           <button key={n} onClick={() => playAudio(t)} className="flex flex-col items-center justify-center p-3 bg-stone-50 rounded hover:bg-[#059669] hover:text-white transition-colors group">
                              <span className="font-display font-bold text-xl">{n}</span>
                              <span className="text-xs text-stone-500 group-hover:text-emerald-100">{t}</span>
                           </button>
                         ))}
                      </div>
                   </div>
                </div>
             </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Guidebook;
