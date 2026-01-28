"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface BillInputFormProps {
  billText: string;
  onBillTextChange: (text: string) => void;
  onAnalyze: () => void;
  onClear: () => void;
  isAnalyzing: boolean;
  isSaveEnabled: boolean;
  onToggleSave: (enabled: boolean) => void;
}

export function BillInputForm({
  billText,
  onBillTextChange,
  onAnalyze,
  onClear,
  isAnalyzing,
  isSaveEnabled,
  onToggleSave,
}: BillInputFormProps) {
  const [showPaperHelp, setShowPaperHelp] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (billText.trim()) {
      onAnalyze();
    }
  };

  return (
    <Card className="border-emerald-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span className="text-xl">📄</span>
          Analyze a Bill
        </CardTitle>
        <CardDescription>
          Paste the text from your bill below. We&apos;ll identify the key
          details and point out anything that may need a closer look.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <button
          type="button"
          onClick={() => setShowPaperHelp(!showPaperHelp)}
          className="text-sm font-medium text-[#4a80f0] hover:underline"
        >
          {showPaperHelp
            ? "Hide help ↑"
            : "📱 My bill is on paper - help me get the text"}
        </button>

        {showPaperHelp && (
          <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-700">
            <p className="font-semibold">If your bill is on paper:</p>
            <ol className="mt-2 list-decimal space-y-1 pl-5">
              <li>
                Open the <span className="font-semibold">Notes</span> app on
                your iPhone.
              </li>
              <li>Start a new note and tap inside the note.</li>
              <li>
                Choose <span className="font-semibold">Scan Text</span> (or the
                camera icon → Scan).
              </li>
              <li>Point the camera at your bill and insert the text.</li>
              <li>
                Press and hold on the text to{" "}
                <span className="font-semibold">Copy</span>, then paste it
                below.
              </li>
            </ol>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <textarea
            className="h-48 w-full rounded-xl border border-slate-300 bg-white p-4 text-base text-slate-900 shadow-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
            placeholder="Paste your bill text here..."
            value={billText}
            onChange={(e) => onBillTextChange(e.target.value)}
            disabled={isAnalyzing}
          />

          <div className="flex flex-col gap-4">
            <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
              <div className="flex gap-3">
                <Button
                  type="submit"
                  disabled={isAnalyzing || !billText.trim()}
                  className="rounded-full bg-emerald-600 px-6 py-3 text-base font-semibold hover:bg-emerald-700"
                >
                  {isAnalyzing ? "Analyzing..." : "Analyze Bill"}
                </Button>
                {billText && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onClear}
                    disabled={isAnalyzing}
                    className="rounded-full px-6 py-3 text-base"
                  >
                    Clear
                  </Button>
                )}
              </div>
              <label className="flex cursor-pointer items-center gap-2">
                <Checkbox
                  checked={isSaveEnabled}
                  onCheckedChange={(checked) => onToggleSave(checked === true)}
                />
                <span className="text-sm text-slate-600">Save this bill</span>
              </label>
            </div>
            <p className="text-sm text-slate-500">
              {isSaveEnabled ? (
                <>
                  This bill will be saved on your device after analysis.{" "}
                  <button
                    type="button"
                    onClick={() =>
                      document
                        .getElementById("bill-history")
                        ?.scrollIntoView({ behavior: "smooth" })
                    }
                    className="font-medium text-emerald-600 hover:underline"
                  >
                    View saved bills
                  </button>
                </>
              ) : (
                "This bill won't be saved. Only used for this analysis."
              )}
            </p>
          </div>
        </form>
        {isAnalyzing && (
          <div className="flex items-center justify-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-6">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent" />
            <span className="text-sm font-medium text-emerald-700">
              Analyzing your bill...
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
