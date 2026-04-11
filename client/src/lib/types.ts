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
import subprocess
import hashlib
import pickle
import os

# Hardcoded credentials - CWE-798
DB_PASSWORD = "admin123"
SECRET_KEY = "hardcoded_secret_key_12345"

def get_user(username, password):
    """Vulnerable to SQL injection - CWE-89"""
    conn = sqlite3.connect("users.db")
    cursor = conn.cursor()
    # Direct string interpolation - NEVER do this!
    query = f"SELECT * FROM users WHERE username='{username}' AND password='{password}'"
    cursor.execute(query)
    return cursor.fetchone()

def run_command(user_input):
    """Vulnerable to command injection - CWE-78"""
    result = subprocess.run(f"echo {user_input}", shell=True, capture_output=True)
    return result.stdout

def weak_hash(data):
    """Insecure cryptographic algorithm - CWE-327"""
    return hashlib.md5(data.encode()).hexdigest()

def load_user_data(serialized_data):
    """Insecure deserialization - CWE-502"""
    return pickle.loads(serialized_data)

def read_file(filename):
    """Path traversal vulnerability - CWE-22"""
    base_dir = "/var/www/files/"
    filepath = base_dir + filename  # No path sanitization!
    with open(filepath, 'r') as f:
        return f.read()

def authenticate(username, password):
    user = get_user(username, password)
    if user:
        token = weak_hash(username + SECRET_KEY)
        return {"token": token, "user": user}
    return None
`;
