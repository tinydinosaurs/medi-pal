"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface NextStepsChecklistProps {
  steps: string[];
  completedSteps: string[];
  onStepToggle: (stepId: string) => void;
}

export function NextStepsChecklist({
  steps,
  completedSteps,
  onStepToggle,
}: NextStepsChecklistProps) {
  const completedCount = completedSteps.length;

  return (
    <Card className="border-emerald-200">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">✅</span>
            Next Steps
          </div>
          <span className="text-sm font-normal text-slate-500">
            {completedCount} of {steps.length} done
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {steps.map((step, index) => {
            const stepId = `step-${index}`;
            const isChecked = completedSteps.includes(stepId);
            return (
              <label
                key={stepId}
                className="flex cursor-pointer items-center gap-3 rounded-lg border border-slate-100 p-3 hover:bg-slate-50"
              >
                <Checkbox
                  checked={isChecked}
                  onCheckedChange={() => onStepToggle(stepId)}
                />
                <span
                  className={`text-sm ${isChecked ? "text-slate-400 line-through" : "text-slate-700"}`}
                >
                  {step}
                </span>
              </label>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
