import React, { useState, useEffect } from 'react';
import { AppState, UserProfile, CurriculumModule, GermanLevel } from './types';
import { CURRICULUM } from './constants';
import Onboarding from './components/Onboarding';
import Dashboard from './components/Dashboard';
import GameSession from './components/GameSession';
import StoreModal from './components/StoreModal';
import Guidebook from './components/Guidebook';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.ONBOARDING);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [activeModule, setActiveModule] = useState<CurriculumModule | null>(null);
  const [showStore, setShowStore] = useState(false);
  const [preSelectedLevel, setPreSelectedLevel] = useState<GermanLevel | null>(null);

  // Load user from local storage (mock persistence)
  useEffect(() => {
    const savedUser = localStorage.getItem('neon_berlin_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
      setAppState(AppState.DASHBOARD);
    }
  }, []);

  const handleOnboardingComplete = (profile: UserProfile) => {
    // Ensure A1 is owned by default if not specified
    const initializedProfile = {
      ...profile,
      ownedLevels: profile.ownedLevels && profile.ownedLevels.length > 0 ? profile.ownedLevels : [GermanLevel.A1]
    };
    setUser(initializedProfile);
    localStorage.setItem('neon_berlin_user', JSON.stringify(initializedProfile));
    setAppState(AppState.DASHBOARD);
  };

  const handleSelectModule = (module: CurriculumModule) => {
    setActiveModule(module);
    setAppState(AppState.GAME_SESSION);
  };

  const handleExitSession = (xpEarned: number, completed: boolean) => {
    if (user && activeModule) {
      const updatedUser = { 
        ...user, 
        xp: user.xp + xpEarned,
        credits: user.credits + (completed ? 20 : 5), // Earn tokens for playing
        completedModules: completed 
          ? Array.from(new Set([...user.completedModules, activeModule.id]))
          : user.completedModules
      };
      setUser(updatedUser);
      localStorage.setItem('neon_berlin_user', JSON.stringify(updatedUser));
    }
    setActiveModule(null);
    setAppState(AppState.DASHBOARD);
  };

  const handlePurchaseLevel = (level: GermanLevel, tokensRedeemed: number) => {
    if (user) {
      const updatedUser = { 
        ...user, 
        credits: Math.max(0, user.credits - tokensRedeemed), 
        ownedLevels: [...user.ownedLevels, level] 
      };
      setUser(updatedUser);
      localStorage.setItem('neon_berlin_user', JSON.stringify(updatedUser));
      setPreSelectedLevel(null);
      // Keep store open or close it? Let's close it to show success on dashboard
      setShowStore(false);
    }
  };

  const handleOpenStoreForLevel = (level: GermanLevel) => {
    setPreSelectedLevel(level);
    setShowStore(true);
  };

  const handleUnlockModule = (moduleId: string, cost: number) => {
    // Legacy support for individual modules if needed, keeping for type safety
    if (user && user.credits >= cost) {
      const updatedUser = {
        ...user,
        credits: user.credits - cost,
        unlockedModules: [...user.unlockedModules, moduleId]
      };
      setUser(updatedUser);
      localStorage.setItem('neon_berlin_user', JSON.stringify(updatedUser));
    }
  };

  // --- DEV / TESTING TOOLS ---
  const handleDevAction = (action: 'add_credits' | 'unlock_all' | 'reset') => {
    if (!user) return;
    
    let updatedUser = { ...user };
    
    if (action === 'add_credits') {
      updatedUser.credits += 1000;
    } 
    else if (action === 'unlock_all') {
      updatedUser.ownedLevels = Object.values(GermanLevel);
      // Mark all modules as completed to bypass sequential locks for testing
      updatedUser.completedModules = CURRICULUM.map(m => m.id);
    } 
    else if (action === 'reset') {
       // Keep name and interests, reset progress
       updatedUser = {
         ...updatedUser,
         level: GermanLevel.A1,
         credits: 100,
         xp: 0,
         streak: 1,
         completedModules: [],
         unlockedModules: ['A1.1', 'A1.2', 'A1.3'],
         ownedLevels: [GermanLevel.A1]
       };
    }
    
    setUser(updatedUser);
    localStorage.setItem('neon_berlin_user', JSON.stringify(updatedUser));
  };

  return (
    <div className="font-sans text-white">
      {appState === AppState.ONBOARDING && (
        <Onboarding onComplete={handleOnboardingComplete} />
      )}

      {appState === AppState.DASHBOARD && user && (
        <>
          <Dashboard 
            user={user} 
            onSelectModule={handleSelectModule} 
            onOpenStore={() => setShowStore(true)}
            onOpenLevelPurchase={handleOpenStoreForLevel}
            onOpenGuidebook={() => setAppState(AppState.GUIDEBOOK)}
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
    </div>
  );
};

export default App;