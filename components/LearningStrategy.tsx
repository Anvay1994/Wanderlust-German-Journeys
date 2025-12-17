import React from 'react';
import { ArrowLeft, Lightbulb, BookOpen, Mic, RefreshCw, Brain, Target, ShieldCheck, Ear, Coffee } from 'lucide-react';
import Button from './Button';

interface LearningStrategyProps {
  onBack: () => void;
}

const LearningStrategy: React.FC<LearningStrategyProps> = ({ onBack }) => {
  return (
    <div className="min-h-screen bg-[#f5f5f4] text-stone-800 paper-texture flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-stone-200 px-6 py-4 flex items-center justify-between shadow-sm sticky top-0 z-20">
         <div className="flex items-center gap-4">
            <button onClick={onBack} className="text-stone-400 hover:text-[#059669] transition-colors p-2 hover:bg-stone-50 rounded-full">
               <ArrowLeft size={24} />
            </button>
            <div>
               <h1 className="text-xl font-display font-bold text-stone-800 flex items-center gap-2">
                  <Lightbulb className="text-amber-500" /> Learning Strategy
               </h1>
               <p className="text-xs text-stone-500 font-bold uppercase tracking-widest">How to use this tool effectively</p>
            </div>
         </div>
      </header>

      <main className="flex-1 overflow-y-auto p-4 md:p-8">
         <div className="max-w-4xl mx-auto space-y-10">
            
            {/* Intro */}
            <div className="bg-stone-800 text-white p-8 rounded-xl shadow-lg relative overflow-hidden">
               <div className="absolute top-0 right-0 p-8 opacity-10">
                  <Brain size={140} />
               </div>
               <div className="relative z-10 max-w-2xl">
                  <h2 className="text-3xl font-display font-bold mb-4 text-amber-400">Don't just play. Immerse.</h2>
                  <p className="text-stone-300 text-lg leading-relaxed">
                     Wanderlust isn't a quiz app. It's a simulation. To gain fluency, you must treat every mission like a real-life interaction. Here is your roadmap to mastery.
                  </p>
               </div>
            </div>

            {/* The Loop */}
            <div>
               <h3 className="text-xl font-bold text-stone-800 mb-6 flex items-center gap-2">
                  <RefreshCw className="text-[#059669]" /> The Core Loop
               </h3>
               <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Step 1 */}
                  <div className="bg-white p-6 rounded-lg border-2 border-stone-200 hover:border-[#059669] transition-colors shadow-sm group">
                     <div className="w-12 h-12 bg-emerald-100 text-[#059669] rounded-full flex items-center justify-center mb-4 font-bold text-xl group-hover:scale-110 transition-transform">1</div>
                     <h4 className="font-bold text-lg mb-2">The Briefing (Study)</h4>
                     <p className="text-sm text-stone-600">
                        Never skip the intel. The "Mission Prep" contains the exact vocabulary and grammar rules you need. 
                        <strong> Speak the vocabulary out loud</strong> before you start.
                     </p>
                  </div>
                  {/* Step 2 */}
                  <div className="bg-white p-6 rounded-lg border-2 border-stone-200 hover:border-amber-500 transition-colors shadow-sm group">
                     <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mb-4 font-bold text-xl group-hover:scale-110 transition-transform">2</div>
                     <h4 className="font-bold text-lg mb-2">The Mission (Act)</h4>
                     <p className="text-sm text-stone-600">
                        Don't just click suggested responses. Try to <strong>type your own answers</strong> first. 
                        If you get stuck, use the "Sentence Builder" as a scaffold, then remove it later.
                     </p>
                  </div>
                  {/* Step 3 */}
                  <div className="bg-white p-6 rounded-lg border-2 border-stone-200 hover:border-blue-500 transition-colors shadow-sm group">
                     <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4 font-bold text-xl group-hover:scale-110 transition-transform">3</div>
                     <h4 className="font-bold text-lg mb-2">The Debrief (Review)</h4>
                     <p className="text-sm text-stone-600">
                        After the mission, read the <strong>Performance Review</strong>. 
                        The AI analyzes your specific mistakes. Note down your "Weaknesses" and practice them in the Guidebook.
                     </p>
                  </div>
               </div>
            </div>

            {/* Tactics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               
               <div className="bg-white p-6 rounded-xl shadow-sm border border-stone-200">
                  <h3 className="font-bold text-stone-800 mb-4 flex items-center gap-2">
                     <Mic className="text-red-500" /> The "Shadowing" Technique
                  </h3>
                  <p className="text-sm text-stone-600 mb-4">
                     When the AI guide speaks, click the <span className="inline-block bg-stone-100 p-1 rounded"><Mic size={12} className="inline"/> Audio</span> button. 
                     Listen to the sentence, then <strong>repeat it out loud</strong> immediately. This mimics the intonation and speed of native speakers.
                  </p>
                  <div className="bg-red-50 border border-red-100 p-3 rounded text-xs text-red-800 italic">
                     "Your mouth needs muscle memory just like your brain."
                  </div>
               </div>

               <div className="bg-white p-6 rounded-xl shadow-sm border border-stone-200">
                  <h3 className="font-bold text-stone-800 mb-4 flex items-center gap-2">
                     <Target className="text-blue-500" /> Strategic Failures
                  </h3>
                  <p className="text-sm text-stone-600 mb-4">
                     It is okay to fail a mission. In fact, you should try to <strong>push the boundaries</strong>. 
                     Try saying something unexpected to the AI guide. See how it reacts. Testing the limits of the language is how you learn nuances.
                  </p>
                  <div className="bg-blue-50 border border-blue-100 p-3 rounded text-xs text-blue-800 italic">
                     "A quiet learner is a slow learner."
                  </div>
               </div>

               <div className="bg-white p-6 rounded-xl shadow-sm border border-stone-200">
                  <h3 className="font-bold text-stone-800 mb-4 flex items-center gap-2">
                     <ShieldCheck className="text-purple-500" /> The CEFR Ladder
                  </h3>
                  <p className="text-sm text-stone-600 mb-4">
                     We follow the official European Framework (A1-C2). 
                     Don't rush to unlock C1 if you haven't mastered A2. 
                     Use the <strong>Analytics</strong> tab to ensure your "Grammar" skill is keeping up with your "Vocabulary".
                  </p>
               </div>

               <div className="bg-white p-6 rounded-xl shadow-sm border border-stone-200">
                  <h3 className="font-bold text-stone-800 mb-4 flex items-center gap-2">
                     <Coffee className="text-stone-500" /> Consistency over Intensity
                  </h3>
                  <p className="text-sm text-stone-600 mb-4">
                     15 minutes a day is better than 2 hours once a week. 
                     Use the <strong>Guidebook Drills</strong> for quick 5-minute sessions when you don't have time for a full mission.
                  </p>
               </div>

            </div>

            {/* CTA */}
            <div className="text-center pt-8">
               <Button onClick={onBack} size="lg" className="shadow-xl">
                  Ready to Start?
               </Button>
            </div>

         </div>
      </main>
    </div>
  );
};

export default LearningStrategy;
