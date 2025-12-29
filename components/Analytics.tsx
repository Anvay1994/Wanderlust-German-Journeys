import React, { useMemo } from 'react';
import { UserProfile, CurriculumModule, GermanLevel } from '../types';
import { CURRICULUM } from '../constants';
import { 
  ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, 
  BarChart, Bar, XAxis, YAxis, Tooltip, Cell, AreaChart, Area, CartesianGrid 
} from 'recharts';
import { ArrowLeft, TrendingUp, Award, BookOpen, Target, Brain, Languages, Crown, ArrowRight, Compass } from 'lucide-react';

interface AnalyticsProps {
  user: UserProfile;
  onBack: () => void;
}

const Analytics: React.FC<AnalyticsProps> = ({ user, onBack }) => {

  // --- STATS CALCULATION ---

  // 1. Skill Radar Data
  const skillData = useMemo(() => {
    // Map mission types to skills
    const skills = {
      'Speaking': { count: 0, total: 0, color: '#059669' }, // Roleplay
      'Reading': { count: 0, total: 0, color: '#d97706' }, // Investigation
      'Grammar': { count: 0, total: 0, color: '#2563eb' }, // Puzzle
      'Vocab': { count: 0, total: 0, color: '#be123c' }    // Negotiation
    };

    CURRICULUM.forEach(mod => {
      let type: keyof typeof skills;
      switch (mod.missionType) {
        case 'Roleplay': type = 'Speaking'; break;
        case 'Investigation': type = 'Reading'; break;
        case 'Puzzle': type = 'Grammar'; break;
        case 'Negotiation': type = 'Vocab'; break;
        default: type = 'Speaking';
      }
      skills[type].total += 1;
      if (user.completedModules.includes(mod.id)) {
        skills[type].count += 1;
      }
    });

    return Object.entries(skills).map(([key, val]) => ({
      subject: key,
      A: Math.round((val.count / Math.max(1, val.total)) * 100),
      fullMark: 100
    }));
  }, [user.completedModules]);

  // 2. Level Progress Data
  const levelProgressData = useMemo(() => {
    const levels = Object.values(GermanLevel);
    return levels.map(lvl => {
      const modulesInLevel = CURRICULUM.filter(m => m.level === lvl);
      const completedInLevel = modulesInLevel.filter(m => user.completedModules.includes(m.id)).length;
      return {
        name: lvl,
        completed: completedInLevel,
        total: modulesInLevel.length,
        percentage: Math.round((completedInLevel / Math.max(1, modulesInLevel.length)) * 100)
      };
    });
  }, [user.completedModules]);

  // 3. Est. Vocabulary
  // Assuming approx 15 new words per module
  const estVocabulary = user.completedModules.length * 15;

  // 4. Focus Areas (Next 3 uncompleted modules)
  const focusAreas = useMemo(() => {
    return CURRICULUM
      .filter(m => !user.completedModules.includes(m.id) && user.unlockedModules.includes(m.id))
      .slice(0, 3);
  }, [user.completedModules, user.unlockedModules]);

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
                   <TrendingUp className="text-[#059669]" /> Travel Analytics
                </h1>
                <p className="text-xs text-stone-500 font-bold uppercase tracking-widest">Self-Paced Progress Report</p>
             </div>
          </div>
          <div className="hidden md:flex items-center gap-6">
             <div className="text-right">
                <div className="text-xs text-stone-400 font-bold uppercase tracking-widest">Words Learned</div>
                <div className="text-xl font-display font-bold text-[#059669]">{estVocabulary}</div>
             </div>
             <div className="text-right">
                <div className="text-xs text-stone-400 font-bold uppercase tracking-widest">Global Rank</div>
                <div className="text-xl font-display font-bold text-amber-500">Top 15%</div>
             </div>
          </div>
       </header>

       <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-6xl mx-auto space-y-8">
             
             {/* Top Row: Cards */}
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-sm flex items-center gap-4">
                   <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-[#059669]">
                      <Brain size={24} />
                   </div>
                   <div>
                      <div className="text-2xl font-display font-bold">{user.completedModules.length} / 72</div>
                      <div className="text-xs text-stone-500 font-bold uppercase tracking-widest">Journeys Complete</div>
                   </div>
                </div>
                <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-sm flex items-center gap-4">
                   <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
                      <Languages size={24} />
                   </div>
                   <div>
                      <div className="text-2xl font-display font-bold">~{estVocabulary}</div>
                      <div className="text-xs text-stone-500 font-bold uppercase tracking-widest">Active Vocab</div>
                   </div>
                </div>
                <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-sm flex items-center gap-4">
                   <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                      <Target size={24} />
                   </div>
                   <div>
                      <div className="text-2xl font-display font-bold">{user.streak} Days</div>
                      <div className="text-xs text-stone-500 font-bold uppercase tracking-widest">Current Streak</div>
                   </div>
                </div>
                <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-sm flex items-center gap-4">
                   <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
                      <Crown size={24} />
                   </div>
                   <div>
                      <div className="text-2xl font-display font-bold">{user.level}</div>
                      <div className="text-xs text-stone-500 font-bold uppercase tracking-widest">Current Title</div>
                   </div>
                </div>
             </div>

             {/* Middle Row: Charts */}
             <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Skill Radar */}
                <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-sm lg:col-span-1">
                   <h3 className="font-bold text-stone-800 mb-6 flex items-center gap-2">
                      <Compass size={18} className="text-[#059669]" /> Skill Compass
                   </h3>
                   <div className="h-64 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                         <RadarChart cx="50%" cy="50%" outerRadius="80%" data={skillData}>
                            <PolarGrid stroke="#e7e5e4" />
                            <PolarAngleAxis dataKey="subject" tick={{ fill: '#78716c', fontSize: 12, fontWeight: 'bold' }} />
                            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                            <Radar
                               name="Skills"
                               dataKey="A"
                               stroke="#059669"
                               strokeWidth={3}
                               fill="#059669"
                               fillOpacity={0.3}
                            />
                            <Tooltip contentStyle={{borderRadius: '8px'}} />
                         </RadarChart>
                      </ResponsiveContainer>
                   </div>
                   <div className="text-center text-xs text-stone-400 italic mt-2">
                      Shows balance between Speaking, Reading, Grammar & Vocab
                   </div>
                </div>

                {/* Level Progress */}
                <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-sm lg:col-span-2">
                   <h3 className="font-bold text-stone-800 mb-6 flex items-center gap-2">
                      <Award size={18} className="text-amber-500" /> Passport Progress (CEFR)
                   </h3>
                   <div className="h-64 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                         <BarChart data={levelProgressData} layout="vertical" margin={{top: 5, right: 30, left: 40, bottom: 5}}>
                            <XAxis type="number" domain={[0, 100]} hide />
                            <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fill: '#44403c', fontWeight: 'bold'}} />
                            <Tooltip cursor={{fill: 'transparent'}} contentStyle={{borderRadius: '8px'}} />
                            <Bar dataKey="percentage" barSize={20} radius={[0, 4, 4, 0]}>
                               {levelProgressData.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={entry.percentage === 100 ? '#059669' : '#d97706'} />
                               ))}
                            </Bar>
                         </BarChart>
                      </ResponsiveContainer>
                   </div>
                   <div className="flex justify-between px-12 text-xs text-stone-400 font-bold uppercase tracking-widest mt-2">
                      <span>0%</span>
                      <span>50%</span>
                      <span>100%</span>
                   </div>
                </div>
             </div>

             {/* Bottom Row: Focus Areas */}
             <div className="bg-white p-8 rounded-xl border border-stone-200 shadow-sm">
                <h3 className="font-bold text-stone-800 mb-6 flex items-center gap-2">
                   <Target size={18} className="text-red-500" /> Recommended Focus Areas
                </h3>
                {focusAreas.length > 0 ? (
                   <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {focusAreas.map(mod => (
                         <div key={mod.id} className="bg-stone-50 border border-stone-200 p-4 rounded-lg hover:border-stone-400 transition-colors">
                            <div className="flex justify-between items-start mb-2">
                               <span className="text-xs font-bold bg-white border border-stone-200 px-2 py-1 rounded text-stone-500">{mod.id}</span>
                               <span className="text-xs text-stone-400 uppercase tracking-widest">{mod.missionType}</span>
                            </div>
                            <h4 className="font-bold text-stone-800 mb-1">{mod.title}</h4>
                            <p className="text-sm text-stone-500 mb-3 line-clamp-2">{mod.description}</p>
                            <div className="text-xs text-[#059669] font-bold flex items-center gap-1">
                               <BookOpen size={12} /> Focus: {mod.grammarFocus[0]}
                            </div>
                         </div>
                      ))}
                   </div>
                ) : (
                   <div className="text-center py-10 text-stone-500">
                      <p>All unlocked journeys completed! Visit the Store to unlock more levels.</p>
                   </div>
                )}
             </div>

          </div>
       </main>
    </div>
  );
};

export default Analytics;
