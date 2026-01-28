import { useState, useEffect, useCallback } from "react";
import type { BillAnalysis, BillHistoryItem, BillStatus } from "@/types";

const HISTORY_STORAGE_KEY = "caretaker-bill-history";
const HISTORY_ENABLED_KEY = "caretaker-bill-history-enabled";
const MAX_HISTORY_ITEMS = 50;

function loadBillHistory(): BillHistoryItem[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = localStorage.getItem(HISTORY_STORAGE_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed as BillHistoryItem[];
    }
  } catch {
    // Ignore invalid data
  }

  return [];
}

function saveBillHistory(history: BillHistoryItem[]): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history));
  } catch {
    // Ignore storage errors
  }
}

function loadHistoryEnabled(): boolean {
  if (typeof window === "undefined") return false;

  try {
    return localStorage.getItem(HISTORY_ENABLED_KEY) === "true";
  } catch {
    return false;
  }
}

function saveHistoryEnabled(enabled: boolean): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(HISTORY_ENABLED_KEY, enabled ? "true" : "false");
  } catch {
    // Ignore storage errors
  }
}

export function useBillHistory() {
  const [history, setHistory] = useState<BillHistoryItem[]>(() =>
    loadBillHistory(),
  );

  const [isEnabled, setIsEnabled] = useState<boolean>(() =>
    loadHistoryEnabled(),
  );

  const isLoaded = typeof window !== "undefined";

  // Persist history when it changes
  useEffect(() => {
    if (isEnabled) {
      saveBillHistory(history);
    }
  }, [history, isEnabled]);

  // Persist enabled state and clear history if disabled
  useEffect(() => {
    saveHistoryEnabled(isEnabled);
  }, [isEnabled]);

  const addBill = useCallback(
    (billText: string, analysis: BillAnalysis) => {
      if (!isEnabled) return null;

      const now = new Date();
      const newItem: BillHistoryItem = {
        id: `${now.getTime()}-${Math.random().toString(36).slice(2, 8)}`,
        date: now.toISOString(),
        billText: billText,
        analysis,
        vendorName: analysis.vendorName,
        totalAmount: analysis.totalAmount,
        summary: analysis.summary,
        status: "waiting",
      };

      setHistory((prev) => [newItem, ...prev].slice(0, MAX_HISTORY_ITEMS));
      return newItem;
    },
    [isEnabled],
  );

  const updateBillStatus = useCallback((id: string, status: BillStatus) => {
    setHistory((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status } : item)),
    );
  }, []);

  const updateBillNotes = useCallback((id: string, notes: string) => {
    setHistory((prev) =>
      prev.map((item) => (item.id === id ? { ...item, notes } : item)),
    );
  }, []);

  const updateBillActions = useCallback(
    (
      id: string,
      actions: {
        contactScript?: string;
        doctorQuestions?: string;
        scamCheck?: string;
      },
    ) => {
      setHistory((prev) =>
        prev.map((item) => (item.id === id ? { ...item, ...actions } : item)),
      );
    },
    [],
  );

  const deleteBill = useCallback((id: string) => {
    setHistory((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
    localStorage.removeItem(HISTORY_STORAGE_KEY);
  }, []);

  const toggleEnabled = useCallback((enabled: boolean) => {
    setIsEnabled(enabled);
    saveHistoryEnabled(enabled);
  }, []);

  return {
    history,
    isEnabled,
    isLoaded,
    addBill,
    updateBillStatus,
    updateBillNotes,
    updateBillActions,
    deleteBill,
    clearHistory,
    toggleEnabled,
  };
}
