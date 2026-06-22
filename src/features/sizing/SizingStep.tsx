import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import {
  AlertCircle,
  CheckCircle2,
  Cpu,
  FileSpreadsheet,
  Sun,
  Trash2,
  Zap,
} from "lucide-react";

import { months } from "@/lib/months";
import { useCotizacionStore } from "@/store/quotationStore";
import type { SizingData } from "@/types/sizing";
import { type SizingFormValues, customResolver } from "./sizingSchema";
import { parseExcelPaste } from "../consumption/consumptionUtils";
import { calcularOnGrid } from "./calculations";
import { calcularHibrido } from "./calculationsHybrid";
import { calcularOffGrid } from "./calculationsOffGrid";

import { PanelConfigCard } from "./components/PanelConfigCard";
import { BatteryConfigCard } from "./components/BatteryConfigCard";
import { ResultsDashboard } from "./components/ResultsDashboard";

export function SizingStep() {
  const { consumption, sizing, setSizing, nextStep } = useCotizacionStore();

  const [pasteText, setPasteText] = useState("");
  const [pasteFeedback, setPasteFeedback] = useState<{
    type: "success" | "info" | null;
    message: string | null;
  }>({ type: null, message: null });

  // Map default monthly records for solar generation
  const defaultGeneration = months.map((month) => {
    const existing = sizing?.monthlyGenerationPerPanel?.[months.indexOf(month)];
    return {
      month: month,
      kwh: existing ?? 0,
    };
  });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    getValues,
    clearErrors,
    formState: { errors },
  } = useForm<SizingFormValues>({
    resolver: customResolver,
    mode: "onChange",
    defaultValues: {
      systemType: sizing?.systemType ?? "ongrid",
      panelCount: sizing?.panelCount ?? 43,
      monthlyGenerationPerPanel: defaultGeneration,
      // Default Panel (Jinko 550Wp Tiger Neo)
      panelBrand: sizing?.panelBrand ?? "Jinko Solar",
      panelModel: sizing?.panelModel ?? "Tiger Neo 550W",
      panelPowerW: sizing?.panelPowerW ?? 550,
      panelVmpp: sizing?.panelVmpp ?? 42.1,
      panelImpp: sizing?.panelImpp ?? 13.06,
      panelVoc: sizing?.panelVoc ?? 50.1,
      panelIsc: sizing?.panelIsc ?? 13.81,
      panelBetaVoc: sizing?.panelBetaVoc ?? -0.25,
      panelWidth: sizing?.panelWidth ?? 1134,
      panelHeight: sizing?.panelHeight ?? 2278,
      panelThickness: sizing?.panelThickness ?? 30,
      // Operation
      workdays: sizing?.workdays ?? 5,
      restDays: sizing?.restDays ?? 2,
      workdaysDaytimePct: (sizing?.workdaysDaytimePct ?? 0.9) * 100,
      restDaysDaytimePct: (sizing?.restDaysDaytimePct ?? 0.1) * 100,
      // Batteries
      batteryModulesCount: sizing?.batteryModulesCount ?? 4,
      batteryModuleCapacityKwh: sizing?.batteryModuleCapacityKwh ?? 2.4,
      batteryDod: (sizing?.batteryDod ?? 0.8) * 100,
      desiredAutonomyHours: sizing?.desiredAutonomyHours ?? 4,
    },
  });

  // Watch values in real-time
  const formValues = watch();

  const panelPower = formValues.panelPowerW || 0;
  const panelCount = formValues.panelCount || 0;
  const installedCapacitykWp = (panelCount * panelPower) / 1000;

  // Clear conditional battery errors
  const systemType = formValues.systemType;
  useEffect(() => {
    if (systemType === "ongrid") {
      clearErrors(["batteryModulesCount", "batteryModuleCapacityKwh", "batteryDod", "desiredAutonomyHours"]);
    }
  }, [systemType, clearErrors]);

  // Bidirectional Panel Count <-> kWp
  const handlePanelCountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value) || 0;
    setValue("panelCount", val, { shouldValidate: true });
  };

  const handleKwpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value) || 0;
    const power = getValues("panelPowerW") || 550;
    const count = power > 0 ? Math.ceil((val * 1000) / power) : 0;
    setValue("panelCount", count, { shouldValidate: true });
  };

  // Import monthly generation from Excel
  const handlePasteAreaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setPasteText(text);

    if (text.trim() === "") {
      setPasteFeedback({ type: null, message: null });
      return;
    }

    const parsed = parseExcelPaste(text);
    if (parsed.length === 12) {
      parsed.forEach((kwh, idx) => {
        setValue(`monthlyGenerationPerPanel.${idx}.kwh`, kwh, { shouldValidate: true });
      });
      setPasteFeedback({
        type: "success",
        message: "¡12 valores de generación cargados con éxito!",
      });
    } else {
      setPasteFeedback({
        type: "info",
        message: `Encontrados ${parsed.length} de 12 valores. Copia celdas de Excel con números.`,
      });
    }
  };

  // Reset generation to 0
  const handleClearGeneration = () => {
    months.forEach((_, idx) => {
      setValue(`monthlyGenerationPerPanel.${idx}.kwh`, 0, { shouldValidate: true });
    });
    setPasteText("");
    setPasteFeedback({ type: null, message: null });
  };

  // --- CALCULATION ENGINE IN REAL-TIME ---
  const consumptionArray = consumption?.records?.map((r) => r.kwh) ?? Array(12).fill(0);
  const buyPrice = consumption?.buyPrice ?? 143;
  const sellPrice = consumption?.sellPrice ?? 70;
  const panelGenArray = formValues.monthlyGenerationPerPanel?.map((g) => g.kwh) ?? Array(12).fill(0);

  const calcParams = {
    consumos: consumptionArray,
    generacionPorPanel: panelGenArray,
    numeroPaneles: panelCount,
    diasLaborales: formValues.workdays || 5,
    diasDescanso: formValues.restDays || 2,
    pctConsumoLaboral: (formValues.workdaysDaytimePct || 90) / 100,
    pctConsumoDescanso: (formValues.restDaysDaytimePct || 10) / 100,
    precioCompra: buyPrice,
    precioInyeccion: sellPrice,
    // Batteries
    numModulosBateria: formValues.batteryModulesCount || 0,
    capacidadModuloBateriaKwh: formValues.batteryModuleCapacityKwh || 0,
    dodBateria: (formValues.batteryDod || 80) / 100,
    horasAutonomiaDeseadas: formValues.desiredAutonomyHours || 0,
  };

  let calculationsResult: any = null;

  if (systemType === "ongrid") {
    calculationsResult = calcularOnGrid(calcParams);
  } else if (systemType === "hybrid") {
    calculationsResult = calcularHibrido(calcParams);
  } else if (systemType === "offgrid") {
    calculationsResult = calcularOffGrid(calcParams);
  }

  const { detalles, totalesAnuales } = calculationsResult || { detalles: [], totalesAnuales: {} };

  const onSubmit = (data: SizingFormValues) => {
    const dataSave: SizingData = {
      systemType: data.systemType,
      panelCount: data.panelCount,
      monthlyGenerationPerPanel: data.monthlyGenerationPerPanel.map((g) => g.kwh),
      // Panel
      panelBrand: data.panelBrand,
      panelModel: data.panelModel,
      panelPowerW: data.panelPowerW,
      panelVmpp: data.panelVmpp,
      panelImpp: data.panelImpp,
      panelVoc: data.panelVoc,
      panelIsc: data.panelIsc,
      panelBetaVoc: data.panelBetaVoc,
      panelWidth: data.panelWidth,
      panelHeight: data.panelHeight,
      panelThickness: data.panelThickness,
      // Operation
      workdays: data.workdays,
      restDays: data.restDays,
      workdaysDaytimePct: data.workdaysDaytimePct / 100,
      restDaysDaytimePct: data.restDaysDaytimePct / 100,
      // Batteries
      ...(data.systemType !== "ongrid"
        ? {
            batteryModulesCount: data.batteryModulesCount,
            batteryModuleCapacityKwh: data.batteryModuleCapacityKwh,
            batteryDod: (data.batteryDod ?? 80) / 100,
            desiredAutonomyHours: data.desiredAutonomyHours,
          }
        : {}),
    };

    setSizing(dataSave);
    nextStep();
  };

  return (
    <div className="mx-auto max-w-7xl animate-in fade-in-50 duration-300">
      <form
        id="sizing-form"
        onSubmit={handleSubmit(onSubmit)}
        className="grid grid-cols-1 lg:grid-cols-[1fr_450px] gap-8 items-start"
      >
        {/* LEFT COLUMN: FORM */}
        <div className="space-y-8">
          {/* Card 1: System Type & Panels */}
          <div className="rounded-3xl border border-border/70 bg-card p-6 shadow-xl backdrop-blur-md">
            <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <Cpu className="size-5 text-primary" />
              Configuración General
            </h3>

            {/* Segmented Control for System Type */}
            <div className="mb-6">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-2">
                Tipo de Sistema
              </label>
              <div className="grid grid-cols-3 gap-2 p-1 bg-muted rounded-2xl border border-border">
                {(["ongrid", "hybrid", "offgrid"] as const).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setValue("systemType", type, { shouldValidate: true })}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold transition-all uppercase ${
                      systemType === type
                        ? "bg-background text-foreground shadow-sm font-bold animate-in fade-in-50"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {type === "ongrid" ? "On-Grid" : type === "hybrid" ? "Híbrido" : "Off-Grid"}
                  </button>
                ))}
              </div>
            </div>

            {/* Bidirectional Panels vs kWp */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground block">
                  Cantidad de Paneles
                </label>
                <div className="relative">
                  <Sun className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <input
                    type="number"
                    min={1}
                    value={panelCount || ""}
                    onChange={handlePanelCountChange}
                    className={`w-full pl-10 pr-4 py-2.5 rounded-xl border bg-background text-sm transition outline-none focus:ring-2 focus:ring-primary/20 ${
                      errors.panelCount ? "border-destructive" : "border-border"
                    }`}
                  />
                </div>
                {errors.panelCount && (
                  <p className="text-xs text-destructive font-medium">{errors.panelCount.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground block">
                  Capacidad Instalada (kWp)
                </label>
                <div className="relative">
                  <Zap className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <input
                    type="number"
                    step="0.01"
                    min={0.1}
                    value={installedCapacitykWp > 0 ? Number(installedCapacitykWp.toFixed(2)) : ""}
                    onChange={handleKwpChange}
                    placeholder="0.00"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-background text-sm transition outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Panel Specs */}
          <PanelConfigCard register={register} />

          {/* Card 3: Operation Parameters */}
          <div className="rounded-3xl border border-border/70 bg-card p-6 shadow-xl backdrop-blur-md">
            <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <Zap className="size-5 text-indigo-500" />
              Parámetros de Operación y Perfil Diurno
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground block">Días Laborales / Semana</label>
                <input
                  type="number"
                  min={0}
                  max={7}
                  className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                  {...register("workdays")}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground block">Días Descanso / Semana</label>
                <input
                  type="number"
                  min={0}
                  max={7}
                  className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                  {...register("restDays")}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground block">% Consumo Diurno Laboral</label>
                <div className="relative">
                  <input
                    type="number"
                    min={0}
                    max={100}
                    className="w-full px-3 py-2 pr-8 rounded-xl border border-border bg-background text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                    {...register("workdaysDaytimePct")}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-muted-foreground">
                    %
                  </span>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground block">% Consumo Diurno Descanso</label>
                <div className="relative">
                  <input
                    type="number"
                    min={0}
                    max={100}
                    className="w-full px-3 py-2 pr-8 rounded-xl border border-border bg-background text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                    {...register("restDaysDaytimePct")}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-muted-foreground">
                    %
                  </span>
                </div>
              </div>
            </div>
            {errors.workdays && (
              <p className="text-xs text-destructive mt-2 font-medium">{errors.workdays.message}</p>
            )}
          </div>

          {/* Card 4: Monthly Generation Grid & Importer */}
          <div className="rounded-3xl border border-border/70 bg-card p-6 shadow-xl backdrop-blur-md">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                  <Sun className="size-5 text-yellow-500" />
                  Generación Mensual Estimada por Panel (kWh)
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Ingrese la generación estimada para 1 solo panel (Explorador Solar).
                </p>
              </div>
              <button
                type="button"
                onClick={handleClearGeneration}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-background hover:bg-muted text-xs text-muted-foreground hover:text-destructive transition-all"
              >
                <Trash2 className="size-3.5" />
                Limpiar
              </button>
            </div>

            {/* Importer */}
            <div className="mb-6 p-4 rounded-2xl border border-dashed border-border/80 bg-muted/20">
              <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5 mb-2">
                <FileSpreadsheet className="size-4 text-green-600" />
                Importador rápido de Generación por Panel
              </label>
              <textarea
                rows={2}
                value={pasteText}
                onChange={handlePasteAreaChange}
                placeholder="Pega aquí los 12 valores mensuales directamente de Excel..."
                className="w-full p-3 rounded-xl border border-border bg-background text-xs outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition resize-none placeholder:text-muted-foreground/60"
              />
              {pasteFeedback.type && (
                <div
                  className={`mt-2 flex items-center gap-2 text-xs font-medium ${
                    pasteFeedback.type === "success" ? "text-green-600" : "text-blue-500"
                  }`}
                >
                  {pasteFeedback.type === "success" ? (
                    <CheckCircle2 className="size-4 shrink-0" />
                  ) : (
                    <AlertCircle className="size-4 shrink-0" />
                  )}
                  {pasteFeedback.message}
                </div>
              )}
            </div>

            {/* Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {months.map((monthName, idx) => (
                <div
                  key={monthName}
                  className="space-y-1 p-2 rounded-xl border border-border/50 bg-muted/30 hover:bg-muted/70 transition"
                >
                  <label className="text-xs font-semibold text-muted-foreground block text-center">
                    {monthName}
                  </label>
                  <input
                    type="hidden"
                    value={monthName}
                    {...register(`monthlyGenerationPerPanel.${idx}.month` as const)}
                  />
                  <input
                    type="number"
                    min={0}
                    step="0.01"
                    placeholder="0.0"
                    className="w-full text-center py-1.5 px-2 rounded-lg border border-border bg-background text-xs font-semibold focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                    {...register(`monthlyGenerationPerPanel.${idx}.kwh` as const)}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Card 5: Batteries (Only Hybrid & Off-Grid) */}
          {(systemType === "hybrid" || systemType === "offgrid") && (
            <BatteryConfigCard register={register} errors={errors} />
          )}
        </div>

        {/* RIGHT COLUMN: REACTIVE RESULTS PANEL */}
        <ResultsDashboard systemType={systemType} totalesAnuales={totalesAnuales} detalles={detalles} />
      </form>
    </div>
  );
}
