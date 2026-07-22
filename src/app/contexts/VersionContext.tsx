import { createContext, useContext, useState, ReactNode } from 'react';

export type AppVersion = 'stable' | 'alpha';

interface VersionContextValue {
  version: AppVersion;
  setVersion: (v: AppVersion) => void;
  isAlpha: boolean;
}

const VersionContext = createContext<VersionContextValue | null>(null);

function readVersion(): AppVersion {
  try {
    return (localStorage.getItem('aurevia_version') as AppVersion) ?? 'stable';
  } catch {
    return 'stable';
  }
}

function writeVersion(v: AppVersion) {
  try { localStorage.setItem('aurevia_version', v); } catch { /* sandboxed */ }
}

export function VersionProvider({ children }: { children: ReactNode }) {
  const [version, setVersionState] = useState<AppVersion>(readVersion);

  const setVersion = (v: AppVersion) => {
    setVersionState(v);
    writeVersion(v);
  };

  return (
    <VersionContext.Provider value={{ version, setVersion, isAlpha: version === 'alpha' }}>
      {children}
    </VersionContext.Provider>
  );
}

export function useVersion() {
  const ctx = useContext(VersionContext);
  if (!ctx) throw new Error('useVersion must be used within VersionProvider');
  return ctx;
}
