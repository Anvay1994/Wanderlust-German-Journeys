import React, { useEffect, useMemo, useState } from 'react';
import { CurriculumModule, MissionBriefing } from '../types';
import { generateMissionBriefing } from '../services/geminiService';
import Button from './Button';
import { Loader2, Book, Lightbulb, MessageCircle, ArrowRight, CheckCircle, Volume2, FileText, AlertTriangle, CheckSquare, Sparkles, MapPin, Compass } from 'lucide-react';
import { useTTS } from '../hooks/useTTS';

interface MissionPrepProps {
  module: CurriculumModule;
  onStart: () => void;
  onCancel: () => void;
}

const MissionPrep: React.FC<MissionPrepProps> = ({ module, onStart, onCancel }) => {
  const { speak } = useTTS();
  const [briefing, setBriefing] = useState<MissionBriefing | null>(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState<'intel' | 'briefing' | 'clearance'>('intel');
  
  // Security Clearance State (5 questions)
  const [clearanceIndex, setClearanceIndex] = useState(0);
  const [clearanceSelected, setClearanceSelected] = useState<number | null>(null);
  const [clearanceAnswers, setClearanceAnswers] = useState<Record<number, { selected: number; correct: boolean }>>({});

  const fallbackPhrases = useMemo(() => {
    const focus = module.grammarFocus.join(' ').toLowerCase();
    const phrases: { german: string; english: string }[] = [];
    if (focus.includes('sein')) {
      phrases.push({ german: 'Ich bin in Berlin.', english: 'I am in Berlin.' });
    }
    if (focus.includes('haben')) {
      phrases.push({ german: 'Ich habe einen Pass.', english: 'I have a passport.' });
    }
    if (phrases.length === 0) {
      phrases.push({ german: 'Ich lerne Deutsch.', english: 'I am learning German.' });
    }
    phrases.push(
      { german: 'Können Sie mir helfen?', english: 'Can you help me?' },
      { german: 'Ich möchte ein Ticket.', english: 'I would like a ticket.' }
    );
    return phrases.slice(0, 4);
  }, [module.grammarFocus]);

  useEffect(() => {
    const fetchBriefing = async () => {
      try {
        const data = await generateMissionBriefing(module);
        setBriefing(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchBriefing();
  }, [module]);

  useEffect(() => {
    setClearanceIndex(0);
    setClearanceSelected(null);
    setClearanceAnswers({});
  }, [briefing?.missionGoal, module.id]);

  const playAudio = (text: string) => {
    speak(text);
  };

  const safeBriefing = useMemo(() => {
    if (!briefing) return null;
    const safeLesson = {
      title: briefing.lesson?.title || module.title,
      explanation: briefing.lesson?.explanation || 'Review the key grammar point and say the example out loud.',
      keyPoints: briefing.lesson?.keyPoints && briefing.lesson.keyPoints.length > 0
        ? briefing.lesson.keyPoints
        : ['Focus on the verb form.', 'Keep word order simple.', 'Read the example aloud.'],
      example: briefing.lesson?.example || fallbackPhrases[0]?.german || '',
      grammarTable: briefing.lesson?.grammarTable || { headers: [], rows: [] },
      commonMistakes: briefing.lesson?.commonMistakes || []
    };

    return {
      ...briefing,
      lesson: safeLesson,
      vocabulary: Array.isArray(briefing.vocabulary) ? briefing.vocabulary : [],
      keyPhrases: Array.isArray(briefing.keyPhrases) && briefing.keyPhrases.length > 0
        ? briefing.keyPhrases
        : fallbackPhrases,
      culturalFact: briefing.culturalFact || 'Germany has a rich mix of regional traditions and dialects.'
    };
  }, [briefing, fallbackPhrases, module.title]);

  const getClearanceQuestions = () => {
    const questions = safeBriefing?.securityClearance;
    if (Array.isArray(questions) && questions.length >= 5) return questions.slice(0, 5);
    if (safeBriefing?.quiz) {
      return [
        { ...safeBriefing.quiz, explanation: "Fallback question. Configure the AI key to generate full check-in questions." },
        { ...safeBriefing.quiz, explanation: "Fallback question. Configure the AI key to generate full check-in questions." },
        { ...safeBriefing.quiz, explanation: "Fallback question. Configure the AI key to generate full check-in questions." },
        { ...safeBriefing.quiz, explanation: "Fallback question. Configure the AI key to generate full check-in questions." },
        { ...safeBriefing.quiz, explanation: "Fallback question. Configure the AI key to generate full check-in questions." }
      ];
    }
    return [];
  };

  const handleClearanceAnswer = (idx: number, correctAnswer: number) => {
    setClearanceSelected(idx);
    setClearanceAnswers((prev) => ({
      ...prev,
      [clearanceIndex]: {
        selected: idx,
        correct: idx === correctAnswer
      }
    }));
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-[#059669]" />
        <p className="text-stone-500 font-display">Preparing your journey notes...</p>
        <p className="text-xs text-stone-400">Analyzing CEFR level requirements...</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-[#f5f5f4] overflow-hidden">
       {/* Header */}
      <div className="bg-stone-800 text-white p-6 shrink-0 shadow-md flex justify-between items-center z-10">
         <div>
            <div className="text-xs uppercase tracking-widest text-stone-400 mb-1">Pre-Trip Practice</div>
            <h2 className="text-2xl font-display font-bold">{module.title}</h2>
         </div>
         <div className="flex items-center gap-2">
            {['intel', 'briefing', 'clearance'].map((s, i) => {
               const steps = ['intel', 'briefing', 'clearance'];
               const currentIdx = steps.indexOf(step);
               const isActive = i <= currentIdx;
               return (
                  <div key={s} className={`h-2 w-8 rounded-full transition-colors ${isActive ? 'bg-[#059669]' : 'bg-stone-600'}`}></div>
               );
            })}
         </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 md:p-8 pb-20">
        <div className="max-w-5xl mx-auto w-full">
          
          {safeBriefing && (
            <>
              {/* STEP 1: INTEL GRID (Vocabulary) */}
              {step === 'intel' && (
                <div className="animate-fade-in flex flex-col h-full">
                   <div className="text-center mb-8">
                     <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-100 text-[#059669] mb-4">
                        <Book size={24} />
                     </div>
                     <h3 className="text-2xl font-display font-bold text-stone-800">Travel Notes</h3>
                     <p className="text-stone-500">Equip yourself with these essential terms.</p>
                   </div>
                   
                   {safeBriefing.missionGoal && (
                     <div className="bg-white border-l-4 border-amber-400 p-4 mb-8 rounded shadow-sm max-w-3xl mx-auto w-full">
                        <h4 className="text-xs font-bold uppercase tracking-widest text-amber-600 flex items-center gap-2 mb-1">
                          <MapPin size={14} /> Journey Goal
                        </h4>
                        <p className="text-stone-700 italic">{safeBriefing.missionGoal}</p>
                     </div>
                   )}

                   <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
                      {safeBriefing.vocabulary?.map((item, idx) => (
                        <button 
                           key={idx} 
                           disabled={!item.german?.trim()}
                           className="bg-white p-4 rounded-lg border-2 border-stone-200 hover:border-[#059669] hover:shadow-lg transition-all text-left group relative"
                           onClick={() => playAudio(item.german)}
                        >
                           <div className="font-bold text-lg text-stone-800 mb-1 group-hover:text-[#059669] transition-colors">
                              {item.german}
                           </div>
                           <div className="text-sm text-stone-500 font-serif italic">
                              {item.english}
                           </div>
                           <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 text-[#059669] transition-opacity">
                              <Volume2 size={16} />
                           </div>
                        </button>
                      ))}
                   </div>
                   
                   {safeBriefing.strategyTip && (
                      <div className="mb-8 bg-[#f0fdf4] border border-green-200 p-4 rounded-lg flex items-start gap-3">
                         <div className="bg-white p-2 rounded-full text-green-600 shadow-sm shrink-0">
                            <Sparkles size={18} />
                         </div>
                         <div>
                            <h4 className="font-bold text-green-800 text-sm uppercase tracking-widest mb-1">Travel Hack</h4>
                            <p className="text-green-900 text-sm leading-relaxed">{safeBriefing.strategyTip}</p>
                         </div>
                      </div>
                   )}

                   <div className="flex gap-4 mt-auto pt-4 border-t border-stone-200">
                     <Button variant="ghost" onClick={onCancel} className="flex-1">Change Route</Button>
                     <Button variant="primary" onClick={() => setStep('briefing')} className="flex-[2] py-4 text-lg">
                       Continue to Introduction <ArrowRight size={18} />
                     </Button>
                   </div>
                </div>
              )}

              {/* STEP 2: BRIEFING (Lesson) */}
              {step === 'briefing' && safeBriefing.lesson && (
                <div className="animate-fade-in">
                   <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                      
                      {/* Left: Grammar Content */}
                      <div className="lg:col-span-2 space-y-6">
                         
                         {/* Concept Card */}
                         <div className="bg-white shadow-md rounded-lg border border-stone-200 overflow-hidden">
                             <div className="bg-stone-800 text-white p-4 flex items-center justify-between">
                                <h3 className="font-bold flex items-center gap-2"><Lightbulb size={18} /> Lesson: {safeBriefing.lesson?.title}</h3>
                             </div>
                             <div className="p-6">
                                <p className="text-lg text-stone-700 leading-relaxed mb-6 whitespace-pre-line">
                                   {safeBriefing.lesson?.explanation}
                                </p>
                                
                                {safeBriefing.lesson.keyPoints && safeBriefing.lesson.keyPoints.length > 0 && (
                                   <div className="mb-6 bg-stone-50 p-4 rounded border border-stone-100">
                                      <h4 className="text-xs font-bold uppercase tracking-widest text-stone-400 mb-3 flex items-center gap-2">
                                         <CheckSquare size={14} /> Key Takeaways
                                      </h4>
                                      <ul className="space-y-2">
                                         {safeBriefing.lesson.keyPoints.map((point, idx) => (
                                            <li key={idx} className="flex gap-2 items-start text-stone-700">
                                               <span className="text-[#059669] mt-1 font-bold">•</span>
                                               {point}
                                            </li>
                                         ))}
                                      </ul>
                                   </div>
                                )}

                                <div className="bg-emerald-50 border-l-4 border-[#059669] p-4 mb-6">
                                   <span className="text-xs font-bold text-emerald-800 uppercase tracking-widest mb-1 block">Primary Example</span>
                                   <div className="flex items-center justify-between">
                                      <span className="text-xl font-bold text-stone-800">{safeBriefing.lesson?.example}</span>
                                      <button
                                        onClick={() => playAudio(safeBriefing.lesson?.example || '')}
                                        disabled={!safeBriefing.lesson?.example?.trim()}
                                        className={`text-[#059669] hover:text-emerald-700 ${!safeBriefing.lesson?.example?.trim() ? 'opacity-40 cursor-not-allowed' : ''}`}
                                      >
                                        <Volume2 size={24}/>
                                      </button>
                                   </div>
                                </div>

                                {safeBriefing.lesson?.grammarTable && safeBriefing.lesson.grammarTable.headers && safeBriefing.lesson.grammarTable.rows && (
                                   <div className="bg-stone-50 rounded-lg border border-stone-200 overflow-hidden">
                                      <table className="w-full text-left text-sm">
                                         <thead>
                                            <tr className="bg-stone-100 text-stone-600 border-b border-stone-200">
                                              {safeBriefing.lesson.grammarTable.headers.map((h, i) => (
                                                <th key={i} className="p-3 font-bold">{h}</th>
                                              ))}
                                            </tr>
                                         </thead>
                                         <tbody>
                                            {safeBriefing.lesson.grammarTable.rows.map((row, rIdx) => (
                                              <tr key={rIdx} className="border-b border-stone-100 last:border-0 hover:bg-white">
                                                {Array.isArray(row) && row.map((cell, cIdx) => (
                                                  <td key={cIdx} className="p-3 text-stone-800 font-medium">{cell}</td>
                                                ))}
                                              </tr>
                                            ))}
                                         </tbody>
                                      </table>
                                   </div>
                                )}
                             </div>
                         </div>
                         
                         {/* Common Mistakes */}
                         {safeBriefing.lesson?.commonMistakes && safeBriefing.lesson.commonMistakes.length > 0 && (
                            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                               <h4 className="flex items-center gap-2 text-amber-800 font-bold mb-3">
                                  <AlertTriangle size={18} /> Caution: Common Errors
                               </h4>
                               <ul className="space-y-2">
                                  {safeBriefing.lesson.commonMistakes.map((mistake, i) => (
                                    <li key={i} className="flex gap-2 items-start text-sm text-amber-900">
                                       <span className="text-amber-500 mt-1">•</span>
                                       {mistake}
                                    </li>
                                  ))}
                               </ul>
                            </div>
                         )}
                      </div>

                      {/* Right: Context & Phrases */}
                      <div className="flex flex-col gap-6">
                          <div className="bg-white shadow-sm rounded-lg border border-stone-200 p-6 flex-1">
                            <h4 className="font-display font-bold text-stone-800 mb-4 flex items-center gap-2">
                               <MessageCircle size={18} /> Travel Phrases
                            </h4>
                            <div className="space-y-3">
                              {safeBriefing.keyPhrases?.map((phrase, i) => (
                                 <div
                                   key={i}
                                   className="p-3 bg-stone-50 rounded border border-stone-100 hover:bg-stone-100 transition-colors cursor-pointer"
                                   onClick={() => playAudio(phrase.german)}
                                 >
                                    <div className="font-bold text-stone-700">{phrase.german}</div>
                                    <div className="text-stone-400 italic text-xs mt-1">{phrase.english}</div>
                                 </div>
                              ))}
                            </div>
                          </div>

                          <div className="bg-stone-800 text-stone-300 p-6 rounded-lg shadow-lg relative overflow-hidden">
                             <div className="absolute top-0 right-0 p-4 opacity-10"><FileText size={80} /></div>
                             <h4 className="font-bold text-white mb-2 text-sm uppercase tracking-widest">Cultural Notes</h4>
                             <p className="text-sm italic font-serif leading-relaxed relative z-10">
                               "{safeBriefing.culturalFact}"
                             </p>
                          </div>
                      </div>

                   </div>

                   <div className="mt-8 flex justify-end">
                      <Button onClick={() => setStep('clearance')} variant="primary" size="lg" className="w-full md:w-auto shadow-xl">
                        Continue to Check-in <Compass size={18} />
                      </Button>
                   </div>
                </div>
              )}

              {/* STEP 3: CLEARANCE (5 Questions) */}
              {step === 'clearance' && (
                <div className="animate-fade-in w-full max-w-2xl mx-auto">
                   {(() => {
                     const questions = getClearanceQuestions();
                     if (questions.length === 0) {
                       return (
                         <div className="bg-white p-8 rounded-lg shadow-lg border-2 border-stone-200">
                           <h3 className="text-2xl font-display font-bold text-stone-800 mb-2">Travel Check</h3>
                           <p className="text-stone-500">No check questions available. Please try again later.</p>
                           <div className="mt-6">
                             <Button variant="ghost" onClick={() => setStep('briefing')}>Back</Button>
                           </div>
                         </div>
                       );
                     }

                     const current = questions[Math.min(clearanceIndex, questions.length - 1)];
                     const answeredCount = Object.keys(clearanceAnswers).length;
                     const correctCount = Object.values(clearanceAnswers).filter(a => a.correct).length;
                     const finished = answeredCount >= questions.length;
                     const passMark = 4; // 4/5 to pass
                     const passed = finished && correctCount >= passMark;

                     return (
                       <>
                   <div className="text-center mb-8">
                      <div className="w-16 h-16 bg-stone-200 rounded-full flex items-center justify-center mx-auto mb-4 text-stone-500">
                         {passed ? <CheckCircle size={32} className="text-[#059669]" /> : <Compass size={32} />}
                      </div>
                      <h3 className="text-2xl font-display font-bold text-stone-800">Travel Check</h3>
                      <p className="text-stone-500">Check your understanding to unlock the journey.</p>
                      <div className="mt-4 text-xs font-bold uppercase tracking-widest text-stone-400">
                        Question {Math.min(clearanceIndex + 1, questions.length)} of {questions.length}
                      </div>
                   </div>

                   <div className="bg-white p-8 rounded-lg shadow-lg border-2 border-stone-200 mb-6 relative">
                      <h4 className="text-xl font-bold text-stone-800 mb-6">{current.question}</h4>
                      <div className="space-y-3">
                        {(current.options || []).map((opt, i) => (
                           <button
                             key={i}
                             onClick={() => !finished && typeof clearanceSelected !== 'number' && handleClearanceAnswer(i, current.correctAnswer)}
                             disabled={finished || typeof clearanceSelected === 'number'}
                             className={`w-full p-4 rounded-lg text-left font-bold border-2 transition-all text-lg
                               ${clearanceSelected === i 
                                  ? (clearanceSelected === current.correctAnswer 
                                     ? 'bg-green-100 border-green-500 text-green-700' 
                                     : 'bg-red-100 border-red-500 text-red-700')
                                  : 'border-stone-200 hover:border-stone-400 bg-stone-50 text-stone-800'
                               }
                             `}
                           >
                             {opt}
                           </button>
                        ))}
                      </div>
                      
                      {typeof clearanceSelected === 'number' && (
                        <div className={`mt-4 text-center font-bold ${clearanceSelected === current.correctAnswer ? 'text-[#059669]' : 'text-red-500'}`}>
                          {clearanceSelected === current.correctAnswer ? "You're ready to go." : 'Not quite yet.'}
                        </div>
                      )}

                      {typeof clearanceSelected === 'number' && current.explanation && (
                        <div className="mt-4 bg-stone-50 border border-stone-200 rounded-lg p-4 text-sm text-stone-700">
                          <span className="font-bold text-stone-800">Why:</span> {current.explanation}
                        </div>
                      )}

                      {typeof clearanceSelected === 'number' && !finished && (
                        <div className="mt-6 flex justify-end">
                          <Button
                            variant="secondary"
                            onClick={() => {
                              setClearanceSelected(null);
                              setClearanceIndex((i) => Math.min(i + 1, questions.length - 1));
                            }}
                          >
                            Next Question <ArrowRight size={16} />
                          </Button>
                        </div>
                      )}
                   </div>

                   <div className="flex gap-4">
                     <Button variant="ghost" onClick={() => setStep('briefing')} className="flex-1">Check your notes</Button>
                     <Button 
                       variant="primary" 
                       onClick={onStart} 
                       disabled={!passed}
                       className="flex-[2] py-4 text-lg shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                     >
                       {passed ? "START JOURNEY" : finished ? `SCORE ${correctCount}/${questions.length} (Need ${passMark})` : "CHECK IN PROGRESS"}
                     </Button>
                   </div>

                    {finished && !passed && (
                      <div className="mt-4 text-center">
                        <button
                          onClick={() => {
                            setClearanceIndex(0);
                            setClearanceSelected(null);
                            setClearanceAnswers({});
                          }}
                          className="text-sm font-bold text-stone-500 hover:text-stone-800"
                        >
                          Retry Check
                        </button>
                      </div>
                    )}
                       </>
                     );
                   })()}
                </div>
              )}
            </>
          )}
          {!safeBriefing && (
            <div className="bg-white border border-stone-200 rounded-lg p-6 text-center">
              <h3 className="text-lg font-display font-bold text-stone-800">Journey overview unavailable</h3>
              <p className="text-sm text-stone-500 mt-2">Please refresh and try again.</p>
              <div className="mt-4 flex justify-center">
                <Button onClick={() => window.location.reload()} variant="secondary">Refresh</Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MissionPrep;
