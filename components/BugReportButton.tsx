import React, { useMemo, useState } from 'react';
import Button from './Button';
import { Bug, Copy, X } from 'lucide-react';

type Props = {
  appState?: string;
  userId?: string | null;
  userLevel?: string;
};

const safeString = (v: unknown) => (typeof v === 'string' ? v : '');

const buildReportText = (props: Props) => {
  const now = new Date().toISOString();
  const url = typeof window !== 'undefined' ? window.location.href : '';
  const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : '';
  const viewport =
    typeof window !== 'undefined' ? `${window.innerWidth}x${window.innerHeight}` : '';

  const lines = [
    'Wanderlust German Journeys — Bug Report',
    '',
    `Time (UTC): ${now}`,
    `URL: ${url}`,
    `Browser/Device: ${userAgent}`,
    `Viewport: ${viewport}`,
    `App State: ${safeString(props.appState)}`,
    `User ID: ${props.userId ?? ''}`,
    `User Level: ${safeString(props.userLevel)}`,
    '',
    'What were you doing? (steps to reproduce)',
    '1)',
    '2)',
    '3)',
    '',
    'Expected result:',
    '',
    'Actual result:',
    '',
    'Screenshot / Screen recording (attach if possible):',
    '',
    'Console errors (optional):',
    ''
  ];

  return lines.join('\n');
};

const BugReportButton: React.FC<Props> = (props) => {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const reportText = useMemo(() => buildReportText(props), [props.appState, props.userId, props.userLevel]);

  const handleCopy = async () => {
    setCopied(false);
    try {
      await navigator.clipboard.writeText(reportText);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-4 left-4 z-50 bg-stone-900 text-white rounded-full shadow-lg px-4 py-2 text-sm font-bold flex items-center gap-2 hover:bg-stone-800"
      >
        <Bug className="w-4 h-4" />
        Report a bug
      </button>

      {open && (
        <div className="fixed inset-0 z-[60] bg-black/40 flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl border border-stone-200 overflow-hidden">
            <div className="p-4 border-b border-stone-200 flex items-center justify-between">
              <div className="font-display text-lg">Bug Report</div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="p-2 rounded-md hover:bg-stone-100"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4">
              <div className="text-sm text-stone-600 mb-3">
                Click copy, then paste into WhatsApp/Email along with a screenshot or screen recording.
              </div>

              <textarea
                readOnly
                value={reportText}
                className="w-full h-72 p-3 rounded-md border border-stone-300 font-mono text-xs focus:outline-none"
              />

              <div className="mt-3 flex items-center gap-3">
                <Button onClick={handleCopy} className="flex-1">
                  <Copy className="w-4 h-4" />
                  {copied ? 'Copied!' : 'Copy report'}
                </Button>
                <Button variant="secondary" onClick={() => setOpen(false)}>
                  Close
                </Button>
              </div>

              {!copied && (
                <div className="mt-3 text-xs text-stone-500">
                  If copy doesn’t work, you can manually select all text in the box and copy.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default BugReportButton;

