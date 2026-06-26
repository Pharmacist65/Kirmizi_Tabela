import type { InventoryKind } from "@/game/types";

export type ShelfProduct = {
  id: string;
  categoryId: string;
  label: string;
  color: string;
  kind: InventoryKind;
  labelMode: "active-ingredient" | "brand" | "category";
};

export const productLabelModeText: Record<ShelfProduct["labelMode"], string> = {
  "active-ingredient": "Etken madde",
  brand: "Marka rafı",
  category: "Kategori"
};

export const shelfProducts: ShelfProduct[] = [
  { id: "rx-paracetamol", categoryId: "rx-core", label: "Paracetamol", color: "#f5f7f2", kind: "prescription", labelMode: "active-ingredient" },
  { id: "rx-ibuprofen", categoryId: "rx-core", label: "Ibuprofen", color: "#e9f1ff", kind: "prescription", labelMode: "active-ingredient" },
  { id: "rx-amox-clav", categoryId: "rx-core", label: "Amoksisilin + Klavulanat", color: "#fff3db", kind: "prescription", labelMode: "active-ingredient" },
  { id: "rx-lansoprazole", categoryId: "rx-core", label: "Lansoprazol", color: "#edf7ef", kind: "prescription", labelMode: "active-ingredient" },
  { id: "chronic-metformin", categoryId: "chronic", label: "Metformin", color: "#e9f3ff", kind: "prescription", labelMode: "active-ingredient" },
  { id: "chronic-atorvastatin", categoryId: "chronic", label: "Atorvastatin", color: "#f4ecff", kind: "prescription", labelMode: "active-ingredient" },
  { id: "chronic-amlodipine", categoryId: "chronic", label: "Amlodipin", color: "#fff0f0", kind: "prescription", labelMode: "active-ingredient" },
  { id: "chronic-levothyroxine", categoryId: "chronic", label: "Levotiroksin", color: "#f2f7e7", kind: "prescription", labelMode: "active-ingredient" },
  { id: "otc-ocean", categoryId: "otc-fast", label: "Ocean", color: "#2866b2", kind: "otc", labelMode: "brand" },
  { id: "otc-supradyn", categoryId: "otc-fast", label: "Supradyn", color: "#f3b11a", kind: "otc", labelMode: "brand" },
  { id: "otc-redoxon", categoryId: "otc-fast", label: "Redoxon", color: "#f26822", kind: "otc", labelMode: "brand" },
  { id: "otc-strepsils", categoryId: "otc-fast", label: "Strepsils", color: "#cf2551", kind: "otc", labelMode: "brand" },
  { id: "dermo-cerave", categoryId: "dermo", label: "CeraVe", color: "#1d75bb", kind: "dermo", labelMode: "brand" },
  { id: "dermo-lrp", categoryId: "dermo", label: "La Roche-Posay", color: "#ffffff", kind: "dermo", labelMode: "brand" },
  { id: "dermo-bioderma", categoryId: "dermo", label: "Bioderma", color: "#00a0df", kind: "dermo", labelMode: "brand" },
  { id: "dermo-vichy", categoryId: "dermo", label: "Vichy", color: "#e4f0eb", kind: "dermo", labelMode: "brand" },
  { id: "medical-omron", categoryId: "medical", label: "Omron", color: "#f4f7fb", kind: "medical", labelMode: "brand" },
  { id: "medical-braun", categoryId: "medical", label: "Braun", color: "#202020", kind: "medical", labelMode: "brand" },
  { id: "medical-pic", categoryId: "medical", label: "Pic", color: "#f4d54a", kind: "medical", labelMode: "brand" },
  { id: "medical-plusmed", categoryId: "medical", label: "Plusmed", color: "#20a567", kind: "medical", labelMode: "brand" },
  { id: "baby-mustela", categoryId: "baby-support", label: "Mustela", color: "#75b848", kind: "otc", labelMode: "brand" },
  { id: "baby-avent", categoryId: "baby-support", label: "Avent", color: "#7a5dc7", kind: "otc", labelMode: "brand" },
  { id: "baby-chicco", categoryId: "baby-support", label: "Chicco", color: "#0b83c9", kind: "otc", labelMode: "brand" },
  { id: "baby-unibaby", categoryId: "baby-support", label: "Uni Baby", color: "#f5b7d4", kind: "otc", labelMode: "brand" },
  { id: "quota-insulin", categoryId: "quota-special", label: "İnsülin kalemi", color: "#eef7ff", kind: "prescription", labelMode: "active-ingredient" },
  { id: "quota-biologic", categoryId: "quota-special", label: "Biyolojik takip", color: "#f8ecff", kind: "prescription", labelMode: "category" },
  { id: "quota-oncology", categoryId: "quota-special", label: "Onkoloji protokolü", color: "#f7eeee", kind: "prescription", labelMode: "category" }
];

export function getShelfProducts(categoryId: string) {
  return shelfProducts.filter((product) => product.categoryId === categoryId);
}
