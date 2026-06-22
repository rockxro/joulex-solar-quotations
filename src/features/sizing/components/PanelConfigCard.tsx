import { Sun } from "lucide-react";
import type { UseFormRegister } from "react-hook-form";
import type { SizingFormValues } from "../sizingSchema";

interface PanelConfigCardProps {
  register: UseFormRegister<SizingFormValues>;
}

export function PanelConfigCard({ register }: PanelConfigCardProps) {
  return (
    <details className="group rounded-3xl border border-border/70 bg-card p-6 shadow-xl transition-all duration-300">
      <summary className="list-none flex items-center justify-between cursor-pointer focus:outline-none">
        <h3 className="text-lg font-semibold text-foreground flex items-center gap-2 select-none">
          <Sun className="size-5 text-yellow-500" />
          Especificaciones del Panel Solar
        </h3>
        <span className="text-xs text-muted-foreground group-open:rotate-180 transition-transform">
          ▼
        </span>
      </summary>
      <div className="mt-6 space-y-6 pt-4 border-t border-border/50 animate-in fade-in-50 duration-300">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-muted-foreground uppercase">Marca</label>
            <input
              type="text"
              className="w-full px-3 py-2 rounded-xl border border-border bg-background text-xs"
              {...register("panelBrand")}
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-muted-foreground uppercase">Modelo</label>
            <input
              type="text"
              className="w-full px-3 py-2 rounded-xl border border-border bg-background text-xs"
              {...register("panelModel")}
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-muted-foreground uppercase">Potencia (Wp)</label>
            <input
              type="number"
              className="w-full px-3 py-2 rounded-xl border border-border bg-background text-xs"
              {...register("panelPowerW")}
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-muted-foreground uppercase">Vmpp (V)</label>
            <input
              type="number"
              step="0.01"
              className="w-full px-3 py-2 rounded-xl border border-border bg-background text-xs"
              {...register("panelVmpp")}
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-muted-foreground uppercase">Impp (A)</label>
            <input
              type="number"
              step="0.01"
              className="w-full px-3 py-2 rounded-xl border border-border bg-background text-xs"
              {...register("panelImpp")}
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-muted-foreground uppercase">Voc (V)</label>
            <input
              type="number"
              step="0.01"
              className="w-full px-3 py-2 rounded-xl border border-border bg-background text-xs"
              {...register("panelVoc")}
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-muted-foreground uppercase">Isc (A)</label>
            <input
              type="number"
              step="0.01"
              className="w-full px-3 py-2 rounded-xl border border-border bg-background text-xs"
              {...register("panelIsc")}
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-muted-foreground uppercase">Coeff. Temp (Voc)</label>
            <input
              type="number"
              step="0.01"
              className="w-full px-3 py-2 rounded-xl border border-border bg-background text-xs"
              {...register("panelBetaVoc")}
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-muted-foreground uppercase">Ancho (mm)</label>
            <input
              type="number"
              className="w-full px-3 py-2 rounded-xl border border-border bg-background text-xs"
              {...register("panelWidth")}
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-muted-foreground uppercase">Alto (mm)</label>
            <input
              type="number"
              className="w-full px-3 py-2 rounded-xl border border-border bg-background text-xs"
              {...register("panelHeight")}
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-muted-foreground uppercase">Espesor (mm)</label>
            <input
              type="number"
              className="w-full px-3 py-2 rounded-xl border border-border bg-background text-xs"
              {...register("panelThickness")}
            />
          </div>
        </div>
      </div>
    </details>
  );
}
