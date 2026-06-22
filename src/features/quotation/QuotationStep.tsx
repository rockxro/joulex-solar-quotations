import { PlaceholderPanel } from "@/components/common/PlaceholderPanel";
import { formatCLP } from "@/lib/formatters";

export function QuotationStep() {
  return (
    <PlaceholderPanel
      description={`Vista previa, guardado en historial y PDF con @react-pdf/renderer. Ejemplo CLP: ${formatCLP(1250000)}.`}
      eyebrow="Paso 5"
      title="Cotización final"
    />
  );
}
