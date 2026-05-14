import type { InventoryCategory } from "@/game/types";

export function createInitialInventory(): InventoryCategory[] {
  return [
    {
      id: "rx-core",
      name: "Reçete Temel Stok",
      kind: "prescription",
      stock: 56,
      capacity: 120,
      unitCost: 420,
      sellPrice: 520,
      demand: 16,
      expiryRisk: 12,
      defaultTermDays: 90
    },
    {
      id: "chronic",
      name: "Kronik Hasta Grubu",
      kind: "prescription",
      stock: 38,
      capacity: 90,
      unitCost: 680,
      sellPrice: 820,
      demand: 10,
      expiryRisk: 10,
      defaultTermDays: 90
    },
    {
      id: "otc-fast",
      name: "OTC Hızlı Dönen",
      kind: "otc",
      stock: 44,
      capacity: 110,
      unitCost: 135,
      sellPrice: 220,
      demand: 14,
      expiryRisk: 8,
      defaultTermDays: 60
    },
    {
      id: "dermo",
      name: "Dermokozmetik",
      kind: "dermo",
      stock: 26,
      capacity: 80,
      unitCost: 310,
      sellPrice: 540,
      demand: 7,
      expiryRisk: 18,
      defaultTermDays: 45
    },
    {
      id: "medical",
      name: "Medikal & Yardımcı",
      kind: "medical",
      stock: 24,
      capacity: 70,
      unitCost: 190,
      sellPrice: 310,
      demand: 6,
      expiryRisk: 6,
      defaultTermDays: 60
    },
    {
      id: "baby-support",
      name: "Anne-Bebek / Destek",
      kind: "otc",
      stock: 20,
      capacity: 80,
      unitCost: 240,
      sellPrice: 390,
      demand: 6,
      expiryRisk: 9,
      defaultTermDays: 45
    },
    {
      id: "quota-special",
      name: "Sıralı-Kotalı Özel",
      kind: "prescription",
      stock: 12,
      capacity: 45,
      unitCost: 1250,
      sellPrice: 1580,
      demand: 4,
      expiryRisk: 16,
      defaultTermDays: 90
    }
  ];
}
