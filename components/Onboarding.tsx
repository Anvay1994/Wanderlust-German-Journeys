import React, { useState } from 'react';
import { UserProfile, GermanLevel } from '../types';
import { INTERESTS_LIST } from '../constants';
import Button from './Button';
import { Plane, Map, Globe, BookOpen, CheckCircle2, GraduationCap, ArrowRight } from 'lucide-react';

interface OnboardingProps {
  onComplete: (profile: UserProfile) => void;
}

const PLACEMENT_TEST = [
  {
    question: "1. Complete the sentence: 'Hallo, wie ___ du?'",
    options: ["heiße", "heißt", "heißen", "heißst"],
    correct: 1 // heißt (A1)
  },
  {
    question: "2. Select the correct verb: 'Wo ___ der Bahnhof?'",
    options: ["ist", "sind", "bist", "seid"],
    correct: 0 // ist (A1)
  },
  {
    question: "3. Accusative Case: 'Ich habe ___ Bruder.' (a brother)",
    options: ["ein", "einen", "einem", "eines"],
    correct: 1 // einen (A1)
  },
  {
    question: "4. Past Tense: 'Gestern ___ ich Pizza gegessen.'",
    options: ["bin", "habe", "sein", "haben"],
    correct: 1 // habe (A2)
  },
  {
    question: "5. Modal Verbs: 'Hier ___ man nicht rauchen.' (must not/allowed)",
    options: ["darf", "kann", "muss", "will"],
    correct: 0 // darf (A2)
  },
  {
    question: "6. Conjunctions: 'Ich gehe nicht raus, ___ es regnet.' (because)",
    options: ["denn", "aber", "weil", "oder"],
    correct: 2 // weil (B1)
  },
  {
    question: "7. Prepositions: 'Wir warten ___ den Zug.' (for)",
    options: ["auf", "für", "über", "an"],
    correct: 0 // auf (B1)
  },
  {
    question: "8. Adjective Endings: 'Ein ___ Hund spielt im Park.' (small)",
    options: ["kleines", "kleine", "kleinen", "kleiner"],
    correct: 3 // kleiner (B1)
  },
  {
    question: "9. Relative Pronouns: 'Das ist das Buch, ___ ich gelesen habe.'",
    options: ["dem", "der", "das", "den"],
    correct: 2 // das (B2)
  },
  {
    question: "10. Passive Voice: 'Das Haus ___ im Jahr 1990 gebaut.' (was)",
    options: ["wurde", "war", "hat", "ist"],
    correct: 0 // wurde (B2)
  },
  {
    question: "11. Genitive Prepositions: 'Wegen ___ Wetters blieben wir zu Hause.'",
    options: ["das schlechte", "des schlechten", "dem schlechten", "den schlechten"],
    correct: 1 // des schlechten (C1)
  },
  {
    question: "12. Konjunktiv II: 'Wenn ich Zeit ___, würde ich kommen.' (had)",
    options: ["habe", "hätte", "habe gehabt", "hatte"],
    correct: 1 // hätte (C1)
  }
];

