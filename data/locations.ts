import type { LocationType } from "@/game/types";

export type DistrictProfile = {
  city: string;
  district: string;
  rentIndex: number;
  traffic: number;
  prescriptionPressure: number;
  retailPotential: number;
  competition: number;
  supplierAccess: number;
  dutyPressure: number;
};

export const cityDistricts: Record<string, DistrictProfile[]> = {
  İstanbul: [
    { city: "İstanbul", district: "Kadıköy", rentIndex: 86, traffic: 78, prescriptionPressure: 55, retailPotential: 84, competition: 78, supplierAccess: 86, dutyPressure: 52 },
    { city: "İstanbul", district: "Üsküdar", rentIndex: 72, traffic: 66, prescriptionPressure: 68, retailPotential: 58, competition: 64, supplierAccess: 82, dutyPressure: 58 },
    { city: "İstanbul", district: "Bağcılar", rentIndex: 62, traffic: 82, prescriptionPressure: 75, retailPotential: 46, competition: 70, supplierAccess: 76, dutyPressure: 68 },
    { city: "İstanbul", district: "Şişli", rentIndex: 94, traffic: 88, prescriptionPressure: 58, retailPotential: 88, competition: 84, supplierAccess: 88, dutyPressure: 48 },
    { city: "İstanbul", district: "Esenyurt", rentIndex: 58, traffic: 74, prescriptionPressure: 62, retailPotential: 52, competition: 66, supplierAccess: 70, dutyPressure: 64 }
  ],
  Ankara: [
    { city: "Ankara", district: "Çankaya", rentIndex: 78, traffic: 72, prescriptionPressure: 62, retailPotential: 74, competition: 72, supplierAccess: 80, dutyPressure: 46 },
    { city: "Ankara", district: "Keçiören", rentIndex: 56, traffic: 68, prescriptionPressure: 74, retailPotential: 48, competition: 58, supplierAccess: 72, dutyPressure: 62 },
    { city: "Ankara", district: "Mamak", rentIndex: 48, traffic: 58, prescriptionPressure: 70, retailPotential: 42, competition: 46, supplierAccess: 66, dutyPressure: 64 }
  ],
  İzmir: [
    { city: "İzmir", district: "Karşıyaka", rentIndex: 74, traffic: 72, prescriptionPressure: 54, retailPotential: 78, competition: 70, supplierAccess: 78, dutyPressure: 46 },
    { city: "İzmir", district: "Konak", rentIndex: 82, traffic: 86, prescriptionPressure: 64, retailPotential: 76, competition: 78, supplierAccess: 82, dutyPressure: 58 },
    { city: "İzmir", district: "Bornova", rentIndex: 66, traffic: 74, prescriptionPressure: 58, retailPotential: 70, competition: 62, supplierAccess: 74, dutyPressure: 50 }
  ]
};

export const locationTypeLabels: Record<LocationType, string> = {
  hospital: "Hastane yakını",
  neighborhood: "Mahalle arası",
  avenue: "Cadde üstü",
  mall: "AVM / plaza çevresi",
  rural: "Kırsal ilçe",
  university: "Üniversite çevresi",
  touristic: "Turistik bölge",
  industrial: "Sanayi / iş yeri çevresi"
};

export const locationTypeOptions: LocationType[] = [
  "hospital",
  "neighborhood",
  "avenue",
  "mall",
  "rural",
  "university",
  "touristic"
];

export const locationTypeModifiers: Record<
  LocationType,
  {
    rent: number;
    traffic: number;
    prescription: number;
    retail: number;
    satisfaction: number;
    complianceRisk: number;
    description: string;
  }
> = {
  hospital: {
    rent: 1.25,
    traffic: 12,
    prescription: 22,
    retail: -8,
    satisfaction: -4,
    complianceRisk: 8,
    description: "Yüksek reçete, yüksek kuyruk, SGK ve hata baskısı."
  },
  neighborhood: {
    rent: 0.92,
    traffic: 0,
    prescription: 8,
    retail: -2,
    satisfaction: 8,
    complianceRisk: 0,
    description: "Sadakat, kronik hasta ve emanet ilaç baskısı."
  },
  avenue: {
    rent: 1.42,
    traffic: 16,
    prescription: -6,
    retail: 24,
    satisfaction: -2,
    complianceRisk: 1,
    description: "Dermo/OTC güçlü, kira yüksek, POS/nakit hızlı döner."
  },
  mall: {
    rent: 1.5,
    traffic: 20,
    prescription: -12,
    retail: 28,
    satisfaction: -3,
    complianceRisk: 2,
    description: "Hızlı perakende ve yüksek kira."
  },
  rural: {
    rent: 0.72,
    traffic: -14,
    prescription: 10,
    retail: -12,
    satisfaction: 12,
    complianceRisk: 2,
    description: "Düşük rekabet, tedarik riski ve nöbet baskısı."
  },
  university: {
    rent: 1.04,
    traffic: 8,
    prescription: -4,
    retail: 16,
    satisfaction: 0,
    complianceRisk: 1,
    description: "OTC ve genç müşteri yoğun, dönemsel dalgalı."
  },
  touristic: {
    rent: 1.16,
    traffic: 10,
    prescription: -14,
    retail: 26,
    satisfaction: -1,
    complianceRisk: 1,
    description: "Sezon güçlü, kış sessiz; güneş/OTC kritik."
  },
  industrial: {
    rent: 0.95,
    traffic: 4,
    prescription: 4,
    retail: 4,
    satisfaction: 1,
    complianceRisk: 1,
    description: "İş yeri çevresi, vardiya ve iş kazası trafiği."
  }
};

export function getDistrictProfile(city: string, district: string) {
  return cityDistricts[city]?.find((item) => item.district === district) ?? cityDistricts.İstanbul[0];
}
