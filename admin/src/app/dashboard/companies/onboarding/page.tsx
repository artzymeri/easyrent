"use client";

import { toast } from "sonner";
import { Sparkles } from "lucide-react";

import { StepSidebar } from "./step-sidebar";
import { StepCompany } from "./step-company";
import { StepStaff } from "./step-staff";
import { StepCars } from "./step-cars";
import { StepReview } from "./step-review";
import { useOnboarding } from "./use-onboarding";

export default function OnboardingPage() {
  const {
    step, setStep, loading, company, setCompany, subdomainStatus,
    staffList, currentStaff, setCurrentStaff, carsList, currentCar, setCurrentCar,
    makes, models, loadMakes, loadModels,
    handleCreateCompany, handleAddStaff, handleAddCar, handleComplete,
  } = useOnboarding();

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-6 sm:mb-8">
        <div className="flex items-center gap-3 mb-1">
          <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Sparkles className="h-4 w-4 sm:h-5 sm:w-5" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight">New Company</h1>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Set up a rental company in just a few steps
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-6 lg:flex-row lg:gap-8">
        <div className="lg:w-auto">
          <StepSidebar currentStep={step} />
        </div>

        <div className="min-w-0 flex-1 pb-24 lg:pb-0">
          {step === 0 && (
            <StepCompany
              company={company}
              setCompany={setCompany}
              subdomainStatus={subdomainStatus}
              loading={loading}
              onSubmit={handleCreateCompany}
            />
          )}

          {step === 1 && (
            <StepStaff
              staffList={staffList}
              currentStaff={currentStaff}
              setCurrentStaff={setCurrentStaff}
              loading={loading}
              onAddStaff={handleAddStaff}
              onBack={() => setStep(0)}
              onNext={() => {
                if (staffList.length === 0) {
                  toast.error("At least one staff member is required");
                  return;
                }
                loadMakes();
                setStep(2);
              }}
            />
          )}

          {step === 2 && (
            <StepCars
              carsList={carsList}
              currentCar={currentCar}
              setCurrentCar={setCurrentCar}
              makes={makes}
              models={models}
              loading={loading}
              onLoadModels={loadModels}
              onAddCar={handleAddCar}
              onBack={() => setStep(1)}
              onNext={() => setStep(3)}
            />
          )}

          {step === 3 && (
            <StepReview
              company={company}
              staffList={staffList}
              carsList={carsList}
              loading={loading}
              onBack={() => setStep(2)}
              onComplete={handleComplete}
            />
          )}
        </div>
      </div>
    </div>
  );
}
