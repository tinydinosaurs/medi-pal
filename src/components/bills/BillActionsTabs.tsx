"use client";

import { useState } from "react";
import type { TabId } from "@/types";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface BillActionsTabsProps {
  contactScript: string | null;
  doctorQuestions: string | null;
  scamCheck: string | null;
  loadingAction: string | null;
  onGenerateScript: () => void;
  onGetDoctorQuestions: () => void;
  onScamCheck: () => void;
}

const TABS: { id: TabId; label: string; icon: string; loadingKey: string }[] = [
  { id: "script", label: "Contact Script", icon: "📞", loadingKey: "contact" },
  {
    id: "questions",
    label: "Doctor Questions",
    icon: "👨‍⚕️",
    loadingKey: "doctor",
  },
  { id: "scam", label: "Scam Check", icon: "⚠️", loadingKey: "scam" },
];
export function BillActionsTabs({
  contactScript,
  doctorQuestions,
  scamCheck,
  loadingAction,
  onGenerateScript,
  onGetDoctorQuestions,
  onScamCheck,
}: BillActionsTabsProps) {
  const [activeTab, setActiveTab] = useState<TabId>("script");

  const getContent = (tabId: TabId): string | null => {
    switch (tabId) {
      case "script":
        return contactScript;
      case "questions":
        return doctorQuestions;
      case "scam":
        return scamCheck;
    }
  };

  const getGenerateHandler = (tabId: TabId): (() => void) => {
    switch (tabId) {
      case "script":
        return onGenerateScript;
      case "questions":
        return onGetDoctorQuestions;
      case "scam":
        return onScamCheck;
    }
  };

  const getLoadingKey = (tabId: TabId): string => {
    switch (tabId) {
      case "script":
        return "contact";
      case "questions":
        return "doctor";
      case "scam":
        return "scam";
    }
  };

  const handleCopyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement("textarea");
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
    }
  };

  const handlePrint = (text: string, title: string) => {
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>${title}</title>
            <style>
              body { font-family: system-ui, sans-serif; padding: 2rem; line-height: 1.6; }
              h1 { font-size: 1.5rem; margin-bottom: 1rem; }
              pre { white-space: pre-wrap; font-family: inherit; }
            </style>
          </head>
          <body>
            <h1>${title}</h1>
            <pre>${text}</pre>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const content = getContent(activeTab);
  const isLoading = loadingAction === getLoadingKey(activeTab);
  const isAnyLoading = loadingAction !== null;

  return (
    <Card className="border-emerald-200">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <span className="text-xl">🛠️</span>
          Actions
        </CardTitle>
        <CardDescription>
          Generate helpful resources based on your bill analysis.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Tab Buttons */}
        <div className="flex gap-1 rounded-lg bg-slate-100 p-1">
          {TABS.map((tab) => {
            const hasContent = getContent(tab.id) !== null;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <span className="pointer-events-none">{tab.icon}</span>
                <span className="pointer-events-none hidden sm:inline">
                  {tab.label}
                </span>
                {hasContent && (
                  <span className="pointer-events-none ml-1 h-2 w-2 rounded-full bg-emerald-500" />
                )}
              </button>
            );
          })}
        </div>
        {/* Tab Content */}
        <div className="min-h-[200px] rounded-xl border border-slate-200 bg-white p-4">
          {isLoading ? (
            <div className="flex h-full items-center justify-center py-12">
              <div className="text-center">
                <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-4 border-emerald-200 border-t-emerald-600" />
                <p className="text-sm text-slate-500">Generating...</p>
              </div>
            </div>
          ) : content ? (
            <div className="space-y-4">
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleCopyToClipboard(content)}
                  className="rounded-full text-xs"
                >
                  📋 Copy
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    handlePrint(
                      content,
                      TABS.find((t) => t.id === activeTab)?.label ??
                        "Bill Action",
                    )
                  }
                  className="rounded-full text-xs"
                >
                  🖨️ Print
                </Button>
              </div>
              <div className="whitespace-pre-wrap text-sm text-slate-700">
                {content}
              </div>
            </div>
          ) : (
            <div className="flex h-full flex-col items-center justify-center py-8">
              <p className="mb-4 text-center text-sm text-slate-500">
                {activeTab === "script" &&
                  "Generate a script to help you call, email, or write about this bill."}
                {activeTab === "questions" &&
                  "Generate questions to ask your doctor about this bill."}
                {activeTab === "scam" &&
                  "Check this bill for potential scam warning signs."}
              </p>
              <Button
                onClick={getGenerateHandler(activeTab)}
                disabled={isAnyLoading}
                className="rounded-full bg-emerald-600 px-6 hover:bg-emerald-700"
              >
                Generate {TABS.find((t) => t.id === activeTab)?.label}
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
