import React, { useState, useEffect, useRef } from 'react';
import { UserProfile, CurriculumModule, ChatMessage, SuggestedResponse, PerformanceReview } from '../types';
import { generateMissionStart, processTurn, MissionResponse } from '../services/geminiService';
import MissionPrep from './MissionPrep';
import Button from './Button';
import { Mic, Send, Info, CheckCircle2, ArrowLeft, Loader2, Volume2, Map, Puzzle, RefreshCcw, Star, Award, TrendingUp, AlertTriangle } from 'lucide-react';
import { useSoundEffects } from '../hooks/useSoundEffects';
import { useTTS } from '../hooks/useTTS';

interface GameSessionProps {
  user: UserProfile;
  module: CurriculumModule;
  onExit: (xpEarned: number, completed: boolean) => void;
}

const GameSession: React.FC<GameSessionProps> = ({ user, module, onExit }) => {
  const { playSound } = useSoundEffects();
  const { speak } = useTTS();
  
  // Session State
  const [sessionState, setSessionState] = useState<'prep' | 'chat'>('prep');
  
  // Chat State
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [objectives, setObjectives] = useState<string[]>([]);
  const [objectivesStatus, setObjectivesStatus] = useState<boolean[]>([]);
  const [narrative, setNarrative] = useState('');
  const [culturalNote, setCulturalNote] = useState('');
  const [xpSession, setXpSession] = useState(0);
  const [missionStatus, setMissionStatus] = useState<'active' | 'completed' | 'failed'>('active');
  const [performanceReview, setPerformanceReview] = useState<PerformanceReview | null>(null);
  
  // Notifications
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sentence Builder State
  const [targetSentence, setTargetSentence] = useState<SuggestedResponse | null>(null);
  const [jumbledWords, setJumbledWords] = useState<{id: number, text: string}[]>([]);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize Chat when switching to 'chat' state
  useEffect(() => {
    if (sessionState === 'chat') {
      const initMission = async () => {
        try {
          setLoading(true);
          const data = await generateMissionStart(module, user);
          handleAiResponse(data, true);
          const initialObjectives = data.objectives || ["Complete the dialogue"];
          setObjectives(initialObjectives);
          setObjectivesStatus(new Array(initialObjectives.length).fill(false));
          playSound('paper', 0.6); // Scene Start Sound
        } catch (err) {
          console.error(err);
          setMessages([{ id: 'err', role: 'system', content: 'Connection to local guide failed. Please retry.' }]);
        } finally {
          setLoading(false);
        }
      };
      initMission();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionState]); 

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, jumbledWords]);

  useEffect(() => {
    if (toastMessage) {
      playSound('success', 0.4);
      const timer = setTimeout(() => setToastMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  // Effect for mission completion
  useEffect(() => {
    if (missionStatus === 'completed') {
      playSound('stamp', 0.8);
    }
  }, [missionStatus]);

  const shuffleArray = (array: any[]) => {
    return array.map(value => ({ value, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ value }) => value);
  };

  const handleAiResponse = (data: MissionResponse, isInitial: boolean = false) => {
    setNarrative(data.narrative);
    setXpSession(prev => prev + (data.xpAwarded || 0));
    if (data.culturalNote) setCulturalNote(data.culturalNote);
    
    // Performance Review at end
    if (data.performanceReview) {
      setPerformanceReview(data.performanceReview);
    }

    // Setup Sentence Builder
    if (data.suggestedResponses && data.suggestedResponses.length > 0) {
      const target = data.suggestedResponses[0];
      setTargetSentence(target);
      const words = target.german.split(' ').map((w, i) => ({ id: i, text: w }));
      setJumbledWords(shuffleArray(words));
    } else {
      setTargetSentence(null);
      setJumbledWords([]);
    }
    
    if (data.missionStatus) setMissionStatus(data.missionStatus);
    
    if (data.objectivesUpdate) {
      setObjectivesStatus(prev => {
        // Detect new completion
        data.objectivesUpdate.forEach((status, idx) => {
          if (status && !prev[idx] && !isInitial) {
            setToastMessage(`Goal Achieved: ${objectives[idx]}`);
          }
        });

        if (isInitial || prev.length === 0 || prev.length !== data.objectivesUpdate.length) {
          return data.objectivesUpdate;
        }
        return prev.map((status, index) => status || data.objectivesUpdate[index]);
      });
    }

    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'model',
      content: data.agentMessage,
      translation: data.englishTranslation,
      grammarCorrection: data.correction
    };
    
    // Slight delay for "thinking" feel + sound
    setTimeout(() => {
       setMessages(prev => [...prev, newMessage]);
       playSound('message', 0.3);
    }, isInitial ? 0 : 600);
  };

  const handleSend = async (text: string = input) => {
    if (!text.trim()) return;
    
    playSound('click', 0.5);
    setTargetSentence(null); // Clear exercise
    setJumbledWords([]);
    
    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', content: text };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const response = await processTurn(text, messages, module, objectives);
      handleAiResponse(response);
    } catch (err) {
      console.error(err);
      playSound('error');
    } finally {
      setLoading(false);
    }
  };

  const addWordToInput = (word: string) => {
    playSound('click', 0.3);
    setInput(prev => {
      const prefix = prev.trim().length > 0 ? prev.trim() + ' ' : '';
      return prefix + word;
    });
  };

  const playAudio = (text: string) => {
    speak(text);
  };

  // RENDER PREP
  if (sessionState === 'prep') {
    return (
      <div className="h-screen bg-[#f5f5f4] flex flex-col">
        <header className="h-16 border-b border-stone-200 bg-white flex items-center px-6 shrink-0 shadow-sm z-10">
           <button onClick={() => onExit(0, false)} className="text-stone-400 hover:text-[#059669] transition-colors mr-4">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-lg font-display font-bold text-stone-800">Journey Overview</h1>
        </header>
        <div className="flex-1 overflow-hidden relative">
          <MissionPrep 
            module={module} 
            onStart={() => setSessionState('chat')} 
            onCancel={() => onExit(0, false)} 
          />
        </div>
      </div>
    );
  }

  // RENDER COMPLETION / DEBRIEF
  if (missionStatus === 'completed') {
    return (
      <div className="min-h-screen bg-[#f5f5f4] flex items-center justify-center p-4 md:p-8 paper-texture overflow-y-auto">
        <div className="bg-white max-w-2xl w-full shadow-2xl border border-stone-200 rounded-lg overflow-hidden animate-fade-in relative transform transition-all">
          
          {/* Header */}
          <div className="bg-[#059669] text-white p-8 text-center relative overflow-hidden">
             <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] animate-pulse-subtle"></div>
             <div className="relative z-10">
               <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg text-[#059669] animate-bounce">
                  <Award size={40} />
               </div>
               <h2 className="text-3xl font-display font-bold mb-2">Journey Complete</h2>
               <p className="text-emerald-100 font-serif italic">"{module.title}" Complete</p>
             </div>
          </div>

          <div className="p-8 relative">
             {/* STAMP ANIMATION */}
             <div className="absolute top-4 right-8 opacity-0 animate-stamp z-20 pointer-events-none">
                <div className="border-4 border-red-800/80 rounded-full p-2 w-32 h-32 flex items-center justify-center transform rotate-12 text-red-900 font-bold font-display text-xl uppercase tracking-widest shadow-sm bg-red-100/10 backdrop-blur-[1px]">
                   APPROVED
                </div>
             </div>

             {/* XP Reward */}
             <div className="flex justify-center mb-8">
               <div className="bg-emerald-50 border border-emerald-100 px-6 py-3 rounded-full flex items-center gap-3 animate-slide-up">
                 <span className="text-stone-500 uppercase text-xs font-bold tracking-widest">Total Reward</span>
                 <span className="text-2xl font-display font-bold text-[#059669]">+{xpSession} Miles</span>
               </div>
             </div>

             {/* Performance Review */}
             {performanceReview && (
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div className="bg-stone-50 p-5 rounded-lg border border-stone-100 animate-slide-up" style={{animationDelay: '0.2s'}}>
                     <h4 className="flex items-center gap-2 text-[#059669] font-bold mb-3 uppercase text-xs tracking-widest">
                       <CheckCircle2 size={16} /> Strengths
                     </h4>
                     <p className="text-sm text-stone-700 leading-relaxed">{performanceReview.strengths}</p>
                  </div>
                  <div className="bg-amber-50 p-5 rounded-lg border border-amber-100 animate-slide-up" style={{animationDelay: '0.3s'}}>
                     <h4 className="flex items-center gap-2 text-amber-600 font-bold mb-3 uppercase text-xs tracking-widest">
                       <AlertTriangle size={16} /> Travel Notes
                     </h4>
                     <p className="text-sm text-stone-700 leading-relaxed">{performanceReview.weaknesses}</p>
                  </div>
               </div>
             )}
             
             {performanceReview && (
               <div className="mb-8 text-center italic text-stone-500 font-serif border-l-4 border-[#059669] pl-4 py-2 bg-stone-50 animate-ink">
                 "{performanceReview.feedback}"
               </div>
             )}

             <Button onClick={() => onExit(xpSession, true)} className="w-full py-4 text-lg shadow-lg">
               Return to Map
             </Button>
          </div>
        </div>
      </div>
    );
  }

  // RENDER CHAT
  return (
    <div className="flex flex-col h-screen bg-[#f5f5f4] text-stone-800 overflow-hidden font-sans relative">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="absolute top-20 left-1/2 transform -translate-x-1/2 z-50 animate-bounce">
           <div className="bg-[#059669] text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-2 font-bold">
              <CheckCircle2 size={20} /> {toastMessage}
           </div>
        </div>
      )}

      {/* Top Bar */}
      <header className="h-16 border-b border-stone-200 bg-white flex items-center justify-between px-6 shrink-0 shadow-sm z-10">
        <div className="flex items-center gap-4">
          <button onClick={() => onExit(0, false)} className="text-stone-400 hover:text-[#059669] transition-colors">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-lg font-display font-bold text-stone-800">{module.title}</h1>
            <div className="flex gap-2">
              <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-bold">Miles: {xpSession}</span>
            </div>
          </div>
        </div>
        <div className="hidden md:flex text-xs font-bold text-stone-400 uppercase tracking-widest gap-2 items-center">
          <Map size={14} /> Guide Mode: Active
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Main Chat Area */}
        <main className="flex-1 flex flex-col relative bg-[#fafaf9]">
          <div className="bg-[#fffbeb] p-4 border-b border-amber-100 text-sm text-amber-900 font-serif italic text-center shadow-sm animate-ink">
            {narrative || "Arriving at destination..."}
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-slide-up`}>
                <div className={`max-w-[85%] ${msg.role === 'user' ? 'items-end' : 'items-start'} flex flex-col`}>
                  <div className={`p-5 rounded-2xl relative shadow-sm transition-all duration-300 ${
                    msg.role === 'user' 
                      ? 'bg-[#059669] text-white rounded-br-sm shadow-md' 
                      : 'bg-white border border-stone-200 text-stone-800 rounded-bl-sm shadow-sm'
                  }`}>
                    <div className="flex justify-between items-start gap-3">
                      <p className="text-lg leading-relaxed">{msg.content}</p>
                      {msg.role === 'model' && (
                        <button
                          onClick={() => playAudio(msg.content)}
                          disabled={!msg.content?.trim()}
                          className={`text-stone-400 hover:text-[#059669] mt-1 ${!msg.content?.trim() ? 'opacity-40 cursor-not-allowed' : ''}`}
                        >
                          <Volume2 size={18} />
                        </button>
                      )}
                    </div>
                    {msg.translation && (
                      <div className={`mt-2 pt-2 border-t text-sm ${msg.role === 'user' ? 'border-white/20 text-emerald-100' : 'border-stone-100 text-stone-500'}`}>
                        {msg.translation}
                      </div>
                    )}
                    {msg.grammarCorrection && (
                      <div className="mt-3 bg-white/10 p-2 text-xs rounded border border-white/20 flex gap-2 items-start">
                        <Info size={14} className="mt-0.5 shrink-0" />
                        <span>{msg.grammarCorrection}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
            
            {loading && (
              <div className="flex justify-start animate-pulse">
                <div className="bg-white border border-stone-200 p-4 rounded-full text-stone-500 text-sm flex gap-2 items-center shadow-sm">
                  <Loader2 className="animate-spin w-4 h-4 text-[#059669]" /> Translating...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="bg-white p-4 border-t border-stone-200 relative z-20">
            
            {/* Sentence Builder / Jumbled Words */}
            {!loading && targetSentence && jumbledWords.length > 0 && (
              <div className="mb-4 bg-stone-50 p-3 rounded-lg border border-stone-200 animate-slide-up">
                 <div className="flex items-center justify-between text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">
                   <div className="flex items-center gap-1"><Puzzle size={14} /> Sentence Builder</div>
                   <button onClick={() => setTargetSentence(null)} className="hover:text-red-500">Skip</button>
                 </div>
                 <div className="text-sm text-stone-600 mb-3 italic">
                   Goal: "{targetSentence.english}"
                 </div>
                 <div className="flex flex-wrap gap-2">
                   {jumbledWords.map((wordObj) => (
                     <button 
                       key={wordObj.id}
                       onClick={() => addWordToInput(wordObj.text)}
                       className="bg-white border-2 border-[#059669] text-[#059669] hover:bg-[#059669] hover:text-white px-3 py-1.5 rounded-full font-bold shadow-sm transition-all text-sm active:scale-95"
                     >
                       {wordObj.text}
                     </button>
                   ))}
                   <button 
                     onClick={() => setInput('')}
                     className="ml-auto text-stone-400 hover:text-red-500 p-1"
                     title="Clear Input"
                   >
                     <RefreshCcw size={16} />
                   </button>
                 </div>
              </div>
            )}

            <div className="flex gap-2 max-w-4xl mx-auto">
              <div className="flex-1 relative">
                 <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Type your response or build it..."
                  className="w-full bg-stone-50 text-stone-800 border-2 border-stone-200 p-3 pr-10 focus:border-[#059669] outline-none rounded-lg transition-colors"
                  disabled={loading}
                />
                <Mic className="absolute right-3 top-3.5 text-stone-400 hover:text-[#059669] cursor-pointer" />
              </div>
              <Button onClick={() => handleSend()} disabled={loading || !input.trim()} className="!px-4 rounded-lg">
                <Send className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </main>

        {/* Sidebar */}
        <aside className="w-80 bg-stone-50 border-l border-stone-200 hidden lg:flex flex-col p-6 overflow-y-auto">
          <h3 className="font-display text-stone-800 mb-6 text-lg font-bold border-b border-stone-300 pb-2">
            Travel Goals
          </h3>
          <div className="space-y-4 mb-8">
            {objectives.map((obj, i) => (
              <div key={i} className={`flex gap-3 items-start transition-all duration-500 ${objectivesStatus[i] ? 'opacity-50' : 'opacity-100'}`}>
                 <div className={`mt-0.5 ${objectivesStatus[i] ? 'text-[#059669]' : 'text-stone-400'}`}>
                   {objectivesStatus[i] ? <CheckCircle2 size={20} /> : <div className="w-5 h-5 rounded-full border-2 border-stone-300" />}
                 </div>
                 <p className={`text-sm ${objectivesStatus[i] ? 'text-stone-400 line-through' : 'text-stone-700'}`}>
                   {obj}
                 </p>
              </div>
            ))}
          </div>
          {culturalNote && (
            <div className="bg-[#fffbeb] border border-amber-200 p-4 rounded-lg mb-6 shadow-sm animate-float">
               <h4 className="text-amber-800 font-bold text-xs uppercase tracking-widest mb-2 flex items-center gap-1">
                 <Info size={12} /> Cultural Insight
               </h4>
               <p className="text-sm text-amber-900 leading-relaxed font-serif">
                 {culturalNote}
               </p>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
};

export default GameSession;
