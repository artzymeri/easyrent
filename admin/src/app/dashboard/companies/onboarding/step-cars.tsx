"use client";

import { useState } from "react";
import { Plus, Loader2, ArrowRight, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { CarData } from "./types";
import { AddedCarsList } from "./_components/step-cars/added-cars-list";
import { VehicleDetailsForm } from "./_components/step-cars/vehicle-details-form";
import { RegistrationServiceForm } from "./_components/step-cars/registration-service-form";

interface StepCarsProps {
  carsList: CarData[];
  currentCar: CarData;
  setCurrentCar: React.Dispatch<React.SetStateAction<CarData>>;
  makes: string[];
  models: string[];
  loading: boolean;
  onLoadModels: (make: string) => void;
  onAddCar: () => void;
  onBack: () => void;
  onNext: () => void;
}

export function StepCars({
  carsList,
  currentCar,
  setCurrentCar,
  makes,
  models,
  loading,
  onLoadModels,
  onAddCar,
  onBack,
  onNext,
}: StepCarsProps) {
  const [makeOpen, setMakeOpen] = useState(false);
  const [modelOpen, setModelOpen] = useState(false);

  const update = (field: keyof CarData, value: string) =>
    setCurrentCar((prev) => ({ ...prev, [field]: value }));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Fleet</h2>
        <p className="text-sm text-muted-foreground">
          Add cars to this company&apos;s fleet (you can skip this and add later)
        </p>
      </div>

      <AddedCarsList carsList={carsList} />

      <VehicleDetailsForm
        currentCar={currentCar}
        update={update}
        makes={makes}
        models={models}
        makeOpen={makeOpen}
        setMakeOpen={setMakeOpen}
        modelOpen={modelOpen}
        setModelOpen={setModelOpen}
        onLoadModels={onLoadModels}
      />

      <RegistrationServiceForm currentCar={currentCar} update={update} />

      {/* Add button */}
      <div className="flex justify-end">
        <Button onClick={onAddCar} disabled={loading} variant="secondary">
          {loading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Plus className="mr-2 h-4 w-4" />
          )}
          Add Car
        </Button>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Button onClick={onNext} size="lg">
          <ArrowRight className="mr-2 h-4 w-4" />
          Continue to Review
        </Button>
      </div>
    </div>
  );
}
