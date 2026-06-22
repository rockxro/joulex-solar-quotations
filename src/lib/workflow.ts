export type QuotationStepId =
  | "client"
  | "consumption"
  | "sizing"
  | "products"
  | "quotation";

export type AdminSectionId = "history" | "catalog" | "configuration";

export type AppView = "workflow" | AdminSectionId;

export type QuotationStep = {
  description: string;
  id: QuotationStepId;
  label: string;
  order: number;
};

export const quotationSteps = [
  {
    description: "Datos base del cliente y tarifa.",
    id: "client",
    label: "Cliente",
    order: 1,
  },
  {
    description: "Consumos mensuales y datos de boleta.",
    id: "consumption",
    label: "Consumo",
    order: 2,
  },
  {
    description: "Generación solar, paneles y resultados.",
    id: "sizing",
    label: "Dimensionamiento",
    order: 3,
  },
  {
    description: "Componentes, cantidades y precios.",
    id: "products",
    label: "Productos",
    order: 4,
  },
  {
    description: "Vista previa, guardado y PDF.",
    id: "quotation",
    label: "Cotización",
    order: 5,
  },
] as const satisfies readonly QuotationStep[];

export const adminSections = [
  { id: "history", label: "Historial" },
  { id: "catalog", label: "Catálogo" },
  { id: "configuration", label: "Configuración" },
] as const satisfies readonly { id: AdminSectionId; label: string }[];
