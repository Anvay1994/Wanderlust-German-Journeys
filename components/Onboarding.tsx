import React, { useState } from 'react';
import { UserProfile, GermanLevel } from '../types';
import { INTERESTS_LIST } from '../constants';
import Button from './Button';
import { Plane, Map, Globe, BookOpen, CheckCircle2, GraduationCap, ArrowRight, Lock, Mail, Key, UserCircle2 } from 'lucide-react';
import { supabase } from '../services/supabaseClient';
import { useSoundEffects } from '../hooks/useSoundEffects';

interface OnboardingProps {
  onComplete: (profile: UserProfile) => void;
  onGuestLogin?: () => void;
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
    correct: 2 // B2
  },
  {
    question: "10. Passive Voice: 'Das Haus ___ im Jahr 1990 gebaut.' (was)",
    options: ["wurde", "war", "hat", "ist"],
    correct: 0 // B2
  },
  {
    question: "11. Genitive Prepositions: 'Wegen ___ Wetters blieben wir zu Hause.'",
    options: ["das schlechte", "des schlechten", "dem schlechten", "den schlechten"],
    correct: 1 // C1
  },
  {
    question: "12. Konjunktiv II: 'Wenn ich Zeit ___, würde ich kommen.' (had)",
    options: ["habe", "hätte", "habe gehabt", "hatte"],
    correct: 1 // C1
  }
];