const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [level, setLevel] = useState<GermanLevel>(GermanLevel.A1);
  const [interests, setInterests] = useState<string[]>([]);
  
  // Quiz State
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizIndex, setQuizIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);

  const toggleInterest = (interest: string) => {
    if (interests.includes(interest)) {
      setInterests(interests.filter(i => i !== interest));
    } else {
      setInterests([...interests, interest]);
    }
  };

  const handleFinish = () => {
    // Free modules: The first 3 of A1
    const starterPack = ['A1.1', 'A1.2', 'A1.3'];

    onComplete({
      name: name || 'Traveler',
      level,
      interests,
      credits: 100, // Travel Tokens
      xp: 0,
      streak: 1,
      completedModules: [],
      unlockedModules: starterPack,
      ownedLevels: [GermanLevel.A1] // A1 is free by default
    });
  };

  const handleOptionClick = (idx: number) => {
    const isCorrect = idx === PLACEMENT_TEST[quizIndex].correct;
    const nextScore = isCorrect ? score + 1 : score;
    setScore(nextScore);

    if (quizIndex < PLACEMENT_TEST.length - 1) {
      setQuizIndex(quizIndex + 1);
    } else {
      calculateLevel(nextScore);
    }
  };

  const calculateLevel = (finalScore: number) => {
    let assignedLevel = GermanLevel.A1;
    
    // Logic updated for 12 questions
    if (finalScore >= 3 && finalScore <= 5) assignedLevel = GermanLevel.A2;
    else if (finalScore >= 6 && finalScore <= 8) assignedLevel = GermanLevel.B1;
    else if (finalScore >= 9 && finalScore <= 10) assignedLevel = GermanLevel.B2;
    else if (finalScore >= 11) assignedLevel = GermanLevel.C1;
    
    // Cap at C1 for now as C2 usually requires fluency beyond multiple choice
    if (finalScore === 12) assignedLevel = GermanLevel.C1; 

    setLevel(assignedLevel);
    setQuizFinished(true);
  };

  const skipToBeginner = () => {
    setLevel(GermanLevel.A1);
    setQuizFinished(true);
    setQuizStarted(true); // To show the result screen directly
  };

  return (
    <div className="min-h-screen bg-[#f5f5f4] flex items-center justify-center p-4 relative overflow-hidden paper-texture">
      {/* Decorative Elements */}
      <div className="absolute top-0 right-0 p-20 opacity-10 pointer-events-none">
         <Globe size={400} className="text-stone-400" />
      </div>

      <div className="relative z-10 w-full max-w-lg bg-white border border-stone-200 p-8 shadow-xl rounded-sm">
        <div className="mb-8 text-center">
          <div className="w-16 h-16 bg-[#059669] rounded-full flex items-center justify-center mx-auto mb-4 text-white shadow-lg">
             <Plane size={32} />
          </div>
          <h1 className="text-3xl font-display text-stone-800 mb-2">Passport Setup</h1>
          <p className="text-stone-500 font-serif italic">Prepare for your journey to Germany</p>
        </div>

        {step === 1 && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">Traveler Name</label>
              <input 
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-stone-50 border-b-2 border-stone-300 text-stone-800 p-3 focus:border-[#059669] outline-none font-serif text-lg transition-colors placeholder:text-stone-300"
                placeholder="Enter your name"
              />
            </div>
            <Button onClick={() => setStep(2)} disabled={!name} className="w-full">
              Begin Registration
            </Button>
          </div>
        )}

        {step === 2 && (
          <div className="animate-fade-in">
            {!quizStarted && !quizFinished && (
              <div className="text-center space-y-6">
                <h2 className="text-xl text-stone-800 font-display">Proficiency Check</h2>
                <p className="text-stone-600">
                  To give you the best experience, we need to know how much German you already know.
                </p>
                <div className="space-y-3">
                  <Button onClick={() => setQuizStarted(true)} className="w-full">
                    Take Quick Assessment
                  </Button>
                  <Button variant="ghost" onClick={skipToBeginner} className="w-full">
                    I am a complete beginner
                  </Button>
                </div>
              </div>
            )}

            {quizStarted && !quizFinished && (
              <div className="space-y-6">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-xs font-bold text-stone-400 uppercase tracking-widest">Question {quizIndex + 1}/{PLACEMENT_TEST.length}</span>
                  <span className="text-xs font-bold text-[#059669]">Assessment Mode</span>
                </div>
                
                <h3 className="text-xl font-display font-bold text-stone-800 mb-6">
                  {PLACEMENT_TEST[quizIndex].question}
                </h3>

                <div className="space-y-3">
                  {PLACEMENT_TEST[quizIndex].options.map((option, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleOptionClick(idx)}
                      className="w-full p-4 border border-stone-200 rounded-lg hover:bg-[#ecfdf5] hover:border-[#059669] hover:text-[#059669] transition-all font-bold text-stone-600 text-left"
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {quizFinished && (
              <div className="text-center space-y-6 animate-fade-in">
                <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto text-amber-600 mb-4">
                   <GraduationCap size={40} />
                </div>
                <div>
                  <h2 className="text-2xl font-display text-stone-800 mb-2">Assessment Complete</h2>
                  <p className="text-stone-500">Your recommended starting level is:</p>
                  <div className="text-4xl font-display font-bold text-[#059669] mt-4 mb-2">{level}</div>
                  <p className="text-xs text-stone-400 uppercase tracking-widest">
                    {level === GermanLevel.A1 ? "Beginner" : level === GermanLevel.B2 || level === GermanLevel.C1 ? "Advanced" : "Intermediate"}
                  </p>
                  <p className="text-sm text-stone-400 mt-2">Score: {score}/{PLACEMENT_TEST.length}</p>
                </div>
                <Button onClick={() => setStep(3)} className="w-full">
                  Confirm & Continue
                </Button>
              </div>
            )}
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6 animate-fade-in">
             <h2 className="text-xl text-stone-800 font-display flex items-center gap-2">
               <Map className="w-5 h-5 text-[#059669]" /> Travel Interests
             </h2>
             <p className="text-sm text-stone-500">We will customize your itinerary based on what you love.</p>
             <div className="flex flex-wrap gap-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
               {INTERESTS_LIST.map(interest => (
                 <button
                  key={interest}
                  onClick={() => toggleInterest(interest)}
                  className={`px-3 py-1.5 text-sm border rounded-full transition-all ${interests.includes(interest) ? 'bg-[#059669] border-[#059669] text-white shadow-md' : 'border-stone-200 text-stone-600 hover:border-stone-400 bg-white'}`}
                 >
                   {interest}
                 </button>
               ))}
             </div>
             <Button onClick={handleFinish} className="w-full" variant="primary">
               Print Passport
             </Button>
          </div>
        )}

        <div className="mt-8 flex justify-center gap-2">
          {[1, 2, 3].map(i => (
            <div key={i} className={`h-1.5 w-8 rounded-full transition-colors ${step >= i ? 'bg-[#059669]' : 'bg-stone-200'}`}></div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Onboarding;