// SecureReview — Global App State Context
// Stores scan history in React state (no localStorage)
// API key is now handled server-side — no longer stored here

import React, { createContext, useContext, useState, useCallback } from 'react';
import type { ScanRecord, AuditResult } from '@/lib/types';
import { nanoid } from 'nanoid';

interface AppContextValue {
  history: ScanRecord[];
  addScan: (result: AuditResult, code: string) => ScanRecord;
  clearHistory: () => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [history, setHistory] = useState<ScanRecord[]>([]);

  const addScan = useCallback((result: AuditResult, code: string): ScanRecord => {
    const record: ScanRecord = {
      id: nanoid(),
      timestamp: new Date(),
      language: result.language,
      overall_risk: result.overall_risk,
      findings_count: result.findings.length,
      result,
      code_snippet: code.slice(0, 200) + (code.length > 200 ? '...' : ''),
    };
    setHistory(prev => [record, ...prev]);
    return record;
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
  }, []);

  return (
    <AppContext.Provider value={{ history, addScan, clearHistory }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