const Onboarding: React.FC<OnboardingProps> = ({ onComplete, onGuestLogin }) => {
  const { playSound } = useSoundEffects();
  const [step, setStep] = useState(1);
  
  // Auth State
  const [isLoginMode, setIsLoginMode] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  // Profile State
  const [name, setName] = useState('');
  const [level, setLevel] = useState<GermanLevel>(GermanLevel.A1);
  const [interests, setInterests] = useState<string[]>([]);
  
  // Quiz State
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizIndex, setQuizIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);

  const toggleInterest = (interest: string) => {
    playSound('click', 0.5);
    if (interests.includes(interest)) {
      setInterests(interests.filter(i => i !== interest));
    } else {
      setInterests([...interests, interest]);
    }
  };

  const handleAuth = async () => {
    setAuthLoading(true);
    setAuthError(null);
    setEmailSent(false);

    try {
      if (isLoginMode) {
        // LOGIN
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
           if (error.message.includes("Email not confirmed")) {
             setAuthError("Email not verified. Please check your inbox.");
           } else {
             throw error;
           }
        }
        playSound('success', 0.5);
        // App.tsx auth listener will handle the redirect
      } else {
        // SIGNUP - Validate input before moving to step 2
        if (password.length < 6) throw new Error("Password must be at least 6 characters.");
        playSound('paper', 0.5);
        setStep(2);
      }
    } catch (e: any) {
      playSound('error', 0.5);
      setAuthError(e.message);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleFinish = async () => {
    setAuthLoading(true);
    const starterPack = ['A1.1', 'A1.2', 'A1.3', 'A1.4', 'A1.5', 'A1.6'];
    
    try {
      // 1. Create Auth User AND Pass Metadata
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name || 'Traveler',
            current_level: level,
            interests: interests
          }
        }
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error("No user created");

      if (!authData.session) {
        setEmailSent(true);
        setStep(1); 
        setIsLoginMode(true);
        setAuthLoading(false);
        playSound('message');
        return; 
      }

      await new Promise(resolve => setTimeout(resolve, 1500));

      // 2. Prepare Profile Data (snake_case for DB)
      const updates = {
        full_name: name || 'Traveler',
        email: email,
        current_level: level,
        interests,
        credits: 100,
        xp: 0,
        streak_count: 1,
        completed_modules: [],
        unlocked_modules: starterPack,
        owned_levels: [],
        last_active: new Date().toISOString()
      };

      const { error: updateError, data: updateData } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', authData.user.id)
        .select();

      if (!updateData || updateData.length === 0) {
        console.log("Profile not found via trigger, attempting manual insert...");
        const { error: insertError } = await supabase
          .from('profiles')
          .insert({ id: authData.user.id, ...updates });

        if (insertError) console.error("Profile creation failed:", insertError);
      }

      playSound('stamp', 0.8);
      onComplete({
        name: name || 'Traveler',
        level: level,
        interests: interests,
        credits: 100,
        xp: 0,
        streak: 1,
        completedModules: [],
        unlockedModules: starterPack,
        ownedLevels: []
      });

    } catch (e: any) {
      playSound('error');
      setAuthError(e.message);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleOptionClick = (idx: number) => {
    const isCorrect = idx === PLACEMENT_TEST[quizIndex].correct;
    const nextScore = isCorrect ? score + 1 : score;
    setScore(nextScore);
    
    if (isCorrect) playSound('click', 0.6);
    else playSound('click', 0.3);

    if (quizIndex < PLACEMENT_TEST.length - 1) {
      setQuizIndex(quizIndex + 1);
    } else {
      calculateLevel(nextScore);
    }
  };

  const calculateLevel = (finalScore: number) => {
    let assignedLevel = GermanLevel.A1;
    if (finalScore >= 3 && finalScore <= 5) assignedLevel = GermanLevel.A2;
    else if (finalScore >= 6 && finalScore <= 8) assignedLevel = GermanLevel.B1;
    else if (finalScore >= 9 && finalScore <= 10) assignedLevel = GermanLevel.B2;
    else if (finalScore >= 11) assignedLevel = GermanLevel.C1;
    
    if (finalScore === 12) assignedLevel = GermanLevel.C1; 

    setLevel(assignedLevel);
    playSound('success', 0.6);
    setQuizFinished(true);
  };

  const skipToBeginner = () => {
    setLevel(GermanLevel.A1);
    setQuizFinished(true);
    setQuizStarted(true);
    playSound('paper', 0.5);
  };

  return (
    <div className="min-h-screen bg-[#f5f5f4] flex items-center justify-center p-4 relative overflow-hidden paper-texture">
      {/* Decorative Elements - Animated */}
      <div className="absolute top-0 right-0 p-20 opacity-10 pointer-events-none animate-float">
         <Globe size={400} className="text-stone-400" />
      </div>

      <div className="relative z-10 w-full max-w-lg bg-white border border-stone-200 p-8 shadow-xl rounded-sm">
        <div className="mb-8 text-center">
          <div className="w-16 h-16 bg-[#059669] rounded-full flex items-center justify-center mx-auto mb-4 text-white shadow-lg animate-pulse-subtle">
             <Plane size={32} />
          </div>
          <h1 className="text-3xl font-display text-stone-800 mb-2">Passport Setup</h1>
          <p className="text-stone-500 font-serif italic">Prepare for your journey to Germany</p>
        </div>

        {/* STEP 1: CREDENTIALS */}
        {step === 1 && (
          <div className="space-y-6 animate-slide-up">
             <div className="flex bg-stone-100 p-1 rounded-lg mb-6">
                <button 
                  onClick={() => { setIsLoginMode(false); setAuthError(null); setEmailSent(false); playSound('click'); }}
                  className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${!isLoginMode ? 'bg-white shadow-sm text-stone-800' : 'text-stone-500'}`}
                >
                  New Traveler
                </button>
                <button 
                  onClick={() => { setIsLoginMode(true); setAuthError(null); setEmailSent(false); playSound('click'); }}
                  className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${isLoginMode ? 'bg-white shadow-sm text-stone-800' : 'text-stone-500'}`}
                >
                  Existing Passport
                </button>
             </div>
             
             {emailSent && (
               <div className="bg-green-50 text-green-700 p-4 rounded-lg border border-green-200 flex flex-col items-center text-center animate-fade-in">
                  <Mail size={24} className="mb-2 text-[#059669]" />
                  <p className="font-bold mb-1">Confirmation Email Sent</p>
                  <p className="text-xs">Please verify your inbox to activate your passport. You can log in once verified.</p>
               </div>
             )}

             {authError && (
               <div className="bg-red-50 text-red-600 p-3 text-sm rounded flex items-center gap-2 border border-red-100">
                 <Lock size={14} className="shrink-0"/> {authError}
               </div>
             )}

             <div className="space-y-4">
               {!isLoginMode && (
                 <div>
                    <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-1">Name on Passport</label>
                    <input 
                      type="text" 
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-stone-50 border border-stone-200 rounded p-3 focus:border-[#059669] outline-none"
                      placeholder="e.g. Aditi Sharma"
                    />
                 </div>
               )}
               <div>
                  <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-1">Email Access</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3.5 text-stone-400" size={16} />
                    <input 
                      type="email" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-stone-50 border border-stone-200 rounded p-3 pl-10 focus:border-[#059669] outline-none"
                      placeholder="name@example.com"
                    />
                  </div>
               </div>
               <div>
                  <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-1">Security Code</label>
                  <div className="relative">
                    <Key className="absolute left-3 top-3.5 text-stone-400" size={16} />
                    <input 
                      type="password" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-stone-50 border border-stone-200 rounded p-3 pl-10 focus:border-[#059669] outline-none"
                      placeholder="••••••••"
                    />
                  </div>
               </div>
             </div>

             <div className="space-y-4">
               <Button 
                 onClick={handleAuth} 
                 disabled={!email || !password || (!isLoginMode && !name) || authLoading} 
                 className="w-full"
               >
                  {authLoading ? 'Verifying...' : (isLoginMode ? 'Unlock Passport' : 'Create Identity')}
               </Button>
               
               {onGuestLogin && (
                 <button 
                   onClick={onGuestLogin}
                   className="w-full py-2 text-stone-400 text-sm font-bold hover:text-stone-600 flex items-center justify-center gap-2 transition-colors"
                 >
                   <UserCircle2 size={16} /> Continue as Guest (Offline Mode)
                 </button>
               )}
             </div>
          </div>
        )}

        {/* STEP 2: PROFICIENCY */}
        {step === 2 && (
          <div className="animate-slide-up">
            {!quizStarted && !quizFinished && (
              <div className="text-center space-y-6">
                <h2 className="text-xl text-stone-800 font-display">Proficiency Check</h2>
                <p className="text-stone-600">
                  Welcome, {name}. Before we print your visa, let's check your German level.
                </p>
                <div className="space-y-3">
                  <Button onClick={() => { setQuizStarted(true); playSound('click'); }} className="w-full">
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
              <div className="text-center space-y-6 animate-slide-up">
                <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto text-amber-600 mb-4 animate-bounce">
                   <GraduationCap size={40} />
                </div>
                <div>
                  <h2 className="text-2xl font-display text-stone-800 mb-2">Assessment Complete</h2>
                  <p className="text-stone-500">Your recommended starting level is:</p>
                  <div className="text-4xl font-display font-bold text-[#059669] mt-4 mb-2 animate-pulse-subtle">{level}</div>
                  <p className="text-xs text-stone-400 uppercase tracking-widest">
                    {level === GermanLevel.A1 ? "Beginner" : level === GermanLevel.B2 || level === GermanLevel.C1 ? "Advanced" : "Intermediate"}
                  </p>
                </div>
                <Button onClick={() => { setStep(3); playSound('paper'); }} className="w-full">
                  Confirm & Continue
                </Button>
              </div>
            )}
          </div>
        )}

        {/* STEP 3: INTERESTS & FINISH */}
        {step === 3 && (
          <div className="space-y-6 animate-slide-up">
             <h2 className="text-xl text-stone-800 font-display flex items-center gap-2">
               <Map className="w-5 h-5 text-[#059669]" /> Travel Interests
             </h2>
             <p className="text-sm text-stone-500">Customize your itinerary.</p>
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
             
             {authError && (
               <div className="bg-red-50 text-red-600 p-2 text-xs rounded">
                 {authError}
               </div>
             )}

             <Button onClick={handleFinish} className="w-full" variant="primary" disabled={authLoading}>
               {authLoading ? 'Printing Passport...' : 'Start Adventure'}
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