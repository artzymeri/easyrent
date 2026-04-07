"use client";

import { Building2, Users, Car, ClipboardCheck, Check } from "lucide-react";
import { STEPS } from "./types";

const STEP_ICONS = [Building2, Users, Car, ClipboardCheck];

interface StepSidebarProps {
  currentStep: number;
}

export function StepSidebar({ currentStep }: StepSidebarProps) {
  return (
    <>
      {/* Desktop sidebar */}
      <div className="hidden w-56 shrink-0 md:block">
        <nav className="sticky top-8 space-y-1">
          {STEPS.map((s, i) => {
            const Icon = STEP_ICONS[i];
            const isCompleted = i < currentStep;
            const isCurrent = i === currentStep;

            return (
              <div
                key={s.label}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors ${
                  isCurrent
                    ? "bg-primary/10 text-primary"
                    : isCompleted
                      ? "text-foreground"
                      : "text-muted-foreground"
                }`}
              >
                <div
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-semibold transition-colors ${
                    isCompleted
                      ? "bg-primary text-primary-foreground"
                      : isCurrent
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                  }`}
                >
                  {isCompleted ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                </div>
                <div className="min-w-0">
                  <div className={`text-sm font-medium leading-tight ${isCurrent ? "text-primary" : ""}`}>
                    {s.label}
                  </div>
                  <div className="text-xs text-muted-foreground">{s.description}</div>
                </div>
              </div>
            );
          })}

          {/* Progress bar */}
          <div className="!mt-6 px-3">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs text-muted-foreground">Progress</span>
              <span className="text-xs font-medium">
                {Math.round((currentStep / (STEPS.length - 1)) * 100)}%
              </span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary transition-all duration-500"
                style={{ width: `${(currentStep / (STEPS.length - 1)) * 100}%` }}
              />
            </div>
          </div>
        </nav>
      </div>

      {/* Mobile bottom bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background p-3 md:hidden">
        <div className="flex items-center justify-between gap-2 mx-auto max-w-lg">
          {STEPS.map((s, i) => {
            const isCompleted = i < currentStep;
            const isCurrent = i === currentStep;
            return (
              <div key={s.label} className="flex flex-1 flex-col items-center gap-1">
                <div
                  className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold ${
                    isCompleted
                      ? "bg-primary text-primary-foreground"
                      : isCurrent
                        ? "bg-primary text-primary-foreground ring-2 ring-primary/30 ring-offset-2"
                        : "bg-muted text-muted-foreground"
                  }`}
                >
                  {isCompleted ? <Check className="h-3.5 w-3.5" /> : i + 1}
                </div>
                <span className={`text-[10px] ${isCurrent ? "font-medium" : "text-muted-foreground"}`}>
                  {s.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
