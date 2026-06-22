import { create } from "zustand";

import type { Product } from "@/types/product";

type CatalogState = {
  parameters: Record<string, string>;
  products: Product[];
  setParameters: (parameters: Record<string, string>) => void;
  setProducts: (products: Product[]) => void;
};

export const useCatalogStore = create<CatalogState>((set) => ({
  parameters: {},
  products: [],
  setParameters: (parameters) => set({ parameters }),
  setProducts: (products) => set({ products }),
}));
