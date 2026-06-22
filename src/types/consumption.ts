import type { MonthName } from "@/lib/months";

export type MonthlyConsumption = {
  kwh: number;
  month: MonthName;
};

export type ConsumptionData = {
  peakDemand?: number;
  maxDemand?: number;
  connectedPower: number;
  buyPrice?: number;
  sellPrice?: number;
  records: MonthlyConsumption[];
  tariff: string;
  billingName: string;
};
