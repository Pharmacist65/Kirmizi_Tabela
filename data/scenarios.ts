import type { GameState, ScenarioTemplate, StartProfile } from "@/game/types";
import { createInitialStaff, createRoutineExpenses } from "@/data/staff";
import { createInitialInventory } from "@/data/inventory";
import { getDistrictProfile, locationTypeLabels, locationTypeModifiers } from "@/data/locations";

export const defaultScenarioId = "takeover-neighborhood-debt";

const clamp = (value: number, min = 0, max = 100) => Math.min(max, Math.max(min, value));
const moneyRound = (value: number) => Math.round(value / 100) * 100;

export const scenarioTemplates: ScenarioTemplate[] = [
  {
    id: "new-neighborhood-balanced",
    name: "Mahallede Sıfırdan Açılış",
    startMode: "new",
    locationName: "Yoğun Mahalle Arası",
    locationType: "neighborhood",
    difficulty: "rahat",
    description:
      "Sadık müşteri potansiyeli var. Kira makul, reçete akışı orta, ilişki yönetimi önemli.",
    startingCash: 360000,
    startingDebt: 90000,
    startingSgkReceivable: 0,
    startingPosReceivable: 0,
    monthlyRent: 38000,
    posCommissionRate: 2.05,
    privateInsuranceReceivable: 0,
    traffic: 56,
    prescriptionPressure: 55,
    retailPotential: 48,
    energy: 82,
    satisfaction: 58,
    stockHealth: 62,
    staffMorale: 68,
    reputation: 42,
    complianceRisk: 16,
    supplierTrust: 54,
    dermoPotential: 38,
    otcPotential: 54,
    goals: {
      months: 12,
      targetCash: 260000,
      maxDebt: 120000,
      minSatisfaction: 74,
      minStockHealth: 72,
      minEnergy: 35,
      maxComplianceRisk: 45,
      minScore: 68
    },
    tags: ["Sıfırdan", "Makul kira", "Öğretici"]
  },
  {
    id: "takeover-neighborhood-debt",
    name: "Borçlu Mahalle Eczanesini Kurtar",
    startMode: "takeover",
    locationName: "Eski Mahalle Merkezi",
    locationType: "neighborhood",
    difficulty: "gercekci",
    description:
      "Müşteri tanıyor ama depo borcu baskılı. Doğru stok ve vade yönetimiyle toparlanabilir.",
    startingCash: 80000,
    startingDebt: 240000,
    startingSgkReceivable: 110000,
    startingPosReceivable: 18000,
    monthlyRent: 32000,
    posCommissionRate: 2.25,
    privateInsuranceReceivable: 18000,
    traffic: 62,
    prescriptionPressure: 68,
    retailPotential: 45,
    energy: 72,
    satisfaction: 68,
    stockHealth: 55,
    staffMorale: 64,
    reputation: 58,
    complianceRisk: 22,
    supplierTrust: 62,
    dermoPotential: 46,
    otcPotential: 52,
    goals: {
      months: 12,
      targetCash: 250000,
      maxDebt: 170000,
      minSatisfaction: 80,
      minStockHealth: 75,
      minEnergy: 28,
      maxComplianceRisk: 48,
      minScore: 70
    },
    tags: ["Devralma", "Borç baskısı", "Klasik mahalle"]
  },
  {
    id: "takeover-hospital-pressure",
    name: "Hastane Yakını Yoğun Banko",
    startMode: "takeover",
    locationName: "Eğitim Hastanesi Çevresi",
    locationType: "hospital",
    difficulty: "zor",
    description:
      "Reçete trafiği yüksek, SGK alacağı büyür. Kuyruk, personel ve hata riski sürekli baskı yapar.",
    startingCash: 125000,
    startingDebt: 310000,
    startingSgkReceivable: 185000,
    startingPosReceivable: 26000,
    monthlyRent: 68000,
    posCommissionRate: 2.4,
    privateInsuranceReceivable: 42000,
    traffic: 88,
    prescriptionPressure: 90,
    retailPotential: 42,
    energy: 66,
    satisfaction: 61,
    stockHealth: 58,
    staffMorale: 56,
    reputation: 54,
    complianceRisk: 31,
    supplierTrust: 57,
    dermoPotential: 35,
    otcPotential: 46,
    goals: {
      months: 12,
      targetCash: 320000,
      maxDebt: 230000,
      minSatisfaction: 72,
      minStockHealth: 76,
      minEnergy: 22,
      maxComplianceRisk: 50,
      minScore: 66
    },
    tags: ["Hastane", "Yüksek SGK", "Yoğun tempo"]
  },
  {
    id: "new-avenue-dermo",
    name: "Cadde Üstü Dermo Hamlesi",
    startMode: "new",
    locationName: "İşlek Cadde",
    locationType: "avenue",
    difficulty: "gercekci",
    description:
      "Kira yüksek ama vitrin güçlü. Dermo ve OTC ile peşin kasa yaratmak mümkün.",
    startingCash: 520000,
    startingDebt: 160000,
    startingSgkReceivable: 0,
    startingPosReceivable: 36000,
    monthlyRent: 92000,
    posCommissionRate: 1.95,
    privateInsuranceReceivable: 12000,
    traffic: 78,
    prescriptionPressure: 48,
    retailPotential: 82,
    energy: 78,
    satisfaction: 55,
    stockHealth: 64,
    staffMorale: 66,
    reputation: 38,
    complianceRisk: 18,
    supplierTrust: 52,
    dermoPotential: 76,
    otcPotential: 68,
    goals: {
      months: 12,
      targetCash: 430000,
      maxDebt: 180000,
      minSatisfaction: 70,
      minStockHealth: 68,
      minEnergy: 32,
      maxComplianceRisk: 46,
      minScore: 72
    },
    tags: ["Sıfırdan", "Dermo", "Yüksek kira"]
  },
  {
    id: "takeover-rural-duty",
    name: "İlçe Eczanesinde Nöbet Yükü",
    startMode: "takeover",
    locationName: "Kırsal İlçe Merkezi",
    locationType: "rural",
    difficulty: "gercekci",
    description:
      "Rekabet az, ilişki kuvvetli. Tedarik gecikmesi ve nöbet yükü oyunun ana stresi.",
    startingCash: 150000,
    startingDebt: 175000,
    startingSgkReceivable: 95000,
    startingPosReceivable: 12000,
    monthlyRent: 26000,
    posCommissionRate: 2.55,
    privateInsuranceReceivable: 9000,
    traffic: 44,
    prescriptionPressure: 64,
    retailPotential: 36,
    energy: 70,
    satisfaction: 72,
    stockHealth: 48,
    staffMorale: 62,
    reputation: 70,
    complianceRisk: 24,
    supplierTrust: 50,
    dermoPotential: 28,
    otcPotential: 44,
    goals: {
      months: 12,
      targetCash: 220000,
      maxDebt: 140000,
      minSatisfaction: 82,
      minStockHealth: 68,
      minEnergy: 25,
      maxComplianceRisk: 50,
      minScore: 68
    },
    tags: ["İlçe", "Nöbet", "Tedarik riski"]
  },
  {
    id: "new-touristic-season",
    name: "Turistik Bölgede Sezon Oyunu",
    startMode: "new",
    locationName: "Sahil Turizm Hattı",
    locationType: "touristic",
    difficulty: "zor",
    description:
      "Sezonda hızlı kasa, kışın sessizlik. OTC, güneş ürünleri ve stok zamanlaması belirleyici.",
    startingCash: 430000,
    startingDebt: 140000,
    startingSgkReceivable: 0,
    startingPosReceivable: 32000,
    monthlyRent: 76000,
    posCommissionRate: 2.15,
    privateInsuranceReceivable: 24000,
    traffic: 70,
    prescriptionPressure: 38,
    retailPotential: 88,
    energy: 76,
    satisfaction: 50,
    stockHealth: 60,
    staffMorale: 60,
    reputation: 34,
    complianceRisk: 19,
    supplierTrust: 48,
    dermoPotential: 70,
    otcPotential: 80,
    goals: {
      months: 12,
      targetCash: 520000,
      maxDebt: 160000,
      minSatisfaction: 66,
      minStockHealth: 62,
      minEnergy: 26,
      maxComplianceRisk: 48,
      minScore: 70
    },
    tags: ["Sezonluk", "OTC", "Dalgalı ciro"]
  }
];

