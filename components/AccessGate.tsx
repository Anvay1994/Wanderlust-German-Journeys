import React, { useMemo, useState } from 'react';
import Button from './Button';
import { Lock, KeyRound } from 'lucide-react';

type Props = {
  onUnlocked: () => void;
};

const STORAGE_KEY = 'wg_access_ok_v1';

export const hasLocalAccess = () => {
  try {
    return localStorage.getItem(STORAGE_KEY) === '1';
  } catch {
    return false;
  }
};

export const clearLocalAccess = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
};

const AccessGate: React.FC<Props> = ({ onUnlocked }) => {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = useMemo(() => code.trim().length > 0 && !loading, [code, loading]);

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/access/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code })
      });

      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json?.ok) {
        setError(json?.error || 'Invalid code');
        return;
      }

      try {
        localStorage.setItem(STORAGE_KEY, '1');
      } catch {
        // ignore
      }

      onUnlocked();
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-screen bg-[#f5f5f4] flex items-center justify-center p-6">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl border border-stone-200 overflow-hidden">
        <div className="p-6 border-b border-stone-200 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
            <Lock className="w-5 h-5 text-emerald-700" />
          </div>
          <div>
            <div className="font-display text-xl">Private Beta</div>
            <div className="text-sm text-stone-600">Enter the access code to continue.</div>
          </div>
        </div>

        <div className="p-6">
          <label className="block text-xs font-bold tracking-widest text-stone-500 mb-2">
            ACCESS CODE
          </label>
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400">
              <KeyRound className="w-4 h-4" />
            </div>
            <input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && canSubmit) handleSubmit();
              }}
              className="w-full pl-10 pr-3 py-3 rounded-md border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-500"
              placeholder="e.g. KOLHATKAR2025"
              autoFocus
            />
          </div>

          {error && (
            <div className="mt-3 text-sm text-rose-700 bg-rose-50 border border-rose-200 rounded-md p-3">
              {error}
            </div>
          )}

          <div className="mt-5 flex items-center gap-3">
            <Button onClick={handleSubmit} disabled={!canSubmit} className="flex-1">
              {loading ? 'Checking...' : 'Unlock'}
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                setCode('');
                setError(null);
              }}
              disabled={loading}
            >
              Clear
            </Button>
          </div>

          <div className="mt-4 text-xs text-stone-500">
            Tip: You only need to enter this once per device/browser.
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccessGate;

