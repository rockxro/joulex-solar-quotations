import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import {
  AlertCircle,
  CheckCircle2,
  DollarSign,
  FileSpreadsheet,
  Trash2,
  User,
  Zap,
} from "lucide-react";

import { months, type MonthName } from "@/lib/months";
import { useCotizacionStore } from "@/store/quotationStore";
import { type ConsumptionFormValues, customResolver } from "./consumptionSchema";
import { utilityTariffs, parseExcelPaste } from "./consumptionUtils";
import { InputField } from "@/components/ui/InputField";
import { SelectField } from "@/components/ui/SelectField";

export function ConsumptionStep() {
  const { consumption, setConsumption, nextStep } = useCotizacionStore();

  const [pasteText, setPasteText] = useState("");
  const [pasteFeedback, setPasteFeedback] = useState<{
    type: "success" | "info" | null;
    message: string | null;
  }>({ type: null, message: null });

  // Map default monthly records
  const defaultRecords = months.map((month) => {
    const existing = consumption?.records?.find((r) => r.month === month);
    return {
      month: month,
      kwh: existing?.kwh ?? 0,
    };
  });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    clearErrors,
    formState: { errors },
  } = useForm<ConsumptionFormValues>({
    resolver: customResolver,
    mode: "onChange",
    defaultValues: {
      billingName: consumption?.billingName ?? "",
      tariff: consumption?.tariff ?? "BT1",
      connectedPower: consumption?.connectedPower ?? 5.5,
      buyPrice: consumption?.buyPrice ?? 143,
      sellPrice: consumption?.sellPrice ?? 70,
      maxDemand: consumption?.maxDemand ?? 0,
      peakDemand: consumption?.peakDemand ?? 0,
      records: defaultRecords,
    },
  });

  const tariffSelected = watch("tariff");
  const showDemandFields = ["BT3", "BT4.1", "BT4.2", "BT4.3"].includes(tariffSelected);

  // Clear errors if switching to a tariff that does not require demand fields
  useEffect(() => {
    if (!showDemandFields) {
      clearErrors(["maxDemand", "peakDemand"]);
    }
  }, [showDemandFields, clearErrors]);

  // Handle Excel paste
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
        setValue(`records.${idx}.kwh`, kwh, { shouldValidate: true });
      });
      setPasteFeedback({
        type: "success",
        message: "¡12 consumos cargados exitosamente de Enero a Diciembre!",
      });
    } else {
      setPasteFeedback({
        type: "info",
        message: `Encontrados ${parsed.length} de 12 valores necesarios (pegados usando saltos de línea o tabulación).`,
      });
    }
  };

  // Reset inputs to 0
  const handleClearConsumption = () => {
    months.forEach((_, idx) => {
      setValue(`records.${idx}.kwh`, 0, { shouldValidate: true });
    });
    setPasteText("");
    setPasteFeedback({ type: null, message: null });
  };

  const onSubmit = (data: ConsumptionFormValues) => {
    setConsumption({
      billingName: data.billingName,
      tariff: data.tariff,
      connectedPower: data.connectedPower,
      buyPrice: data.buyPrice,
      sellPrice: data.sellPrice,
      maxDemand: showDemandFields ? data.maxDemand : undefined,
      peakDemand: showDemandFields ? data.peakDemand : undefined,
      records: data.records.map((r) => ({
        kwh: r.kwh,
        month: r.month as MonthName,
      })),
    });
    nextStep();
  };

  return (
    <div className="mx-auto max-w-4xl animate-in fade-in-50 duration-300">
      <div className="rounded-3xl border border-border/70 bg-card p-8 shadow-xl backdrop-blur-md">
        <div className="mb-8 border-b border-border/50 pb-6">
          <h3 className="text-xl font-semibold text-foreground">
            Perfil de Consumo Eléctrico
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            Ingrese el titular de la boleta, la tarifa, potencia conectada y los consumos mensuales del cliente.
          </p>
        </div>

        <form
          id="consumption-form"
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-8"
        >
          {/* Contract Details Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <InputField
              label="Titular de la Boleta"
              placeholder="Ej: María José Silva"
              icon={User}
              error={errors.billingName}
              {...register("billingName")}
            />

            <SelectField
              label="Tipo de Tarifa"
              icon={Zap}
              options={utilityTariffs}
              error={errors.tariff}
              {...register("tariff")}
            />

            <InputField
              label="Potencia Conectada (kW)"
              type="number"
              step="0.01"
              placeholder="Ej: 5.50"
              icon={Zap}
              error={errors.connectedPower}
              {...register("connectedPower")}
            />
          </div>

          {/* Pricing Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 border-t border-border/50">
            <InputField
              label="Precio de Compra de Energía ($/kWh)"
              type="number"
              placeholder="Ej: 143"
              icon={DollarSign}
              error={errors.buyPrice}
              {...register("buyPrice")}
            />

            <InputField
              label="Precio de Inyección Net Billing ($/kWh)"
              type="number"
              placeholder="Ej: 70"
              icon={DollarSign}
              error={errors.sellPrice}
              {...register("sellPrice")}
            />
          </div>

          {/* Peak / Demand Section */}
          {showDemandFields && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-border/50 animate-in slide-in-from-top-4 duration-300">
              <InputField
                label="Demanda Máxima Suministrada (kW)"
                type="number"
                step="0.01"
                placeholder="Ej: 12.4"
                icon={Zap}
                error={errors.maxDemand}
                {...register("maxDemand")}
              />

              <InputField
                label="Demanda Máxima en Horas de Punta (kW)"
                type="number"
                step="0.01"
                placeholder="Ej: 8.5"
                icon={Zap}
                error={errors.peakDemand}
                {...register("peakDemand")}
              />
            </div>
          )}

          {/* Historical Consumption Excel Importer */}
          <div className="border-t border-border/50 pt-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  Ingreso de Consumos Históricos
                </h4>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Ingrese los consumos de los últimos 12 meses (kWh). Puedes ingresarlos uno a uno o usar el importador rápido de Excel.
                </p>
              </div>
              <button
                type="button"
                onClick={handleClearConsumption}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-background hover:bg-muted text-xs text-muted-foreground hover:text-destructive transition-all"
              >
                <Trash2 className="size-3.5" />
                Limpiar todo
              </button>
            </div>

            {/* Excel Paste Box */}
            <div className="mb-6 p-4 rounded-2xl border border-dashed border-border/80 bg-muted/20">
              <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5 mb-2">
                <FileSpreadsheet className="size-4 text-green-600" />
                Importador rápido (Excel o Explorador Solar)
              </label>
              <textarea
                rows={2}
                value={pasteText}
                onChange={handlePasteAreaChange}
                placeholder="Pega aquí una fila o columna con los 12 consumos mensuales directamente desde tu planilla..."
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

            {/* 12 Months Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {months.map((monthName, idx) => (
                <div
                  key={monthName}
                  className="space-y-1.5 p-3 rounded-2xl border border-border/60 bg-muted/40 hover:bg-muted/80 transition-all duration-200"
                >
                  <label className="text-xs font-semibold text-muted-foreground block text-center">
                    {monthName}
                  </label>
                  <div className="relative">
                    <input
                      type="hidden"
                      value={monthName}
                      {...register(`records.${idx}.month` as const)}
                    />
                    <input
                      type="number"
                      min={0}
                      placeholder="0"
                      className={`w-full text-center py-2 px-3 rounded-xl border bg-background text-sm font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none ${
                        errors.records?.[idx]?.kwh
                          ? "border-destructive focus:ring-destructive"
                          : "border-border"
                      }`}
                      {...register(`records.${idx}.kwh` as const)}
                    />
                  </div>
                  {errors.records?.[idx]?.kwh && (
                    <p className="text-[10px] text-destructive text-center font-medium">
                      {errors.records[idx]?.kwh?.message}
                    </p>
                  )}
                </div>
              ))}
            </div>
            {errors.records?.root && (
              <p className="text-xs text-destructive mt-2 font-medium text-center">
                {errors.records.root.message}
              </p>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
