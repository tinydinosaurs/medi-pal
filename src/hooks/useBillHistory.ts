import { useCallback } from "react";
import { useStorageState, useStorageFlag } from "@/lib/useStorageState";
import { storage } from "@/lib/storage";
import type { BillAnalysis, BillHistoryItem, BillStatus } from "@/types";

const HISTORY_STORAGE_KEY = "caretaker-bill-history";
const HISTORY_ENABLED_KEY = "caretaker-bill-history-enabled";
const MAX_HISTORY_ITEMS = 50;

export function useBillHistory() {
  const [history, setHistory] = useStorageState<BillHistoryItem[]>(
    HISTORY_STORAGE_KEY,
    []
  );

  const [isEnabled, setIsEnabled] = useStorageFlag(
    HISTORY_ENABLED_KEY,
    false
  );

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
    [isEnabled, setHistory],
  );

  const updateBillStatus = useCallback((id: string, status: BillStatus) => {
    setHistory((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status } : item)),
    );
  }, [setHistory]);

  const updateBillNotes = useCallback((id: string, notes: string) => {
    setHistory((prev) =>
      prev.map((item) => (item.id === id ? { ...item, notes } : item)),
    );
  }, [setHistory]);

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
    [setHistory],
  );

  const deleteBill = useCallback((id: string) => {
    setHistory((prev) => prev.filter((item) => item.id !== id));
  }, [setHistory]);

  const clearHistory = useCallback(() => {
    setHistory([]);
    storage.remove(HISTORY_STORAGE_KEY);
  }, [setHistory]);

  const toggleEnabled = useCallback((enabled: boolean) => {
    setIsEnabled(enabled);
  }, [setIsEnabled]);

  return {
    history,
    isEnabled,
    addBill,
    updateBillStatus,
    updateBillNotes,
    updateBillActions,
    deleteBill,
    clearHistory,
    toggleEnabled,
  };
}
