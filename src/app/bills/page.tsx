"use client";

import { useState, useRef } from "react";
import {
  BillInputForm,
  BillAnalysisCard,
  BillActionsTabs,
  BillSubNav,
  NextStepsChecklist,
  BillHistory,
} from "@/components/bills";
import { useBillHistory } from "@/hooks/useBillHistory";
import type { BillAnalysis, BillHistoryItem } from "@/types";

export default function BillsPage() {
  // Analysis state
  const [billText, setBillText] = useState("");
  const [analysis, setAnalysis] = useState<BillAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Track current bill ID for updating actions in history
  const [currentBillId, setCurrentBillId] = useState<string | null>(null);

  // Secondary content state
  const [contactScript, setContactScript] = useState<string | null>(null);
  const [doctorQuestions, setDoctorQuestions] = useState<string | null>(null);
  const [scamCheck, setScamCheck] = useState<string | null>(null);
  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  // Checklist state
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);

  // Ref for scrolling to actions
  const actionsRef = useRef<HTMLDivElement>(null);

  // History hook
  const billHistory = useBillHistory();

  const handleAnalyze = async () => {
    if (!billText.trim()) return;

    setIsAnalyzing(true);
    setError(null);
    setAnalysis(null);
    setContactScript(null);
    setDoctorQuestions(null);
    setScamCheck(null);
    setCompletedSteps([]);
    setCurrentBillId(null);

    try {
      const response = await fetch("/api/analyze-bill", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: billText }),
      });

      if (!response.ok) {
        throw new Error("Failed to analyze bill");
      }

      const result = await response.json();
      setAnalysis(result);

      // Add to history if enabled
      if (billHistory.isEnabled) {
        const newItem = billHistory.addBill(billText, result);
        if (newItem) {
          setCurrentBillId(newItem.id);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleGenerateScript = async () => {
    if (!billText || !analysis) return;

    setLoadingAction("contact");
    try {
      const response = await fetch("/api/contact-script", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: billText, analysis }),
      });

      if (!response.ok) throw new Error("Failed to generate script");

      const result = await response.json();
      setContactScript(result.script);

      // Save to history if enabled
      if (billHistory.isEnabled && currentBillId) {
        billHistory.updateBillActions(currentBillId, {
          contactScript: result.script,
        });
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to generate contact script",
      );
    } finally {
      setLoadingAction(null);
    }
  };

  const handleGetDoctorQuestions = async () => {
    if (!billText || !analysis) return;

    setLoadingAction("doctor");
    try {
      const response = await fetch("/api/doctor-questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: billText, analysis }),
      });

      if (!response.ok) throw new Error("Failed to generate questions");

      const result = await response.json();
      setDoctorQuestions(result.questions);

      // Save to history if enabled
      if (billHistory.isEnabled && currentBillId) {
        billHistory.updateBillActions(currentBillId, {
          doctorQuestions: result.questions,
        });
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to generate doctor questions",
      );
    } finally {
      setLoadingAction(null);
    }
  };

  const handleScamCheck = async () => {
    if (!billText || !analysis) return;

    setLoadingAction("scam");
    try {
      const response = await fetch("/api/scam-check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: billText, analysis }),
      });

      if (!response.ok) throw new Error("Failed to check for scams");

      const result = await response.json();
      setScamCheck(result.assessment);

      // Save to history if enabled
      if (billHistory.isEnabled && currentBillId) {
        billHistory.updateBillActions(currentBillId, {
          scamCheck: result.assessment,
        });
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to perform scam check",
      );
    } finally {
      setLoadingAction(null);
    }
  };

  const handleStepToggle = (stepId: string) => {
    setCompletedSteps((prev) =>
      prev.includes(stepId)
        ? prev.filter((id) => id !== stepId)
        : [...prev, stepId],
    );
  };

  const handleClear = () => {
    setBillText("");
    setAnalysis(null);
    setContactScript(null);
    setDoctorQuestions(null);
    setScamCheck(null);
    setCompletedSteps([]);
    setCurrentBillId(null);
    setError(null);
  };

  const handleLoadFromHistory = (item: BillHistoryItem) => {
    setBillText(item.billText);
    setAnalysis(item.analysis);
    setContactScript(item.contactScript ?? null);
    setDoctorQuestions(item.doctorQuestions ?? null);
    setScamCheck(item.scamCheck ?? null);
    setCompletedSteps([]);
    setCurrentBillId(item.id);

    // Scroll to top
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="space-y-4">
      <h1 className="mb-2 text-3xl font-bold text-gray-900">Bill Helper</h1>
      <BillSubNav hasAnalysis={analysis !== null} />
      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
          {error}
        </div>
      )}

      <div className="space-y-6">
        {/* Input Section */}
        <section id="bill-input" className="scroll-mt-24">
          <BillInputForm
            billText={billText}
            onBillTextChange={setBillText}
            onAnalyze={handleAnalyze}
            onClear={handleClear}
            isAnalyzing={isAnalyzing}
            isSaveEnabled={billHistory.isEnabled}
            onToggleSave={billHistory.toggleEnabled}
          />
        </section>

        {/* Analysis Results */}
        {analysis && (
          <>
            <section id="bill-analysis" className="scroll-mt-24">
              <BillAnalysisCard analysis={analysis} />
            </section>

            <section
              id="bill-actions"
              ref={actionsRef}
              className="scroll-mt-24"
            >
              <BillActionsTabs
                contactScript={contactScript}
                doctorQuestions={doctorQuestions}
                scamCheck={scamCheck}
                loadingAction={loadingAction}
                onGenerateScript={handleGenerateScript}
                onGetDoctorQuestions={handleGetDoctorQuestions}
                onScamCheck={handleScamCheck}
              />
            </section>

            <section id="bill-steps" className="scroll-mt-24">
              <NextStepsChecklist
                steps={analysis.nextSteps}
                completedSteps={completedSteps}
                onStepToggle={handleStepToggle}
              />
            </section>
          </>
        )}

        {/* History Section */}
        <section id="bill-history" className="scroll-mt-24">
          <BillHistory
            history={billHistory.history}
            onLoadBill={handleLoadFromHistory}
            onDeleteBill={billHistory.deleteBill}
            onClearHistory={billHistory.clearHistory}
          />
        </section>
      </div>
    </div>
  );
}
