export type SystemType = "ongrid" | "hybrid" | "offgrid";

export type SizingData = {
  systemType: SystemType;
  panelCount: number;
  monthlyGenerationPerPanel: number[];

  // Selected Panel Parameters
  panelBrand: string;
  panelModel: string;
  panelPowerW: number;
  panelVmpp: number;
  panelImpp: number;
  panelVoc: number;
  panelIsc: number;
  panelBetaVoc: number;
  panelWidth: number;
  panelHeight: number;
  panelThickness: number;

  // Operational Parameters
  workdays: number;
  restDays: number;
  workdaysDaytimePct: number;
  restDaysDaytimePct: number;

  // Hybrid Parameters (Batteries) - Optional
  batteryModulesCount?: number;
  batteryModuleCapacityKwh?: number;
  batteryDod?: number;
  desiredAutonomyHours?: number;
};
