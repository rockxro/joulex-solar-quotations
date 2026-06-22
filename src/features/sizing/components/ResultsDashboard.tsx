import { Battery, Info } from "lucide-react";
import { formatCLP } from "@/lib/formatters";

interface ResultsDashboardProps {
  systemType: "ongrid" | "hybrid" | "offgrid";
  totalesAnuales: {
    generacionPlanta?: number;
    coberturaEnergetica?: number;
    ahorroTotal?: number;
    recorte?: number;
    inyeccion?: number;
    consumoDiarioPromedio?: number;
    autonomiaRealHoras?: number;
    modulosNecesarios?: number;
    deficit?: number;
    costoRespaldo?: number;
  };
  detalles: Array<{
    month: string;
    consumption: number;
    generacionPlanta: number;
    consumoSolarDirectoMes?: number;
    consumoSolar?: number;
    deficitMes?: number;
    inyeccionMes?: number;
    inyeccion?: number;
    saldo: number;
  }>;
}

export function ResultsDashboard({ systemType, totalesAnuales, detalles }: ResultsDashboardProps) {
  return (
    <div className="space-y-6 lg:sticky lg:top-24">
      <div className="rounded-3xl border border-border bg-background/55 p-6 shadow-2xl backdrop-blur-lg">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">
          Resumen Técnico Estimado (Anual)
        </h4>

        {/* Totales Cards */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="p-4 rounded-2xl bg-card border border-border/80 shadow-sm">
            <span className="text-xs text-muted-foreground block leading-tight">Generación Solar</span>
            <span className="text-xl font-bold text-foreground mt-1 block">
              {Math.round(totalesAnuales.generacionPlanta || 0).toLocaleString()}{" "}
              <span className="text-xs font-medium text-muted-foreground">kWh</span>
            </span>
          </div>
          <div className="p-4 rounded-2xl bg-card border border-border/80 shadow-sm">
            <span className="text-xs text-muted-foreground block leading-tight">Cobertura Energética</span>
            <span className="text-xl font-bold text-foreground mt-1 block">
              {Math.round((totalesAnuales.coberturaEnergetica || 0) * 100)}{" "}
              <span className="text-xs font-medium text-muted-foreground">%</span>
            </span>
          </div>
          <div className="p-4 rounded-2xl bg-card border border-border/80 shadow-sm">
            <span className="text-xs text-muted-foreground block leading-tight">Ahorro Anual</span>
            <span className="text-xl font-bold text-primary mt-1 block">
              {formatCLP(totalesAnuales.ahorroTotal || 0)}
            </span>
          </div>
          <div className="p-4 rounded-2xl bg-card border border-border/80 shadow-sm">
            <span className="text-xs text-muted-foreground block leading-tight">
              {systemType === "offgrid" ? "Recorte Solar (Pérdida)" : "Inyección Anual"}
            </span>
            <span className="text-xl font-bold text-foreground mt-1 block">
              {Math.round(
                systemType === "offgrid" ? totalesAnuales.recorte || 0 : totalesAnuales.inyeccion || 0
              ).toLocaleString()}{" "}
              <span className="text-xs font-medium text-muted-foreground">kWh</span>
            </span>
          </div>
        </div>

        {/* Battery Suggestions */}
        {(systemType === "hybrid" || systemType === "offgrid") && (
          <div className="mb-6 p-4 rounded-2xl bg-green-500/10 border border-green-500/20 text-xs space-y-2">
            <h5 className="font-semibold text-green-700 dark:text-green-400 flex items-center gap-1.5">
              <Battery className="size-4 shrink-0" />
              Calculadora de Batería Referencial
            </h5>
            <div className="grid grid-cols-2 gap-2 text-muted-foreground">
              <div>
                <span>Consumo Diario Prom:</span>
                <strong className="block text-foreground mt-0.5">
                  {Number(totalesAnuales.consumoDiarioPromedio?.toFixed(1) || 0)} kWh
                </strong>
              </div>
              <div>
                <span>Autonomía Real:</span>
                <strong className="block text-foreground mt-0.5">
                  {Number(totalesAnuales.autonomiaRealHoras?.toFixed(1) || 0)} Horas
                </strong>
              </div>
              <div className="col-span-2 border-t border-green-500/20 pt-2 flex justify-between items-center text-green-700 dark:text-green-400 font-semibold text-sm">
                <span>Módulos Sugeridos:</span>
                <span>{totalesAnuales.modulosNecesarios || 0} U.</span>
              </div>
            </div>
          </div>
        )}

        {/* Diesel Backup (Off-grid) */}
        {systemType === "offgrid" && (
          <div className="mb-6 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs space-y-1">
            <h5 className="font-semibold text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
              <Info className="size-4 shrink-0" />
              Déficit y Generación de Respaldo
            </h5>
            <p className="text-muted-foreground">Déficit energético anual estimado que requeriría respaldo:</p>
            <div className="flex justify-between items-center text-sm font-bold text-foreground mt-2">
              <span>Déficit Anual:</span>
              <span>{Math.round(totalesAnuales.deficit || 0).toLocaleString()} kWh</span>
            </div>
            <div className="flex justify-between items-center text-xs text-muted-foreground mt-1">
              <span>Costo Combustible ($/año):</span>
              <span>{formatCLP(totalesAnuales.costoRespaldo || 0)}</span>
            </div>
          </div>
        )}

        {/* Month Breakdown Table */}
        <div className="max-h-60 overflow-y-auto border border-border/80 rounded-2xl bg-card">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="sticky top-0 bg-muted border-b border-border/80 font-semibold text-muted-foreground">
              <tr>
                <th className="py-2 px-3">Mes</th>
                <th className="py-2 px-3 text-right">Cons.</th>
                <th className="py-2 px-3 text-right">Gen.</th>
                <th className="py-2 px-3 text-right">Solar</th>
                <th className="py-2 px-3 text-right">{systemType === "offgrid" ? "Déf." : "Iny."}</th>
                <th className="py-2 px-3 text-right">Saldo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {detalles.map((d) => (
                <tr key={d.month} className="hover:bg-muted/30">
                  <td className="py-2 px-3 font-medium text-foreground">{d.month}</td>
                  <td className="py-2 px-3 text-right text-muted-foreground">
                    {Math.round(d.consumption).toLocaleString()}
                  </td>
                  <td className="py-2 px-3 text-right text-muted-foreground">
                    {Math.round(d.generacionPlanta).toLocaleString()}
                  </td>
                  <td className="py-2 px-3 text-right text-foreground font-semibold">
                    {Math.round(
                      d.consumoSolarDirectoMes !== undefined ? d.consumoSolarDirectoMes : (d.consumoSolar || 0)
                    ).toLocaleString()}
                  </td>
                  <td className="py-2 px-3 text-right text-muted-foreground">
                    {Math.round(
                      systemType === "offgrid"
                        ? (d.deficitMes || 0)
                        : (d.inyeccionMes !== undefined ? d.inyeccionMes : (d.inyeccion || 0))
                    ).toLocaleString()}
                  </td>
                  <td className={`py-2 px-3 text-right font-medium ${d.saldo >= 0 ? "text-green-600" : "text-destructive"}`}>
                    {formatCLP(d.saldo)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
