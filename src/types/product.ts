export type ProductCategory =
  | "panel"
  | "inverter"
  | "battery"
  | "structure"
  | "cable"
  | "other";

export type Product = {
  active: boolean;
  category: ProductCategory;
  id: number;
  name: string;
  powerW?: number;
  price: number;
  unit: string;
};

export type ProductLine = {
  quantity: number;
  unitPrice: number;
  productId: number;
};
