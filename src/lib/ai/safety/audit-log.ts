/**
 * Audit Logging
 *
 * Local-only logging of AI interactions for debugging.
 * Stores hashed message content to preserve privacy while enabling debugging.
 */

export interface AIInteractionLog {
  timestamp: string;
  userMessageHash: string; // SHA-256 hash, NOT the actual message
  responsePreview: string; // First 100 chars only
  safetyFlags: string[];
  severity: 'blocked' | 'warning' | 'clean';
  wasSubstituted: boolean;
}

const AUDIT_LOG_KEY = 'caretaker_ai_audit_log';
const MAX_LOG_ENTRIES = 100;

/**
 * Log an AI interaction (client-side only).
 */
export function logInteraction(interaction: AIInteractionLog): void {
  if (typeof window === 'undefined') {
    // Server-side: just console log
    if (interaction.severity !== 'clean') {
      console.warn('[AI Audit]', interaction);
    }
    return;
  }

  try {
    const logs: AIInteractionLog[] = JSON.parse(
      localStorage.getItem(AUDIT_LOG_KEY) || '[]'
    );

    logs.push(interaction);

    // Keep only last N entries
    const trimmedLogs = logs.slice(-MAX_LOG_ENTRIES);

    localStorage.setItem(AUDIT_LOG_KEY, JSON.stringify(trimmedLogs));
  } catch (error) {
    console.error('Failed to log AI interaction:', error);
  }
}

/**
 * Get the audit log (client-side only).
 */
export function getAuditLog(): AIInteractionLog[] {
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    return JSON.parse(localStorage.getItem(AUDIT_LOG_KEY) || '[]');
  } catch {
    return [];
  }
}

/**
 * Clear the audit log (client-side only).
 */
export function clearAuditLog(): void {
  if (typeof window === 'undefined') {
    return;
  }

  localStorage.removeItem(AUDIT_LOG_KEY);
}

/**
 * Get audit log statistics.
 */
export function getAuditStats(): {
  total: number;
  blocked: number;
  warnings: number;
  clean: number;
} {
  const logs = getAuditLog();

  return {
    total: logs.length,
    blocked: logs.filter((l) => l.severity === 'blocked').length,
    warnings: logs.filter((l) => l.severity === 'warning').length,
    clean: logs.filter((l) => l.severity === 'clean').length,
  };
}

/**
 * Hash a string using SHA-256 (for privacy-preserving logging).
 */
export async function hashString(str: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(str);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Synchronous hash for server-side use (simple, not cryptographic).
 * Only use for logging, not security.
 */
export function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(16);
}
