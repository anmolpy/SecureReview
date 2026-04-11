// SecureReview — Frontend API client
// Now routes through the backend tRPC endpoint (no API key needed on the frontend)

import type { AuditResult, Language } from './types';
import { trpc } from './trpc';

// This is a hook-compatible wrapper — the actual mutation is called from the Audit page
// using trpc.audit.analyze.useMutation()

// Re-export the type for convenience
export type { AuditResult };

// Helper to get the tRPC mutation hook
export function useAnalyzeCode() {
  return trpc.audit.analyze.useMutation();
}
