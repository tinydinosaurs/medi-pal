"use client";

import type { BillAnalysis } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface BillAnalysisCardProps {
  analysis: BillAnalysis;
}

export function BillAnalysisCard({ analysis }: BillAnalysisCardProps) {
  return (
    <Card className="border-emerald-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span className="text-xl">📋</span>
          Bill Summary
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-3">
            <h3 className="font-semibold text-slate-900">Main Details</h3>
            <div className="space-y-2 text-sm">
              <p>
                <span className="font-medium text-slate-600">Company:</span>{" "}
                <span className="text-slate-900">
                  {analysis.vendorName ?? "Not clearly found"}
                </span>
              </p>
              <p>
                <span className="font-medium text-slate-600">
                  Total Amount:
                </span>{" "}
                <span className="text-lg font-semibold text-slate-900">
                  {analysis.totalAmount ?? "Not clearly found"}
                </span>
              </p>
              <p>
                <span className="font-medium text-slate-600">
                  Amount Due Now:
                </span>{" "}
                <span className="text-slate-900">
                  {analysis.minimumDue ??
                    analysis.totalAmount ??
                    "Not clearly found"}
                </span>
              </p>
              {analysis.insuranceCoverage && (
                <p>
                  <span className="font-medium text-slate-600">Insurance:</span>{" "}
                  <span className="text-slate-900">
                    {analysis.insuranceCoverage}
                  </span>
                </p>
              )}
              <p>
                <span className="font-medium text-slate-600">Due Date:</span>{" "}
                <span className="font-semibold text-amber-700">
                  {analysis.dueDate ?? "Not clearly found"}
                </span>
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold text-slate-900">Dates & Period</h3>
            <div className="space-y-2 text-sm">
              <p>
                <span className="font-medium text-slate-600">
                  Statement Date:
                </span>{" "}
                <span className="text-slate-900">
                  {analysis.statementDate ?? "Not clearly found"}
                </span>
              </p>
              <p>
                <span className="font-medium text-slate-600">
                  Billing Period:
                </span>{" "}
                <span className="text-slate-900">
                  {analysis.billingPeriod ?? "Not clearly found"}
                </span>
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="font-semibold text-slate-900">In Simple Words</h3>
          <p className="text-sm leading-relaxed text-slate-700">
            {analysis.summary}
          </p>
        </div>

        <div className="space-y-2">
          <h3 className="font-semibold text-slate-900">
            Things to Double-Check
          </h3>
          {analysis.potentialIssues.length === 0 ? (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3">
              <p className="text-sm text-emerald-800">
                ✓ No problems found. This bill looks straightforward.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {analysis.potentialIssues.map((issue, index) => {
                // Parse severity prefix
                const prefixMatch = issue.match(/^\[(HIGH|MEDIUM|LOW)\]\s*/i);
                const severity = prefixMatch
                  ? (prefixMatch[1].toLowerCase() as "high" | "medium" | "low")
                  : "medium";
                const text = prefixMatch
                  ? issue.slice(prefixMatch[0].length)
                  : issue;

                const styles = {
                  high: "border-red-300 bg-red-50 text-red-800",
                  medium: "border-amber-300 bg-amber-50 text-amber-800",
                  low: "border-slate-200 bg-slate-50 text-slate-700",
                };
                const icons = {
                  high: "🚨",
                  medium: "⚠️",
                  low: "ℹ️",
                };

                return (
                  <div
                    key={index}
                    className={`flex items-start gap-2 rounded-lg border p-3 text-sm ${styles[severity]}`}
                  >
                    <span className="shrink-0">{icons[severity]}</span>
                    <span>{text}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
