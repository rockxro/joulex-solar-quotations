import type { Resolver } from "react-hook-form";
import { z } from "zod";

import type { MonthName } from "@/lib/months";

export type MonthlyConsumptionForm = {
  kwh: number;
  month: MonthName;
};

export type ConsumptionFormValues = {
  billingName: string;
  tariff: string;
  connectedPower: number;
  buyPrice: number;
  sellPrice: number;
  maxDemand?: number;
  peakDemand?: number;
  records: MonthlyConsumptionForm[];
};

const demandTariffs = ["BT3", "BT4.1", "BT4.2", "BT4.3"];

export const consumptionSchema = z.object({
  billingName: z.string().min(1, "El titular de la boleta es requerido"),
  tariff: z.string().min(1, "El tipo de tarifa es requerido"),
  connectedPower: z.coerce
    .number()
    .positive("La potencia debe ser mayor a 0"),
  buyPrice: z.coerce
    .number()
    .min(0, "El precio no puede ser negativo"),
  sellPrice: z.coerce
    .number()
    .min(0, "El precio no puede ser negativo"),
  maxDemand: z.coerce.number().optional(),
  peakDemand: z.coerce.number().optional(),
  records: z.array(
    z.object({
      kwh: z.coerce
        .number()
        .min(0, "El consumo no puede ser negativo"),
      month: z.string(),
    })
  ).length(12, "Debe ingresar los 12 meses"),
}).superRefine((data, ctx) => {
  if (demandTariffs.includes(data.tariff)) {
    if (data.maxDemand === undefined || isNaN(data.maxDemand) || data.maxDemand <= 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "La demanda máxima es requerida para esta tarifa",
        path: ["maxDemand"],
      });
    }
    if (data.peakDemand === undefined || isNaN(data.peakDemand) || data.peakDemand <= 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "La demanda en horas punta es requerida para esta tarifa",
        path: ["peakDemand"],
      });
    }
  }
});

export const customResolver: Resolver<ConsumptionFormValues> = async (values) => {
  const result = consumptionSchema.safeParse(values);
  if (result.success) {
    return { values: result.data as ConsumptionFormValues, errors: {} };
  }

  const errors = result.error.issues.reduce((acc: any, current: any) => {
    const path = current.path.join(".");
    acc[path] = {
      type: current.code,
      message: current.message,
    };
    return acc;
  }, {});

  return { values: {}, errors };
};
