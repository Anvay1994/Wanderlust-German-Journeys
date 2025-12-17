import React, { useMemo, useState, useEffect } from 'react';
import { UserProfile, CurriculumModule, GermanLevel } from '../types';
import { CURRICULUM } from '../constants';
import Button from './Button';
import { Lock, CheckCircle2, Coins, MapPin, TrendingUp, Book, Compass, HelpCircle, X, Zap, Ticket, CreditCard, Tag, Terminal, PlusCircle, Unlock, RotateCcw, ShieldAlert, Dumbbell, Type, Hash, PieChart, Lightbulb } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface DashboardProps {
  user: UserProfile;
  onSelectModule: (module: CurriculumModule) => void;
  onOpenStore: () => void;
  onOpenLevelPurchase: (level: GermanLevel) => void;
  onOpenGuidebook: () => void;
  onOpenAnalytics: () => void;
  onOpenStrategy: () => void;
  onUnlockModule: (moduleId: string, cost: number) => void;
  onDevAction?: (action: 'add_credits' | 'unlock_all' | 'reset' | 'open_admin') => void;
}

const Dashboard: React.FC<DashboardProps> = ({ user, onSelectModule, onOpenStore, onOpenLevelPurchase, onOpenGuidebook, onOpenAnalytics, onOpenStrategy, onDevAction }) => {
  const [showTokenInfo, setShowTokenInfo] = useState(false);
  const [showDevTools, setShowDevTools] = useState(false);
  
  // INDIA MARKET DEFAULT
  const [currency, setCurrency] = useState({ symbol: '₹', rate: 1 });
  
  const getPriceDisplay = (level: GermanLevel) => {
      // Fixed INR pricing matching StoreModal
      const price = level === GermanLevel.A1 ? 1499.00 : 2999.00;
      return `${currency.symbol}${price.toLocaleString('en-IN')}`;
  };

  const progressData = [
    { name: 'Vocab', score: 65 },
    { name: 'Grammar', score: 40 },
    { name: 'Culture', score: 55 },
    { name: 'Speech', score: 30 },
  ];

  // Group curriculum by level
  const groupedCurriculum = useMemo(() => {
    const groups: Record<string, CurriculumModule[]> = {
      [GermanLevel.A1]: [],
      [GermanLevel.A2]: [],
      [GermanLevel.B1]: [],
      [GermanLevel.B2]: [],
      [GermanLevel.C1]: [],
      [GermanLevel.C2]: [],
    };
    CURRICULUM.forEach(mod => {
      if (groups[mod.level]) groups[mod.level].push(mod);
    });
    return groups;
  }, []);

  const handleModuleClick = (module: CurriculumModule, isAccessible: boolean, isPaywalled: boolean) => {
    if (isAccessible) {
       onSelectModule(module);
    } else if (isPaywalled) {
       onOpenLevelPurchase(module.level);
    }
  };

  const GuidebookCard = (
    <div 
      onClick={onOpenGuidebook}
      className="bg-[#059669] text-white p-6 rounded-lg cursor-pointer hover:bg-[#047857] transition-all shadow-md group relative overflow-hidden mb-6 border-b-4 border-[#047857]"
    >
       {/* Decorative Pattern Background */}
       <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/notebook.png')]"></div>
       
       <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform duration-500 rotate-12">
          <Compass size={140} />
       </div>

       <div className="relative z-10">
         <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
               <h3 className="text-2xl font-display font-bold mb-1 flex items-center gap-2 text-white">
                 <Book size={24} className="text-emerald-100" /> Pocket Guide
               </h3>
               <p className="text-emerald-50 text-sm max-w-md font-serif italic opacity-90">
                 "A traveler without knowledge is a bird without wings."
               </p>
            </div>
            <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full border border-white/30 text-xs font-bold uppercase tracking-widest hover:bg-white/30 transition-colors">
               Open Field Manual
            </div>
         </div>

         {/* Visible Contents Grid - Tactile Paper Tags Style */}
         <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { icon: Book, label: 'Grammar', sub: 'Rules & Tables' },
              { icon: Dumbbell, label: 'Drills', sub: 'Daily Practice' },
              { icon: Type, label: 'Alphabet', sub: 'Pronunciation' },
              { icon: Hash, label: 'Numbers', sub: 'Counting' }
            ].map((item, idx) => (
              <div key={idx} className="bg-[#fffbeb] text-stone-800 p-3 rounded shadow-sm border-2 border-transparent hover:border-emerald-300 transition-all transform hover:-translate-y-0.5 group-hover:shadow-md flex items-center gap-3">
                 <div className="bg-emerald-100 text-[#059669] p-2 rounded-full">
                    <item.icon size={18} />
                 </div>
                 <div>
                    <span className="block text-sm font-bold leading-tight">{item.label}</span>
                    <span className="text-[10px] text-stone-500 font-bold uppercase tracking-wide">{item.sub}</span>
                 </div>
              </div>
            ))}
         </div>
       </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f5f5f4] text-stone-800 paper-texture relative">
      {/* DEV TOOLS WIDGET - Moved to top level for Z-Index safety */}
      {onDevAction && (
        <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end gap-2">
           {showDevTools && (
             <div className="bg-stone-900 text-white p-4 rounded-lg shadow-2xl border border-stone-600 w-64 animate-fade-in mb-2">
                <div className="flex justify-between items-center mb-3 border-b border-stone-700 pb-2">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-stone-400 flex items-center gap-2">
                    <Terminal size={14} /> Developer Console
                  </h4>
                  <button onClick={() => setShowDevTools(false)} className="text-stone-500 hover:text-white"><X size={14}/></button>
                </div>
                <div className="space-y-2">
                   <button onClick={() => onDevAction('add_credits')} className="w-full text-left text-sm px-3 py-2 bg-stone-800 hover:bg-stone-700 rounded text-green-400 flex items-center gap-2 transition-colors border border-stone-700">
                      <PlusCircle size={14} /> Add 1,000 Credits
                   </button>
                   <button onClick={() => onDevAction('unlock_all')} className="w-full text-left text-sm px-3 py-2 bg-stone-800 hover:bg-stone-700 rounded text-amber-400 flex items-center gap-2 transition-colors border border-stone-700">
                      <Unlock size={14} /> Unlock All Levels
                   </button>
                   <button onClick={() => onDevAction('reset')} className="w-full text-left text-sm px-3 py-2 bg-stone-800 hover:bg-stone-700 rounded text-red-400 flex items-center gap-2 transition-colors border border-stone-700">
                      <RotateCcw size={14} /> Reset Progress
                   </button>
                   <div className="h-px bg-stone-700 my-2"></div>
                   <button onClick={() => onDevAction('open_admin')} className="w-full text-left text-sm px-3 py-2 bg-emerald-900 hover:bg-emerald-800 rounded text-emerald-100 flex items-center gap-2 transition-colors border border-emerald-700 font-bold">
                      <ShieldAlert size={14} /> Open Admin Panel
                   </button>
                </div>
             </div>
           )}
           <button 
             onClick={() => setShowDevTools(!showDevTools)}
             className={`p-4 rounded-full shadow-2xl transition-all border-2 flex items-center justify-center transform hover:scale-110 ${showDevTools ? 'bg-stone-800 text-white border-white' : 'bg-red-600 text-white border-red-400 hover:bg-red-700'}`}
             title="Open Developer Console"
           >
             <Terminal size={24} />
           </button>
        </div>
      )}

      {/* TOKEN INFO MODAL */}
      {showTokenInfo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/40 backdrop-blur-sm p-4 animate-fade-in">
           <div className="bg-white w-full max-w-md rounded-xl shadow-2xl overflow-hidden border border-stone-200">
              <div className="bg-amber-400 p-6 flex justify-between items-start relative overflow-hidden">
                 <div className="absolute -right-4 -bottom-8 opacity-20 text-amber-900">
                    <Coins size={120} />
                 </div>
                 <div className="relative z-10">
                    <h2 className="text-2xl font-display font-bold text-amber-950 mb-1">Scholarship Credits</h2>
                    <p className="text-amber-800 text-sm font-bold opacity-80">Learn to Earn Discounts</p>
                 </div>
                 <button onClick={() => setShowTokenInfo(false)} className="text-amber-900 hover:bg-white/20 p-1 rounded-full relative z-10">
                    <X size={20} />
                 </button>
              </div>
              <div className="p-6 space-y-6">
                 <div>
                    <h3 className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-3">How it works</h3>
                    <p className="text-sm text-stone-600 mb-4">
                      We believe students should be rewarded for hard work. 
                      Collect credits by completing missions and maintaining your streak.
                      Use credits to get <strong>discounts</strong> on future levels.
                    </p>
                    <div className="space-y-3">
                       <div className="flex items-center gap-3 p-3 bg-stone-50 rounded-lg">
                          <div className="bg-green-100 text-green-600 p-2 rounded-full"><Zap size={18} /></div>
                          <div className="flex-1">
                             <p className="font-bold text-stone-800">Daily Streak</p>
                             <p className="text-xs text-stone-500">Log in daily</p>
                          </div>
                          <span className="font-bold text-[#059669] text-sm">+10 Credits</span>
                       </div>
                       <div className="flex items-center gap-3 p-3 bg-stone-50 rounded-lg">
                          <div className="bg-blue-100 text-blue-600 p-2 rounded-full"><Ticket size={18} /></div>
                          <div className="flex-1">
                             <p className="font-bold text-stone-800">Student Discount</p>
                             <p className="text-xs text-stone-500">Redeem credits at checkout</p>
                          </div>
                          <span className="font-bold text-amber-600 text-sm">Up to 20% OFF</span>
                       </div>
                    </div>
                 </div>
                 
                 <Button onClick={onOpenStore} variant="secondary" className="w-full">
                    Visit Store
                 </Button>
              </div>
           </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 py-8 relative">
        {/* Header Stats */}
        <header className="flex flex-col md:flex-row justify-between items-center mb-8 bg-white p-6 shadow-sm border border-stone-200 rounded-lg">
          <div className="flex items-center gap-4">
             <div className="w-16 h-16 bg-stone-100 rounded-full border-2 border-[#059669] flex items-center justify-center overflow-hidden">
                <span className="font-display text-2xl text-[#059669]">{user.name.charAt(0)}</span>
             </div>
             <div>
                <h1 className="text-3xl font-display text-stone-800">Willkommen, {user.name}</h1>
                <p className="text-stone-500 text-sm flex items-center gap-1">
                   <Book className="w-3 h-3" /> Level: {user.level} Traveler
                </p>
             </div>
          </div>
          
          <div className="flex gap-8 mt-6 md:mt-0">
             
            {/* Strategy Button */}
            <div className="flex flex-col items-center cursor-pointer hover:bg-stone-50 p-2 rounded group" onClick={onOpenStrategy}>
               <span className="text-xs text-stone-400 uppercase tracking-wider font-bold group-hover:text-amber-500 transition-colors">How to Play</span>
               <div className="text-xl font-display font-bold text-amber-500">
                  <Lightbulb className="w-6 h-6" />
               </div>
            </div>

            {/* Tokens - Clickable for Info */}
            <button 
               onClick={() => setShowTokenInfo(true)} 
               className="flex flex-col items-center group hover:bg-stone-50 p-2 rounded transition-colors cursor-pointer"
               title="Click for Currency Guide"
            >
              <span className="text-xs text-stone-400 uppercase tracking-wider font-bold flex items-center gap-1 group-hover:text-amber-500 transition-colors">
                 Credits <HelpCircle size={10} />
              </span>
              <div className="flex items-center text-amber-500 text-xl font-display font-bold">
                <Coins className="w-5 h-5 mr-1" /> {user.credits}
              </div>
            </button>

            <div className="flex flex-col items-center cursor-pointer hover:bg-stone-50 p-2 rounded" onClick={onOpenAnalytics}>
              <span className="text-xs text-stone-400 uppercase tracking-wider font-bold">Miles Traveled</span>
              <div className="text-xl font-display font-bold text-[#059669]">{user.xp} km</div>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-xs text-stone-400 uppercase tracking-wider font-bold">Day Streak</span>
              <div className="flex items-center text-[#be123c] text-xl font-display font-bold">
                {user.streak} <span className="text-xs ml-1 font-sans text-stone-400">DAYS</span>
              </div>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Mission Map (Modules) */}
          <div className="lg:col-span-2 space-y-8">
            
            {GuidebookCard}

            <div className="flex items-center justify-between border-b border-stone-300 pb-2 mb-4">
               <h2 className="text-2xl font-display text-stone-800">Your Itinerary</h2>
               <span className="text-sm text-stone-500 italic">72 Missions to Fluency</span>
            </div>
            
            {Object.keys(groupedCurriculum).map((levelKey) => {
              const typedLevel = levelKey as GermanLevel;
              const isOwned = user.ownedLevels.includes(typedLevel);
              const modules = groupedCurriculum[levelKey];

              return (
                <div key={levelKey} className={`space-y-4 p-4 rounded-xl border-2 transition-all ${isOwned ? 'border-transparent' : 'border-stone-200 bg-stone-50'}`}>
                   <div className="flex items-center justify-between">
                     <div className="flex items-center gap-2">
                       <h3 className="text-xl font-bold font-display text-stone-800">{levelKey}</h3>
                       {!isOwned && <Lock size={16} className="text-stone-400" />}
                     </div>
                     {!isOwned && (
                       <div className="flex flex-col items-end">
                          <Button 
                            variant="secondary" 
                            size="sm" 
                            className="!text-xs border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100"
                            onClick={() => onOpenLevelPurchase(typedLevel)}
                          >
                            Buy Pack: {getPriceDisplay(typedLevel)}
                          </Button>
                          {user.credits > 0 && (
                             <span className="text-[10px] text-[#059669] font-bold mt-1 flex items-center gap-1 animate-pulse">
                               <Tag size={10} /> Scholarship Available
                             </span>
                          )}
                       </div>
                     )}
                   </div>
                   
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {modules.map((module) => {
                         // LOGIC: Unlocked Sequentially
                         const globalIndex = CURRICULUM.findIndex(m => m.id === module.id);
                         const prevModule = globalIndex > 0 ? CURRICULUM[globalIndex - 1] : null;
                         const isSequentiallyUnlocked = globalIndex === 0 || (prevModule && user.completedModules.includes(prevModule.id));
                         
                         // LOGIC: Access
                         // A module is free if it's explicitly unlocked (like A1.1-A1.6).
                         // Otherwise, it's Paywalled if the Level is not Owned.
                         const isFreeModule = user.unlockedModules.includes(module.id);
                         const isPaywalled = !isOwned && !isFreeModule;
                         const isAccessible = isSequentiallyUnlocked && !isPaywalled;
                         const isCompleted = user.completedModules.includes(module.id);
                        
                         return (
                          <div 
                            key={module.id} 
                            className={`relative p-6 border rounded-lg bg-white shadow-sm transition-all duration-300 group
                              ${!isAccessible 
                                ? 'border-stone-200 opacity-80 cursor-pointer bg-stone-50' 
                                : 'border-stone-200 hover:border-[#059669] cursor-pointer hover:shadow-md hover:-translate-y-1'
                              }`}
                            onClick={() => handleModuleClick(module, isAccessible, isPaywalled)}
                          >
                            {/* Postcard Stamp Effect */}
                            <div className="absolute top-4 right-4 opacity-50 transform rotate-12 z-10">
                               {isCompleted && <CheckCircle2 size={40} className="text-[#059669]" />}
                               {!isAccessible && isPaywalled && <Lock size={30} className="text-stone-400" />}
                               {!isAccessible && !isPaywalled && <Lock size={30} className="text-stone-400" />}
                            </div>

                            <div className="mb-3 flex justify-between items-start">
                              <span className={`px-2 py-1 text-xs font-bold uppercase tracking-widest rounded-sm ${!isAccessible ? 'bg-stone-200 text-stone-400' : 'bg-[#ecfdf5] text-[#059669]'}`}>
                                {module.id}
                              </span>
                            </div>
                            
                            <h3 className="text-xl font-display font-bold text-stone-800 mb-2 group-hover:text-[#059669] transition-colors">{module.title}</h3>
                            <p className="text-sm text-stone-500 mb-4 h-10 overflow-hidden line-clamp-2">{module.description}</p>
                            
                            {/* Paywall Banner */}
                            {!isAccessible && isPaywalled && isSequentiallyUnlocked && (
                               <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] flex items-center justify-center z-20 rounded-lg">
                                  <div className="bg-amber-100 text-amber-800 px-4 py-2 rounded-full font-bold shadow-sm flex items-center gap-2 text-sm border border-amber-300 hover:scale-105 transition-transform">
                                     <CreditCard size={14} /> Buy Level {levelKey}
                                  </div>
                                </div>
                            )}

                            {/* HOVER SYLLABUS OVERLAY */}
                            <div className="absolute inset-0 bg-stone-900/95 backdrop-blur-sm p-6 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-center z-30 pointer-events-none">
                              <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                                  <h4 className="text-[#059669] font-bold uppercase tracking-widest text-xs mb-3 flex items-center gap-2">
                                    <Book size={14} /> Mission Syllabus
                                  </h4>
                                  <div className="mb-4">
                                    <p className="text-[10px] text-stone-500 uppercase font-bold mb-1">Grammar Focus</p>
                                    <ul className="text-sm space-y-1 text-stone-200">
                                        {module.grammarFocus.map((gf, i) => (
                                          <li key={i} className="flex items-start gap-2">
                                            <span className="mt-1.5 w-1 h-1 bg-[#059669] rounded-full shrink-0"></span>
                                            {gf}
                                          </li>
                                        ))}
                                    </ul>
                                  </div>
                                  <div>
                                    <p className="text-[10px] text-stone-500 uppercase font-bold mb-1">Vocabulary Theme</p>
                                    <p className="text-sm text-stone-200 flex items-center gap-2">
                                        <MapPin size={14} className="text-stone-400" /> {module.vocabularyTheme}
                                    </p>
                                  </div>
                              </div>
                            </div>

                            <div className="flex items-center text-xs text-stone-400 gap-1">
                              <MapPin size={12} />
                              <span>{module.vocabularyTheme}</span>
                            </div>
                          </div>
                        );
                      })}
                   </div>
                </div>
              );
            })}
          </div>

          {/* Side Panel: Analytics Preview */}
          <div className="space-y-8 min-w-0">
            
            <div className="bg-white border border-stone-200 p-6 rounded-lg shadow-sm min-w-0">
              <div className="flex justify-between items-center mb-4">
                 <h3 className="text-lg font-display text-stone-800 flex items-center">
                   <TrendingUp className="w-5 h-5 mr-2 text-[#059669]" /> 
                   Travel Skills
                 </h3>
                 <button onClick={onOpenAnalytics} className="text-xs font-bold text-[#059669] hover:underline flex items-center gap-1">
                    Full Report <PieChart size={12}/>
                 </button>
              </div>
              <div className="h-64 w-full min-w-0">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={progressData}>
                    <XAxis dataKey="name" stroke="#a8a29e" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis hide />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#fff', borderColor: '#e7e5e4', color: '#1c1917', borderRadius: '4px' }}
                      cursor={{ fill: '#f5f5f4' }}
                    />
                    <Bar dataKey="score" radius={[4, 4, 0, 0]}>
                      {progressData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#059669' : '#d97706'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white border border-stone-200 p-6 rounded-lg shadow-sm">
               <h3 className="text-lg font-display text-stone-800 mb-2">My Passport</h3>
               <div className="flex flex-wrap gap-2">
                  {Object.values(GermanLevel).map(lvl => (
                     <span 
                        key={lvl} 
                        className={`px-3 py-1 rounded text-xs font-bold border ${user.ownedLevels.includes(lvl) ? 'bg-[#059669] text-white border-[#059669]' : 'bg-stone-50 text-stone-300 border-stone-200'}`}
                     >
                        {lvl}
                     </span>
                  ))}
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
