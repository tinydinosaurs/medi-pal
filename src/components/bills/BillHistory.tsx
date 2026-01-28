"use client";

import type { BillHistoryItem, BillStatus } from "@/types";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface BillHistoryProps {
  history: BillHistoryItem[];
  onLoadBill: (item: BillHistoryItem) => void;
  onDeleteBill: (id: string) => void;
  onClearHistory: () => void;
}

const STATUS_STYLES: Record<
  BillStatus,
  { bg: string; text: string; label: string }
> = {
  waiting: { bg: "bg-slate-100", text: "text-slate-700", label: "Waiting" },
  "need-to-call": {
    bg: "bg-amber-100",
    text: "text-amber-800",
    label: "Need to Call",
  },
  paid: { bg: "bg-emerald-100", text: "text-emerald-800", label: "Paid" },
};

export function BillHistory({
  history,
  onLoadBill,
  onDeleteBill,
  onClearHistory,
}: BillHistoryProps) {
  return (
    <Card className="border-slate-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span className="text-xl">📂</span>
          Saved Bills
        </CardTitle>
        <CardDescription>
          Bills you&apos;ve saved on this device. Use the checkbox above when
          analyzing to save new bills.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {history.length === 0 ? (
          <p className="text-sm text-slate-500">
            No saved bills yet. Check &quot;Save this bill&quot; when analyzing
            to save bills here.
          </p>
        ) : (
          <div className="space-y-3">
            {history.map((item) => {
              const style = STATUS_STYLES[item.status];
              return (
                <div
                  key={item.id}
                  className="rounded-xl border border-slate-200 bg-white p-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-slate-900">
                        {item.vendorName ?? "Bill"}
                        {item.totalAmount && (
                          <span className="ml-2 text-emerald-700">
                            {item.totalAmount}
                          </span>
                        )}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        Saved {new Date(item.date).toLocaleDateString()}
                      </p>
                      <p className="mt-2 line-clamp-2 text-sm text-slate-600">
                        {item.summary}
                      </p>
                    </div>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${style.bg} ${style.text}`}
                    >
                      {style.label}
                    </span>
                  </div>
                  <div className="mt-3 flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onLoadBill(item)}
                      className="rounded-full text-xs"
                    >
                      Load
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDeleteBill(item.id)}
                      className="rounded-full text-xs text-red-600 hover:bg-red-50 hover:text-red-700"
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              );
            })}
            {history.length > 0 && (
              <div className="pt-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClearHistory}
                  className="text-xs text-slate-500 hover:text-red-600"
                >
                  Clear all history
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
