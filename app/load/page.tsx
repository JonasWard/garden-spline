'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useState } from 'react';

import { decodeConfiguratorState } from '@/components/ui/state-string/densing-state';

export default function LoadConfiguratorStatePage() {
  const router = useRouter();
  const [stateString, setStateString] = useState('');
  const [error, setError] = useState<string | null>(null);

  const onLoad = useCallback(() => {
    const trimmed = stateString.trim();
    if (!trimmed) {
      setError('Paste a dense state string first.');
      return;
    }
    try {
      decodeConfiguratorState(trimmed);
      setError(null);
      router.push(`/configurator?state=${encodeURIComponent(trimmed)}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not decode state string.');
    }
  }, [router, stateString]);

  return (
    <div className="min-h-screen bg-[#1a1a1a] text-white flex flex-col items-center justify-center p-6 gap-6">
      <div className="w-full max-w-xl space-y-4">
        <header className="space-y-1">
          <h1 className="text-xl font-semibold text-white/90">Load configurator state</h1>
          <p className="text-sm text-white/50">Paste a string encoded with the densing schema.</p>
        </header>
        <textarea
          className="w-full min-h-[8rem] bg-black/30 border border-white/20 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-[#f3d5a3] font-mono"
          value={stateString}
          onChange={(e) => setStateString(e.target.value)}
          placeholder="Dense state string…"
          spellCheck={false}
        />
        {error && <p className="text-sm text-red-400">{error}</p>}
        <div className="flex gap-3">
          <button
            type="button"
            className="px-4 py-2 rounded-lg bg-[#f3d5a3] text-[#1a1a1a] font-medium hover:opacity-90"
            onClick={onLoad}
          >
            Load
          </button>
          <Link
            href="/configurator"
            className="px-4 py-2 rounded-lg border border-white/20 text-white/80 hover:border-white/40"
          >
            Open configurator
          </Link>
        </div>
      </div>
    </div>
  );
}