export function createScenarioState(scenarioId = defaultScenarioId, profile?: StartProfile): GameState {
  const scenario = scenarioTemplates.find((item) => item.id === scenarioId) ?? scenarioTemplates[0];
  const city = profile?.city ?? scenario.city ?? "İstanbul";
  const district = profile?.district ?? scenario.district ?? "Kadıköy";
  const locationType = profile?.locationType ?? scenario.locationType;
  const districtProfile = getDistrictProfile(city, district);
  const locationModifier = locationTypeModifiers[locationType];
  const startMode = profile?.startMode ?? scenario.startMode;
  const isNewOpening = startMode === "new";
  const monthlyRent = moneyRound(Math.max(18000, districtProfile.rentIndex * 720 * locationModifier.rent));
  const startingCash = isNewOpening ? Math.max(scenario.startingCash, 420000) : scenario.startingCash;
  const startingDebt = isNewOpening ? 0 : scenario.startingDebt;
  const startingSgkReceivable = isNewOpening ? 0 : scenario.startingSgkReceivable;
  const startingPosReceivable = isNewOpening ? 0 : scenario.startingPosReceivable;
  const startingPrivateInsuranceReceivable = isNewOpening ? 0 : scenario.privateInsuranceReceivable;
  const initialSupplierPayables = startingDebt
    ? [
        {
          id: `supplier-opening-${scenario.id}`,
          amount: startingDebt,
          dueDay: 17,
          source: "supplier" as const,
          status: "open" as const,
          description: "Devreden depo vadesi / çek-senet",
          createdDay: 1
        }
      ]
    : [];
  const initialSgkReceivables = startingSgkReceivable
    ? [
        {
          id: `sgk-opening-${scenario.id}`,
          amount: startingSgkReceivable,
          dueDay: 15,
          source: "sgk" as const,
          status: "open" as const,
          description: "Devreden SGK alacağı",
          createdDay: 1
        }
      ]
    : [];
  const initialPosReceivables = startingPosReceivable
    ? [
        {
          id: `pos-opening-${scenario.id}`,
          amount: startingPosReceivable,
          dueDay: 2,
          source: "pos" as const,
          status: "open" as const,
          description: "Devreden POS tahsilatı",
          createdDay: 1
        }
      ]
    : [];
  const initialPrivateInsuranceReceivables = startingPrivateInsuranceReceivable
    ? [
        {
          id: `private-opening-${scenario.id}`,
          amount: startingPrivateInsuranceReceivable,
          dueDay: 25,
          source: "private-insurance" as const,
          status: "open" as const,
          description: "Devreden özel sigorta alacağı",
          createdDay: 1
        }
      ]
    : [];

  const locationName = `${city} / ${district} · ${locationTypeLabels[locationType]}`;

  return {
    pharmacistName: profile?.pharmacistName || "Ecz. Oyuncu",
    scenarioId: scenario.id,
    pharmacyName: profile?.pharmacyName || "Kırmızı Tabela Eczanesi",
    city,
    district,
    scenarioName: startMode === "new" ? "Sıfırdan Eczane Açılışı" : scenario.name,
    startMode,
    gamePhase: isNewOpening ? "setup" : "playing",
    setupCompleted: !isNewOpening,
    dayPhase: "morning",
    timeLabel: "08:30",
    locationName,
    locationType,
    difficulty: scenario.difficulty,
    monthlyRent,
    posCommissionRate: scenario.posCommissionRate,
    privateInsuranceReceivable: startingPrivateInsuranceReceivable,
    traffic: clamp(districtProfile.traffic + locationModifier.traffic),
    prescriptionPressure: clamp(districtProfile.prescriptionPressure + locationModifier.prescription),
    retailPotential: clamp(districtProfile.retailPotential + locationModifier.retail),
    currentDay: 1,
    month: 1,
    cash: startingCash,
    debt: startingDebt,
    sgkReceivable: startingSgkReceivable,
    posReceivable: startingPosReceivable,
    energy: scenario.energy,
    satisfaction: clamp(scenario.satisfaction + locationModifier.satisfaction),
    stockHealth: isNewOpening ? 18 : scenario.stockHealth,
    staffMorale: scenario.staffMorale,
    reputation: scenario.reputation,
    complianceRisk: clamp(scenario.complianceRisk + locationModifier.complianceRisk),
    supplierTrust: isNewOpening ? 28 : scenario.supplierTrust,
    dermoPotential: clamp(scenario.dermoPotential + Math.round(locationModifier.retail / 3)),
    otcPotential: clamp(scenario.otcPotential + Math.round(locationModifier.retail / 3)),
    dailyRevenue: 0,
    dailyProfit: 0,
    level: 1,
    xp: 0,
    inventory: createInitialInventory().map((item) => ({
      ...item,
      stock: isNewOpening ? Math.max(0, Math.round(item.stock * 0.12)) : item.stock
    })),
    staff: isNewOpening ? [] : createInitialStaff(),
    supplierPayables: initialSupplierPayables,
    posReceivables: initialPosReceivables,
    sgkReceivables: initialSgkReceivables,
    privateInsuranceReceivables: initialPrivateInsuranceReceivables,
    marketplaceReceivables: [],
    pharmacyMarketBalance: 0,
    lastDayReport: null,
    routineExpenses: createRoutineExpenses(),
    shelfFocus: "balanced",
    dailyActionId: "none",
    lastReport: isNewOpening
      ? `${locationName} için açılış dosyası oluşturuldu. Satış başlamadan önce kurulum görevlerini tamamla.`
      : `${locationName} senaryosu başladı. İlk karar raf, banko ve nakit dengesini kurmak.`,
    goals: scenario.goals,
    seed: 130513 + scenario.id.length * 97
  };
}
