import React, { useEffect, useState } from 'react';
import { CurriculumModule, MissionBriefing } from '../types';
import { generateMissionBriefing } from '../services/geminiService';
import Button from './Button';
import { Loader2, Book, Lightbulb, MessageCircle, ArrowRight, Lock, CheckCircle, Volume2, ShieldCheck, FileText, AlertTriangle, PenTool } from 'lucide-react';

interface MissionPrepProps {
  module: CurriculumModule;
  onStart: () => void;
  onCancel: () => void;
}

const MissionPrep: React.FC<MissionPrepProps> = ({ module, onStart, onCancel }) => {
  const [briefing, setBriefing] = useState<MissionBriefing | null>(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState<'intel' | 'briefing' | 'clearance'>('intel');
  
  // Quiz State
  const [quizSelected, setQuizSelected] = useState<number | null>(null);
  const [quizCorrect, setQuizCorrect] = useState(false);

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

  const playAudio = (text: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'de-DE';
    window.speechSynthesis.speak(utterance);
  };

  const handleQuizSubmit = (idx: number) => {
    setQuizSelected(idx);
    if (briefing && idx === briefing.quiz.correctAnswer) {
      setQuizCorrect(true);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-[#059669]" />
        <p className="text-stone-500 font-display">Assembling Mission Dossier...</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-[#f5f5f4] overflow-hidden">
       {/* Header */}
      <div className="bg-stone-800 text-white p-6 shrink-0 shadow-md flex justify-between items-center z-10">
         <div>
            <div className="text-xs uppercase tracking-widest text-stone-400 mb-1">Pre-Mission Training</div>
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
          
          {briefing && (
            <>
              {/* STEP 1: INTEL GRID (Vocabulary) */}
              {step === 'intel' && (
                <div className="animate-fade-in flex flex-col h-full">
                   <div className="text-center mb-8">
                     <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-100 text-[#059669] mb-4">
                        <Book size={24} />
                     </div>
                     <h3 className="text-2xl font-display font-bold text-stone-800">Mission Intel</h3>
                     <p className="text-stone-500">Equip yourself with these essential terms.</p>
                   </div>

                   <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
                      {briefing.vocabulary?.map((item, idx) => (
                        <button 
                           key={idx} 
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

                   <div className="flex gap-4 mt-auto pt-4 border-t border-stone-200">
                     <Button variant="ghost" onClick={onCancel} className="flex-1">Abort Mission</Button>
                     <Button variant="primary" onClick={() => setStep('briefing')} className="flex-[2] py-4 text-lg">
                       Continue to Briefing <ArrowRight size={18} />
                     </Button>
                   </div>
                </div>
              )}

              {/* STEP 2: BRIEFING (Lesson) */}
              {step === 'briefing' && briefing.lesson && (
                <div className="animate-fade-in">
                   <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                      
                      {/* Left: Grammar Content */}
                      <div className="lg:col-span-2 space-y-6">
                         
                         {/* Concept Card */}
                         <div className="bg-white shadow-md rounded-lg border border-stone-200 overflow-hidden">
                             <div className="bg-stone-800 text-white p-4 flex items-center justify-between">
                                <h3 className="font-bold flex items-center gap-2"><Lightbulb size={18} /> Protocol: {briefing.lesson?.title}</h3>
                             </div>
                             <div className="p-6">
                                <p className="text-lg text-stone-700 leading-relaxed mb-6">{briefing.lesson?.explanation}</p>
                                
                                <div className="bg-emerald-50 border-l-4 border-[#059669] p-4 mb-6">
                                   <span className="text-xs font-bold text-emerald-800 uppercase tracking-widest mb-1 block">Primary Example</span>
                                   <div className="flex items-center justify-between">
                                      <span className="text-xl font-bold text-stone-800">{briefing.lesson?.example}</span>
                                      <button onClick={() => playAudio(briefing.lesson?.example || '')} className="text-[#059669] hover:text-emerald-700"><Volume2 size={24}/></button>
                                   </div>
                                </div>

                                {briefing.lesson?.grammarTable && briefing.lesson.grammarTable.headers && briefing.lesson.grammarTable.rows && (
                                   <div className="bg-stone-50 rounded-lg border border-stone-200 overflow-hidden">
                                      <table className="w-full text-left text-sm">
                                         <thead>
                                            <tr className="bg-stone-100 text-stone-600 border-b border-stone-200">
                                              {briefing.lesson.grammarTable.headers.map((h, i) => (
                                                <th key={i} className="p-3 font-bold">{h}</th>
                                              ))}
                                            </tr>
                                         </thead>
                                         <tbody>
                                            {briefing.lesson.grammarTable.rows.map((row, rIdx) => (
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
                         {briefing.lesson?.commonMistakes && briefing.lesson.commonMistakes.length > 0 && (
                            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                               <h4 className="flex items-center gap-2 text-amber-800 font-bold mb-3">
                                  <AlertTriangle size={18} /> Caution: Common Errors
                               </h4>
                               <ul className="space-y-2">
                                  {briefing.lesson.commonMistakes.map((mistake, i) => (
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
                               <MessageCircle size={18} /> Tactical Phrases
                            </h4>
                            <div className="space-y-3">
                              {briefing.keyPhrases?.map((phrase, i) => (
                                 <div key={i} className="p-3 bg-stone-50 rounded border border-stone-100 hover:bg-stone-100 transition-colors cursor-pointer" onClick={() => playAudio(phrase.german)}>
                                    <div className="font-bold text-stone-700">{phrase.german}</div>
                                    <div className="text-stone-400 italic text-xs mt-1">{phrase.english}</div>
                                 </div>
                              ))}
                            </div>
                          </div>

                          <div className="bg-stone-800 text-stone-300 p-6 rounded-lg shadow-lg relative overflow-hidden">
                             <div className="absolute top-0 right-0 p-4 opacity-10"><FileText size={80} /></div>
                             <h4 className="font-bold text-white mb-2 text-sm uppercase tracking-widest">Cultural Intel</h4>
                             <p className="text-sm italic font-serif leading-relaxed relative z-10">
                               "{briefing.culturalFact}"
                             </p>
                          </div>
                      </div>

                   </div>

                   <div className="mt-8 flex justify-end">
                      <Button onClick={() => setStep('clearance')} variant="primary" size="lg" className="w-full md:w-auto shadow-xl">
                        Proceed to Clearance <ShieldCheck size={18} />
                      </Button>
                   </div>
                </div>
              )}

              {/* STEP 3: CLEARANCE (Quiz) */}
              {step === 'clearance' && briefing.quiz && (
                <div className="animate-fade-in w-full max-w-2xl mx-auto">
                   <div className="text-center mb-8">
                      <div className="w-16 h-16 bg-stone-200 rounded-full flex items-center justify-center mx-auto mb-4 text-stone-500">
                         {quizCorrect ? <CheckCircle size={32} className="text-[#059669]" /> : <Lock size={32} />}
                      </div>
                      <h3 className="text-2xl font-display font-bold text-stone-800">Security Clearance</h3>
                      <p className="text-stone-500">Verify your understanding to unlock the mission.</p>
                   </div>

                   <div className="bg-white p-8 rounded-lg shadow-lg border-2 border-stone-200 mb-6 relative">
                      <h4 className="text-xl font-bold text-stone-800 mb-6">{briefing.quiz?.question}</h4>
                      <div className="space-y-3">
                        {briefing.quiz?.options.map((opt, i) => (
                           <button
                             key={i}
                             onClick={() => !quizCorrect && handleQuizSubmit(i)}
                             disabled={quizCorrect}
                             className={`w-full p-4 rounded-lg text-left font-bold border-2 transition-all text-lg
                               ${quizSelected === i 
                                  ? (quizCorrect && i === briefing.quiz.correctAnswer 
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
                      
                      {quizSelected !== null && !quizCorrect && (
                         <div className="mt-4 text-red-500 text-center font-bold animate-pulse">
                            Access Denied. Review intel and try again.
                         </div>
                      )}
                   </div>

                   <div className="flex gap-4">
                     <Button variant="ghost" onClick={() => setStep('briefing')} className="flex-1">Review Intel</Button>
                     <Button 
                       variant="primary" 
                       onClick={onStart} 
                       disabled={!quizCorrect}
                       className="flex-[2] py-4 text-lg shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                     >
                       {quizCorrect ? "START MISSION" : "AUTHORIZATION PENDING"}
                     </Button>
                   </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default MissionPrep;