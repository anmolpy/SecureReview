// SecureReview — Shared TypeScript types
// Design: Dark Glassmorphism / Cybersecurity Dashboard

export type Severity = 'Critical' | 'High' | 'Medium' | 'Low' | 'Informational';
export type OverallRisk = 'Critical' | 'High' | 'Medium' | 'Low' | 'Clean';
export type Language = 'Auto-detect' | 'Python' | 'JavaScript' | 'C/C++' | 'Java' | 'SQL' | 'Bash';

export interface Finding {
  id: string;           // CWE-XXX
  title: string;
  severity: Severity;
  line_hint: string | null;
  description: string;
  remediation: string;
}

export interface AnalysisAttempt {
  provider: string;
  model: string;
  status: 'started' | 'failed' | 'succeeded';
  timestamp: number;
  error?: string;
}

export interface AnalysisMeta {
  requestId: string;
  provider: string | null;
  model: string | null;
  attempts: AnalysisAttempt[];
}

export interface AuditResult {
  language: string;
  summary: string;
  overall_risk: OverallRisk;
  findings: Finding[];
  analysis_meta?: AnalysisMeta;
}

export interface ScanRecord {
  id: string;
  timestamp: Date;
  language: string;
  overall_risk: OverallRisk;
  findings_count: number;
  result: AuditResult;
  code_snippet: string;
}

export const SEVERITY_ORDER: Record<Severity, number> = {
  Critical: 0,
  High: 1,
  Medium: 2,
  Low: 3,
  Informational: 4,
};

export const LANGUAGES: Language[] = [
  'Auto-detect',
  'Python',
  'JavaScript',
  'C/C++',
  'Java',
  'SQL',
  'Bash',
];

export const SAMPLE_VULNERABLE_CODE = `import sqlite3
def get_user(username, password):
    conn = sqlite3.connect("users.db")
    cursor = conn.cursor()
  query = f"SELECT * FROM users WHERE username = '{username}' AND password = '{password}'"
    cursor.execute(query)
    return cursor.fetchone()

username = input("Enter username: ")
password = input("Enter password: ")
print(get_user(username, password))
`;
