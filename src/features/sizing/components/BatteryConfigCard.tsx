import { Battery } from "lucide-react";
import type { UseFormRegister, FieldErrors } from "react-hook-form";
import type { SizingFormValues } from "../sizingSchema";

interface BatteryConfigCardProps {
  register: UseFormRegister<SizingFormValues>;
  errors: FieldErrors<SizingFormValues>;
}

export function BatteryConfigCard({ register, errors }: BatteryConfigCardProps) {
  return (
    <div className="rounded-3xl border border-border/70 bg-card p-6 shadow-xl backdrop-blur-md animate-in slide-in-from-top-4 duration-300">
      <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
        <Battery className="size-5 text-green-600" />
        Dimensionamiento de Banco de Baterías
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground block">Módulos de Batería</label>
          <input
            type="number"
            min={1}
            className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm focus:ring-2 focus:ring-primary/20 outline-none"
            {...register("batteryModulesCount")}
          />
          {errors.batteryModulesCount && (
            <p className="text-xs text-destructive font-medium">{errors.batteryModulesCount.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground block">Capacidad del Módulo (kWh)</label>
          <input
            type="number"
            step="0.1"
            className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm focus:ring-2 focus:ring-primary/20 outline-none"
            {...register("batteryModuleCapacityKwh")}
          />
          {errors.batteryModuleCapacityKwh && (
            <p className="text-xs text-destructive font-medium">{errors.batteryModuleCapacityKwh.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground block">DOD útil (%)</label>
          <div className="relative">
            <input
              type="number"
              min={0}
              max={100}
              className="w-full px-3 py-2 pr-8 rounded-xl border border-border bg-background text-sm focus:ring-2 focus:ring-primary/20 outline-none"
              {...register("batteryDod")}
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-muted-foreground">%</span>
          </div>
          {errors.batteryDod && (
            <p className="text-xs text-destructive font-medium">{errors.batteryDod.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground block">Autonomía Deseada (Horas)</label>
          <input
            type="number"
            min={1}
            className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm focus:ring-2 focus:ring-primary/20 outline-none"
            {...register("desiredAutonomyHours")}
          />
          {errors.desiredAutonomyHours && (
            <p className="text-xs text-destructive font-medium">{errors.desiredAutonomyHours.message}</p>
          )}
        </div>
      </div>
    </div>
  );
}
