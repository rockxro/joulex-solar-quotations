import { create } from "zustand";

import { quotationSteps, type AdminSectionId, type AppView } from "@/lib/workflow";
import type { Client } from "@/types/client";
import type { ConsumptionData } from "@/types/consumption";
import type { SizingData, SystemType } from "@/types/sizing";
import type { ProductLine } from "@/types/product";

type QuotationState = {
  activeView: AppView;
  client: Client | null;
  consumption: ConsumptionData | null;
  currentStep: number;
  sizing: SizingData | null;
  maxUnlockedStep: number;
  products: ProductLine[];
  systemType: SystemType;
  goToAdmin: (view: AdminSectionId) => void;
  goToStep: (step: number) => void;
  nextStep: () => void;
  previousStep: () => void;
  setClient: (client: Client | null) => void;
  setConsumption: (consumption: ConsumptionData | null) => void;
  setSizing: (sizing: SizingData | null) => void;
  setSystemType: (systemType: SystemType) => void;
};

const lastStep = quotationSteps.length;

export const useCotizacionStore = create<QuotationState>((set) => ({
  activeView: "workflow",
  client: null,
  consumption: null,
  currentStep: 1,
  sizing: null,
  maxUnlockedStep: 1,
  products: [],
  systemType: "ongrid",
  goToAdmin: (view) => set({ activeView: view }),
  goToStep: (step) =>
    set((state) => {
      const nextStep = Math.min(Math.max(step, 1), state.maxUnlockedStep);
      return {
        activeView: "workflow",
        currentStep: nextStep,
      };
    }),
  nextStep: () =>
    set((state) => {
      const nextStep = Math.min(state.currentStep + 1, lastStep);
      return {
        activeView: "workflow",
        currentStep: nextStep,
        maxUnlockedStep: Math.max(state.maxUnlockedStep, nextStep),
      };
    }),
  previousStep: () =>
    set((state) => ({
      activeView: "workflow",
      currentStep: Math.max(state.currentStep - 1, 1),
    })),
  setClient: (client) => set({ client }),
  setConsumption: (consumption) => set({ consumption }),
  setSizing: (sizing) =>
    set((state) => ({
      sizing,
      systemType: sizing?.systemType ?? state.systemType,
    })),
  setSystemType: (systemType) => set({ systemType }),
}));
