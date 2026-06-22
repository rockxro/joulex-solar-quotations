import { create } from "zustand";

import { quotationSteps, type AdminSectionId, type AppView } from "@/lib/workflow";
import type { Cliente } from "@/types/cliente";
import type { ConsumoData } from "@/types/consumo";
import type { DimensionamientoData, TipoSistema } from "@/types/dimensionamiento";
import type { LineaProducto } from "@/types/producto";

type CotizacionState = {
  activeView: AppView;
  cliente: Cliente | null;
  consumo: ConsumoData | null;
  currentStep: number;
  dimensionamiento: DimensionamientoData | null;
  maxUnlockedStep: number;
  productos: LineaProducto[];
  tipoSistema: TipoSistema;
  goToAdmin: (view: AdminSectionId) => void;
  goToStep: (step: number) => void;
  nextStep: () => void;
  previousStep: () => void;
  setCliente: (cliente: Cliente | null) => void;
  setTipoSistema: (tipoSistema: TipoSistema) => void;
};

const lastStep = quotationSteps.length;

export const useCotizacionStore = create<CotizacionState>((set) => ({
  activeView: "workflow",
  cliente: null,
  consumo: null,
  currentStep: 1,
  dimensionamiento: null,
  maxUnlockedStep: 1,
  productos: [],
  tipoSistema: "ongrid",
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
  setCliente: (cliente) => set({ cliente }),
  setTipoSistema: (tipoSistema) => set({ tipoSistema }),
}));
