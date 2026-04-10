"use client";

import { ChevronDown, Check } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import type { CarData } from "../../types";

interface MakeModelSelectorProps {
  currentCar: CarData;
  update: (field: keyof CarData, value: string) => void;
  makes: string[];
  models: string[];
  makeOpen: boolean;
  setMakeOpen: (open: boolean) => void;
  modelOpen: boolean;
  setModelOpen: (open: boolean) => void;
  onLoadModels: (make: string) => void;
}

export function MakeModelSelector({
  currentCar,
  update,
  makes,
  models,
  makeOpen,
  setMakeOpen,
  modelOpen,
  setModelOpen,
  onLoadModels,
}: MakeModelSelectorProps) {
  return (
    <div className="grid gap-5 sm:grid-cols-2">
      <div className="space-y-2">
        <Label>
          Make <span className="text-destructive">*</span>
        </Label>
        <Popover open={makeOpen} onOpenChange={setMakeOpen}>
          <PopoverTrigger
            render={
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={makeOpen}
                className="w-full justify-between font-normal"
              />
            }
          >
            <span className={currentCar.make ? "" : "text-muted-foreground"}>
              {currentCar.make || "Select make"}
            </span>
            <ChevronDown className="ml-2 h-3.5 w-3.5 shrink-0 opacity-50" />
          </PopoverTrigger>
          <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
            <Command>
              <CommandInput placeholder="Search make..." />
              <CommandList>
                <CommandEmpty>No make found.</CommandEmpty>
                <CommandGroup>
                  {makes.map((m) => (
                    <CommandItem
                      key={m}
                      value={m}
                      onSelect={() => {
                        update("make", m);
                        update("model", "");
                        onLoadModels(m);
                        setMakeOpen(false);
                      }}
                    >
                      <span className="flex-1">{m}</span>
                      {currentCar.make === m && (
                        <Check className="ml-2 h-3.5 w-3.5 text-primary" />
                      )}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>

      <div className="space-y-2">
        <Label>
          Model <span className="text-destructive">*</span>
        </Label>
        <Popover open={modelOpen} onOpenChange={setModelOpen}>
          <PopoverTrigger
            disabled={!currentCar.make}
            render={
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={modelOpen}
                className="w-full justify-between font-normal"
              />
            }
          >
            <span className={currentCar.model ? "" : "text-muted-foreground"}>
              {currentCar.model || (currentCar.make ? "Select model" : "Select make first")}
            </span>
            <ChevronDown className="ml-2 h-3.5 w-3.5 shrink-0 opacity-50" />
          </PopoverTrigger>
          <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
            <Command>
              <CommandInput placeholder="Search model..." />
              <CommandList>
                <CommandEmpty>No model found.</CommandEmpty>
                <CommandGroup>
                  {models.map((m) => (
                    <CommandItem
                      key={m}
                      value={m}
                      onSelect={() => {
                        update("model", m);
                        setModelOpen(false);
                      }}
                    >
                      <span className="flex-1">{m}</span>
                      {currentCar.model === m && (
                        <Check className="ml-2 h-3.5 w-3.5 text-primary" />
                      )}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}
