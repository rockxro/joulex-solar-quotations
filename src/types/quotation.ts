import type { Client } from "@/types/client";
import type { ConsumptionData } from "@/types/consumption";
import type { SizingData, SystemType } from "@/types/sizing";
import type { ProductLine } from "@/types/product";

export type QuotationDraft = {
  client: Client | null;
  consumption: ConsumptionData | null;
  sizing: SizingData | null;
  products: ProductLine[];
  systemType: SystemType;
};

export type SavedQuotation = QuotationDraft & {
  date: string;
  id: number;
  pdfPath?: string;
  total: number;
};
