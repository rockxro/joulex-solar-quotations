import type { Resolver } from "react-hook-form";
import { z } from "zod";

import type { SystemType } from "@/types/sizing";

export type SizingFormValues = {
  systemType: SystemType;
  panelCount: number;
  monthlyGenerationPerPanel: { kwh: number; month: string }[];

  // Panel
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

  // Operation
  workdays: number;
  restDays: number;
  workdaysDaytimePct: number;  // Expressed in % (0-100) in the form
  restDaysDaytimePct: number; // Expressed in % (0-100) in the form

  // Battery (Optional in type, but conditionally validated)
  batteryModulesCount?: number;
  batteryModuleCapacityKwh?: number;
  batteryDod?: number;         // Expressed in % (0-100) in the form
  desiredAutonomyHours?: number;
};

export const sizingSchema = z.object({
  systemType: z.enum(["ongrid", "hybrid", "offgrid"]),
  panelCount: z.coerce
    .number()
    .positive("La cantidad de paneles debe ser mayor a 0"),
  monthlyGenerationPerPanel: z.array(
    z.object({
      kwh: z.coerce
        .number()
        .min(0, "La generación no puede ser negativa"),
      month: z.string(),
    })
  ).length(12),

  panelBrand: z.string().min(1, "La marca del panel es requerida"),
  panelModel: z.string().min(1, "El modelo del panel es requerido"),
  panelPowerW: z.coerce
    .number()
    .positive("La potencia debe ser mayor a 0"),
  panelVmpp: z.coerce
    .number()
    .positive("El Vmpp debe ser mayor a 0"),
  panelImpp: z.coerce
    .number()
    .positive("El Impp debe ser mayor a 0"),
  panelVoc: z.coerce
    .number()
    .positive("El Voc debe ser mayor a 0"),
  panelIsc: z.coerce
    .number()
    .positive("El Isc debe ser mayor a 0"),
  panelBetaVoc: z.coerce
    .number(),
  panelWidth: z.coerce
    .number()
    .positive("El ancho debe ser mayor a 0"),
  panelHeight: z.coerce
    .number()
    .positive("El alto debe ser mayor a 0"),
  panelThickness: z.coerce
    .number()
    .positive("El espesor debe ser mayor a 0"),

  workdays: z.coerce
    .number()
    .min(0, "Mínimo 0 días")
    .max(7, "Máximo 7 días"),
  restDays: z.coerce
    .number()
    .min(0, "Mínimo 0 días")
    .max(7, "Máximo 7 días"),
  workdaysDaytimePct: z.coerce
    .number()
    .min(0, "Mínimo 0%")
    .max(100, "Máximo 100%"),
  restDaysDaytimePct: z.coerce
    .number()
    .min(0, "Mínimo 0%")
    .max(100, "Máximo 100%"),

  batteryModulesCount: z.coerce.number().optional(),
  batteryModuleCapacityKwh: z.coerce.number().optional(),
  batteryDod: z.coerce.number().optional(),
  desiredAutonomyHours: z.coerce.number().optional(),
}).superRefine((data, ctx) => {
  // Validate that the days of the week sum up to 7
  if (data.workdays + data.restDays !== 7) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "La suma de días laborales y descanso debe ser exactamente 7",
      path: ["workdays"],
    });
  }

  // Battery validations if system requires storage
  if (data.systemType === "hybrid" || data.systemType === "offgrid") {
    if (data.batteryModulesCount === undefined || isNaN(data.batteryModulesCount) || data.batteryModulesCount <= 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "El número de módulos es requerido",
        path: ["batteryModulesCount"],
      });
    }
    if (
      data.batteryModuleCapacityKwh === undefined ||
      isNaN(data.batteryModuleCapacityKwh) ||
      data.batteryModuleCapacityKwh <= 0
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "La capacidad de cada módulo es requerida",
        path: ["batteryModuleCapacityKwh"],
      });
    }
    if (data.batteryDod === undefined || isNaN(data.batteryDod) || data.batteryDod < 0 || data.batteryDod > 100) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "El DOD debe estar entre 0% y 100%",
        path: ["batteryDod"],
      });
    }
    if (
      data.desiredAutonomyHours === undefined ||
      isNaN(data.desiredAutonomyHours) ||
      data.desiredAutonomyHours <= 0
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Las horas de autonomía son requeridas",
        path: ["desiredAutonomyHours"],
      });
    }
  }
});

export const customResolver: Resolver<SizingFormValues> = async (values) => {
  const result = sizingSchema.safeParse(values);
  if (result.success) {
    return { values: result.data as SizingFormValues, errors: {} };
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
