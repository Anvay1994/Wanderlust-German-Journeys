import React, { useState, useMemo, useEffect } from 'react';
import { 
  ArrowLeft, Volume2, Book, Hash, Type, ChevronRight, GraduationCap, AlertTriangle, Dumbbell, Mic, Eye, RefreshCw, Check, Loader2, Play, Sparkles
} from 'lucide-react';
import { GermanLevel, PracticeDrill } from '../types';
import { generatePracticeDrills, generateGrammarLesson, GrammarLesson } from '../services/geminiService';
import Button from './Button';

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
  return contentIdx <= userIdx;
};

const Guidebook: React.FC<GuidebookProps> = ({ onBack, level }) => {
  const [activeTab, setActiveTab] = useState<'handbook' | 'alphabet' | 'numbers' | 'practice'>('handbook');
  const [selectedTopicId, setSelectedTopicId] = useState<string>('nouns-articles');

  // Drill State
  const [drills, setDrills] = useState<PracticeDrill[]>([]);
  const [loadingDrills, setLoadingDrills] = useState(false);
  const [revealedDrill, setRevealedDrill] = useState<string | null>(null);
  const [userDrillInputs, setUserDrillInputs] = useState<Record<string, string>>({});
  const [listeningDrillId, setListeningDrillId] = useState<string | null>(null);

  // Dynamic Content State
  const [generatedChapters, setGeneratedChapters] = useState<Record<string, GrammarLesson>>({});
  const [loadingChapter, setLoadingChapter] = useState(false);

  // --- AUDIO & SPEECH UTILS ---
  const playAudio = (text: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'de-DE';
    window.speechSynthesis.speak(utterance);
  };

  const startListening = (drillId: string) => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.lang = 'de-DE';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      setListeningDrillId(drillId);

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setUserDrillInputs(prev => ({
          ...prev,
          [drillId]: transcript
        }));
        setListeningDrillId(null);
      };

      recognition.onerror = () => {
        setListeningDrillId(null);
        alert("Microphone access needed for oral practice.");
      };

      recognition.onend = () => setListeningDrillId(null);

      recognition.start();
    } else {
      alert("Speech recognition not supported in this browser. Please use Chrome/Edge.");
    }
  };

  const handleGenerateDrills = async () => {
    setLoadingDrills(true);
    setDrills([]);
    try {
      const newDrills = await generatePracticeDrills(level);
      setDrills(newDrills);
      // Reset inputs
      setUserDrillInputs({});
      setRevealedDrill(null);
    } catch (error) {
      console.error("Failed to generate drills", error);
    } finally {
      setLoadingDrills(false);
    }
  };

  // --- EXHAUSTIVE GRAMMAR CONTENT ---
  const TEXTBOOK_CHAPTERS: GrammarSection[] = [
    // === A1 CONTENT ===
    {
      id: 'nouns-articles',
      title: '1. Nouns & Articles',
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
      )
    },
    {
      id: 'personal-pronouns',
      title: '2. Personal Pronouns',
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
      )
    },
    {
      id: 'sein-haben',
      title: '3. Sein & Haben',
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
      )
    },
    {
      id: 'regular-verbs',
      title: '4. Regular Verbs',
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
      )
    },
    {
      id: 'negation',
      title: '5. Negation (Nicht vs Kein)',
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
      )
    },
    {
      id: 'questions',
      title: '6. W-Questions',
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
      )
    },
    // A2 Placeholder (Sentence structure, etc.)
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
      )
    },
    // B1 Dynamic Topics
    { id: 'b1-prepositions', title: 'B1: Genitive Prepositions', level: GermanLevel.B1, content: null, isDynamic: true },
    { id: 'b1-adjectives', title: 'B1: Adjective Endings', level: GermanLevel.B1, content: null, isDynamic: true },
    { id: 'b1-future', title: 'B1: Future I', level: GermanLevel.B1, content: null, isDynamic: true },
    // B2 Dynamic Topics
    { id: 'b2-passive', title: 'B2: Passive Voice', level: GermanLevel.B2, content: null, isDynamic: true },
    { id: 'b2-indirect', title: 'B2: Indirect Speech', level: GermanLevel.B2, content: null, isDynamic: true },
    // C1 Dynamic Topics
    { id: 'c1-nominalization', title: 'C1: Nominalization', level: GermanLevel.C1, content: null, isDynamic: true },
    { id: 'c1-subjunctive', title: 'C1: Konjunktiv I', level: GermanLevel.C1, content: null, isDynamic: true },
    // C2 Dynamic Topics
    { id: 'c2-dialects', title: 'C2: Dialects & Nuances', level: GermanLevel.C2, content: null, isDynamic: true },
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
             <Book className="text-[#059669]" /> Field Manual ({level})
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
                                    <button onClick={() => playAudio(lessonData.example)} className="text-[#059669] hover:text-emerald-700"><Volume2 size={24}/></button>
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
                      <p className="text-stone-500">Construct sentences. Translate the prompt. Speak clearly.</p>
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
                     <p className="text-stone-500 mb-6 max-w-md">Generate a personalized set of 5 sentence challenges specifically for Level {level}.</p>
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
                        <h3 className="text-xl font-bold text-stone-800 mb-2">"{drill.english}"</h3>
                        
                        {drill.hint && revealedDrill !== drill.id && (
                           <p className="text-sm text-amber-600 mb-4 flex items-center gap-1">
                             <AlertTriangle size={12} /> Hint: {drill.hint}
                           </p>
                        )}

                        <div className="space-y-4">
                           {/* Input Area */}
                           <div className="flex gap-2">
                             <div className="relative flex-1">
                               <input 
                                 type="text" 
                                 placeholder="Type the German translation..."
                                 className="w-full p-3 bg-stone-50 border border-stone-200 rounded-lg focus:border-[#059669] outline-none pr-10"
                                 value={revealedDrill === drill.id ? drill.german : (userDrillInputs[drill.id] || '')}
                                 onChange={(e) => setUserDrillInputs(prev => ({...prev, [drill.id]: e.target.value}))}
                                 disabled={revealedDrill === drill.id}
                               />
                               {revealedDrill === drill.id && (
                                 <Check className="absolute right-3 top-3.5 text-[#059669]" size={20} />
                               )}
                             </div>
                             
                             <button 
                               onClick={() => startListening(drill.id)}
                               disabled={revealedDrill === drill.id || listeningDrillId !== null}
                               className={`p-3 rounded-lg border-2 transition-all ${listeningDrillId === drill.id ? 'bg-red-50 border-red-500 text-red-500 animate-pulse' : 'border-stone-200 text-stone-400 hover:text-[#059669] hover:border-[#059669]'}`}
                               title="Speak Answer"
                             >
                               <Mic size={20} />
                             </button>
                           </div>

                           {/* Controls */}
                           {revealedDrill !== drill.id ? (
                              <div className="flex justify-between items-center">
                                 <button 
                                    onClick={() => setUserDrillInputs(prev => ({...prev, [drill.id]: ''}))}
                                    className="text-stone-400 hover:text-stone-600 text-sm flex items-center gap-1"
                                 >
                                   <RefreshCw size={14} /> Clear
                                 </button>
                                 <Button 
                                   size="sm" 
                                   onClick={() => { 
                                     setRevealedDrill(drill.id); 
                                     setUserDrillInputs(prev => ({...prev, [drill.id]: ''})); 
                                   }}
                                   variant="secondary"
                                 >
                                    <Eye size={16} /> Reveal Solution
                                 </Button>
                              </div>
                           ) : (
                              <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-lg animate-fade-in mt-4">
                                 <div className="flex justify-between items-center mb-2">
                                    <span className="text-xs font-bold text-emerald-800 uppercase tracking-widest">Correct Answer</span>
                                    <button onClick={() => playAudio(drill.german)} className="text-[#059669] hover:text-emerald-800">
                                       <Volume2 size={20} />
                                    </button>
                                 </div>
                                 <p className="text-lg font-bold text-stone-800">{drill.german}</p>
                                 <div className="mt-4 flex justify-end">
                                    <button 
                                       onClick={() => { 
                                         setRevealedDrill(null); 
                                         setUserDrillInputs(prev => ({...prev, [drill.id]: ''})); 
                                       }} 
                                       className="text-sm font-bold text-stone-500 hover:text-stone-800"
                                    >
                                       Try Again
                                    </button>
                                 </div>
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