import React, { useState, useEffect } from 'react';
import { AppState, UserProfile, CurriculumModule, GermanLevel } from './types';
import { CURRICULUM } from './constants';
import Onboarding from './components/Onboarding';
import Dashboard from './components/Dashboard';
import GameSession from './components/GameSession';
import StoreModal from './components/StoreModal';
import Guidebook from './components/Guidebook';
import Analytics from './components/Analytics';
import LearningStrategy from './components/LearningStrategy';
import AdminConsole from './components/AdminConsole';
import AccessGate, { hasLocalAccess } from './components/AccessGate';
import BugReportButton from './components/BugReportButton';
import { Loader2 } from 'lucide-react';
import { supabase, mapProfileToUser, updateUserProfile, upsertModuleProgress } from './services/supabaseClient';

const App: React.FC = () => {
  const [accessUnlocked, setAccessUnlocked] = useState(() => {
    if (import.meta.env.DEV) return true;
    return hasLocalAccess();
  });
  const [appState, setAppState] = useState<AppState>(AppState.ONBOARDING);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const [activeModule, setActiveModule] = useState<CurriculumModule | null>(null);
  const [showStore, setShowStore] = useState(false);
  const [preSelectedLevel, setPreSelectedLevel] = useState<GermanLevel | null>(null);

  // SUPABASE AUTH INITIALIZATION
  useEffect(() => {
    if (!accessUnlocked) return;

    const initSession = async () => {
      // 1. Check active session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        setUserId(session.user.id);
        await fetchUserProfile(session.user.id);
      } else {
        setIsLoading(false);
        setAppState(AppState.ONBOARDING);
      }

      // 2. Listen for auth changes
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
        if (session) {
          setUserId(session.user.id);
          await fetchUserProfile(session.user.id);
        } else {
          setUser(null);
          setUserId(null);
          setAppState(AppState.ONBOARDING);
          setIsLoading(false);
        }
      });

      return () => subscription.unsubscribe();
    };

    initSession();
  }, [accessUnlocked]);

  const fetchUserProfile = async (uid: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', uid)
        .single();

      if (error) throw error;
      
      if (data) {
        setUser(mapProfileToUser(data));
        setAppState(AppState.DASHBOARD);
      } else {
        // User is authed but has no profile row (rare edge case, or during onboarding)
        setAppState(AppState.ONBOARDING);
      }
    } catch (e) {
      console.error("Profile fetch error:", e);
      setAppState(AppState.ONBOARDING);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOnboardingComplete = (profile: UserProfile) => {
    // Optimistic update for UI immediate response
    // The actual DB insertion happened inside Onboarding.tsx
    setUser(profile);
    setAppState(AppState.DASHBOARD);
  };

  const handleSelectModule = (module: CurriculumModule) => {
    setActiveModule(module);
    setAppState(AppState.GAME_SESSION);
    if (userId) {
      upsertModuleProgress(userId, module.id, 'in_progress', 0, false);
    }
  };

  const handleExitSession = (xpEarned: number, completed: boolean) => {
    if (user && activeModule) {
      const newCompletedModules = completed 
          ? Array.from(new Set([...user.completedModules, activeModule.id]))
          : user.completedModules;

      const newCredits = user.credits + (completed ? 20 : 5);
      const newXp = user.xp + xpEarned;

      const updatedUser = { 
        ...user, 
        xp: newXp,
        credits: newCredits, 
        completedModules: newCompletedModules
      };
      
      // 1. Optimistic Update
      setUser(updatedUser);
      
      // 2. DB Update (Only if logged in)
      if (userId) {
        updateUserProfile(userId, {
          xp: newXp,
          credits: newCredits,
          completedModules: newCompletedModules
        });
        upsertModuleProgress(
          userId,
          activeModule.id,
          completed ? 'completed' : 'in_progress',
          xpEarned,
          completed
        );
      }
    }
    setActiveModule(null);
    setAppState(AppState.DASHBOARD);
  };

  const handlePurchaseLevel = (level: GermanLevel, creditsRemaining: number, ownedLevels: GermanLevel[]) => {
    if (!user) return;
    const updatedUser = {
      ...user,
      credits: creditsRemaining,
      ownedLevels
    };
    setUser(updatedUser);
    setPreSelectedLevel(null);
  };

  const handleOpenStoreForLevel = (level: GermanLevel) => {
    setPreSelectedLevel(level);
    setShowStore(true);
  };

  const handleUnlockModule = (moduleId: string, cost: number) => {
    if (user && user.credits >= cost) {
      const newCredits = user.credits - cost;
      const newUnlocked = [...user.unlockedModules, moduleId];

      const updatedUser = {
        ...user,
        credits: newCredits,
        unlockedModules: newUnlocked
      };
      
      setUser(updatedUser);
      
      if (userId) {
        updateUserProfile(userId, { credits: newCredits, unlockedModules: newUnlocked });
      }
    }
  };

  // --- DEV / TESTING TOOLS ---
  const handleDevAction = async (action: 'add_credits' | 'unlock_all' | 'reset' | 'open_admin') => {
    if (action === 'open_admin') {
      setAppState(AppState.ADMIN);
      return;
    }

    if (!user) return;
    
    let updatedUser = { ...user };
    
    if (action === 'add_credits') {
      updatedUser.credits += 1000;
    } 
    else if (action === 'unlock_all') {
      updatedUser.ownedLevels = Object.values(GermanLevel);
      updatedUser.completedModules = CURRICULUM.map(m => m.id);
    } 
    else if (action === 'reset') {
       updatedUser = {
         ...updatedUser,
         level: GermanLevel.A1,
         credits: 100,
         xp: 0,
         streak: 1,
         completedModules: [],
         unlockedModules: ['A1.1', 'A1.2', 'A1.3', 'A1.4', 'A1.5', 'A1.6'],
         ownedLevels: []
       };
	    }
	    
	    setUser(updatedUser);
	    if (userId) {
	      await updateUserProfile(userId, updatedUser);
	    }
	  };

	  if (!accessUnlocked) {
	    return <AccessGate onUnlocked={() => setAccessUnlocked(true)} />;
	  }

	  if (isLoading) {
	    return (
	      <div className="h-screen w-screen bg-[#f5f5f4] flex items-center justify-center">
	        <Loader2 className="w-10 h-10 text-[#059669] animate-spin" />
	      </div>
    );
  }

  return (
    <div className="font-sans text-stone-900">
      <BugReportButton
        appState={appState}
        userId={userId}
        userLevel={user?.level}
      />
      {appState === AppState.ONBOARDING && (
        <Onboarding 
          onComplete={handleOnboardingComplete} 
        />
      )}

      {appState === AppState.DASHBOARD && user && (
        <>
          <Dashboard 
            user={user} 
            onSelectModule={handleSelectModule} 
            onOpenStore={() => setShowStore(true)}
            onOpenLevelPurchase={handleOpenStoreForLevel}
            onOpenGuidebook={() => setAppState(AppState.GUIDEBOOK)}
            onOpenAnalytics={() => setAppState(AppState.ANALYTICS)}
            onOpenStrategy={() => setAppState(AppState.LEARNING_STRATEGY)}
            onUnlockModule={handleUnlockModule}
            onDevAction={handleDevAction}
          />
          {showStore && (
            <StoreModal 
              user={user}
              initialLevel={preSelectedLevel}
              onClose={() => { setShowStore(false); setPreSelectedLevel(null); }} 
              onPurchaseLevel={handlePurchaseLevel} 
            />
          )}
        </>
      )}

      {appState === AppState.GAME_SESSION && user && activeModule && (
        <GameSession 
          user={user} 
          module={activeModule} 
          onExit={handleExitSession} 
        />
      )}

      {appState === AppState.GUIDEBOOK && user && (
        <Guidebook 
          onBack={() => setAppState(AppState.DASHBOARD)} 
          level={user.level}
        />
      )}

      {appState === AppState.ANALYTICS && user && (
        <Analytics 
          user={user}
          onBack={() => setAppState(AppState.DASHBOARD)}
        />
      )}

      {appState === AppState.LEARNING_STRATEGY && (
        <LearningStrategy 
          onBack={() => setAppState(AppState.DASHBOARD)} 
        />
      )}
      
      {appState === AppState.ADMIN && (
        <AdminConsole onExit={() => setAppState(AppState.DASHBOARD)} />
      )}
    </div>
  );
};

export default App;
