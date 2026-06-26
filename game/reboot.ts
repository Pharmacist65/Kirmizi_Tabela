export type SceneArea = "street" | "pharmacy";
export type ScenarioId = "new" | "takeover" | "crisis";
export type OutfitId =
  | "female-red"
  | "female-red-mask"
  | "female-white"
  | "female-white-mask"
  | "female-black"
  | "female-black-mask"
  | "male-red"
  | "male-red-mask"
  | "male-white"
  | "male-white-mask"
  | "male-black"
  | "male-black-mask";
export type HotspotId = "pharmacy-door" | "depot" | "sgk-building" | "bank" | "counter" | "shelf" | "storage" | "pos" | "sgk-desk" | "exit";
export type Vec3 = [number, number, number];

export type Hotspot = {
  id: HotspotId;
  label: string;
  position: Vec3;
  radius: number;
};

export type TravelIntent = {
  hotspotId: HotspotId;
  position: Vec3;
  scene: SceneArea;
  nonce: number;
};

export type GameLog = {
  time: string;
  text: string;
};

export type RebootState = {
  scenarioId: ScenarioId;
  scene: SceneArea;
  day: number;
  time: number;
  cash: number;
  debt: number;
  sgkReceivable: number;
  posReceivable: number;
  stock: number;
  storageBoxes: number;
  openedBoxes: number;
  served: number;
  missed: number;
  queue: number;
  energy: number;
  satisfaction: number;
  complianceRisk: number;
  outfit: OutfitId;
  currentGoal: string;
  log: GameLog[];
  dayClosed: boolean;
};

export const scenarioCards: {
  id: ScenarioId;
  title: string;
  subtitle: string;
  cash: number;
  debt: number;
  stock: number;
  queue: number;
  goal: string;
}[] = [
  {
    id: "new",
    title: "Sıfırdan Açılış",
    subtitle: "Önce koli, raf ve ilk hasta akışı kurulur.",
    cash: 420000,
    debt: 0,
    stock: 18,
    queue: 2,
    goal: "Depoya git, ilk koliyi getir ve eczane içinde rafa diz."
  },
  {
    id: "takeover",
    title: "Borçlu Devralma",
    subtitle: "Hazır hasta var ama depo borcu ve eksik raf baskısı var.",
    cash: 80000,
    debt: 240000,
    stock: 37,
    queue: 4,
    goal: "Eczaneye gir, bankodaki kuyruğu erit ve depo borcunu büyütmeden stok tamamla."
  },
  {
    id: "crisis",
    title: "12 Aylık Kriz",
    subtitle: "Yoğun SGK, düşük enerji, yüksek kaçan hasta riski.",
    cash: 125000,
    debt: 310000,
    stock: 28,
    queue: 5,
    goal: "SGK riskini kontrol et, sonra bankoda hastaları kaçırmadan hizmet ver."
  }
];

export const outfitCards: { id: OutfitId; label: string; coat: string; accent: string; pants: string; gender: "Kadın" | "Erkek"; mask: boolean }[] = [
  { id: "female-red", label: "Kırmızı önlük", coat: "#b21f2d", accent: "#f7f1ec", pants: "#202a31", gender: "Kadın", mask: false },
  { id: "female-red-mask", label: "Kırmızı önlük + maske", coat: "#b21f2d", accent: "#f7f1ec", pants: "#202a31", gender: "Kadın", mask: true },
  { id: "female-white", label: "Beyaz önlük", coat: "#f5f4ea", accent: "#b21f2d", pants: "#27333a", gender: "Kadın", mask: false },
  { id: "female-white-mask", label: "Beyaz önlük + maske", coat: "#f5f4ea", accent: "#b21f2d", pants: "#27333a", gender: "Kadın", mask: true },
  { id: "female-black", label: "Siyah forma", coat: "#20282a", accent: "#e0a13a", pants: "#171f24", gender: "Kadın", mask: false },
  { id: "female-black-mask", label: "Siyah forma + maske", coat: "#20282a", accent: "#e0a13a", pants: "#171f24", gender: "Kadın", mask: true },
  { id: "male-red", label: "Kırmızı önlük", coat: "#b21f2d", accent: "#f7f1ec", pants: "#202a31", gender: "Erkek", mask: false },
  { id: "male-red-mask", label: "Kırmızı önlük + maske", coat: "#b21f2d", accent: "#f7f1ec", pants: "#202a31", gender: "Erkek", mask: true },
  { id: "male-white", label: "Beyaz önlük", coat: "#f5f4ea", accent: "#b21f2d", pants: "#27333a", gender: "Erkek", mask: false },
  { id: "male-white-mask", label: "Beyaz önlük + maske", coat: "#f5f4ea", accent: "#b21f2d", pants: "#27333a", gender: "Erkek", mask: true },
  { id: "male-black", label: "Siyah forma", coat: "#20282a", accent: "#e0a13a", pants: "#171f24", gender: "Erkek", mask: false },
  { id: "male-black-mask", label: "Siyah forma + maske", coat: "#20282a", accent: "#e0a13a", pants: "#171f24", gender: "Erkek", mask: true }
];

export const streetHotspots: Hotspot[] = [
  { id: "pharmacy-door", label: "Eczaneye gir", position: [0, 0, -1.08], radius: 1.2 },
  { id: "depot", label: "Depodan koli al", position: [-4.72, 0, 0.7], radius: 1.25 },
  { id: "sgk-building", label: "SGK binası", position: [4.65, 0, -0.05], radius: 1.25 },
  { id: "bank", label: "Banka / POS", position: [2.9, 0, 1.62], radius: 1.1 }
];

export const pharmacyHotspots: Hotspot[] = [
  { id: "counter", label: "Bankoda hasta karşıla", position: [-0.35, 0, 0.55], radius: 1.05 },
  { id: "shelf", label: "Rafı kontrol et", position: [-2.15, 0, -1.35], radius: 1.05 },
  { id: "storage", label: "Depo odası / koli", position: [2.25, 0, -1.3], radius: 1.08 },
  { id: "pos", label: "POS tahsilatı", position: [0.92, 0, 0.48], radius: 0.92 },
  { id: "sgk-desk", label: "SGK dosyası", position: [2.25, 0, 0.92], radius: 0.98 },
  { id: "exit", label: "Sokağa çık", position: [0, 0, 2.28], radius: 1.05 }
];

export function formatMoney(value: number) {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    maximumFractionDigits: 0
  }).format(value);
}

export function formatTime(minutes: number) {
  const hour = Math.floor(minutes / 60);
  const minute = minutes % 60;
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

export function createInitialState(scenarioId: ScenarioId, outfit: OutfitId): RebootState {
  const scenario = scenarioCards.find((item) => item.id === scenarioId) ?? scenarioCards[0];
  return {
    scenarioId,
    scene: "street",
    day: 1,
    time: 8 * 60 + 30,
    cash: scenario.cash,
    debt: scenario.debt,
    sgkReceivable: scenario.id === "new" ? 0 : 110000,
    posReceivable: scenario.id === "new" ? 0 : 18000,
    stock: scenario.stock,
    storageBoxes: 0,
    openedBoxes: 0,
    served: 0,
    missed: 0,
    queue: scenario.queue,
    energy: scenario.id === "crisis" ? 58 : 74,
    satisfaction: scenario.id === "crisis" ? 55 : 68,
    complianceRisk: scenario.id === "new" ? 16 : 28,
    outfit,
    currentGoal: scenario.goal,
    log: [{ time: "08:30", text: `${scenario.title} başladı. İlk hedef: ${scenario.goal}` }],
    dayClosed: false
  };
}

export function pushLog(state: RebootState, text: string, timeDelta = 20): RebootState {
  const nextTime = Math.min(19 * 60, state.time + timeDelta);
  return {
    ...state,
    time: nextTime,
    dayClosed: nextTime >= 19 * 60,
    log: [{ time: formatTime(nextTime), text }, ...state.log].slice(0, 6)
  };
}

export function getHotspots(scene: SceneArea) {
  return scene === "street" ? streetHotspots : pharmacyHotspots;
}

export function getActionLabel(target: HotspotId | null, state: RebootState) {
  if (!target) return "Yakındaki hedefe yaklaş";
  if (target === "pharmacy-door") return "Eczaneye gir";
  if (target === "exit") return "Sokağa çık";
  if (target === "depot") return state.storageBoxes > 0 ? "Teslim alınan koli var" : "12 adetlik ilk koliyi al";
  if (target === "sgk-building" || target === "sgk-desk") return "SGK dosyasını kontrol et";
  if (target === "bank" || target === "pos") return "POS mutabakatını işle";
  if (target === "storage") return state.storageBoxes > 0 ? "Koliyi aç" : state.openedBoxes > 0 ? "Açılan koliyi rafa taşı" : "Depoda koli yok";
  if (target === "shelf") return state.openedBoxes > 0 ? "Açılan koliyi rafa diz" : "Raf eksiklerini kontrol et";
  return state.queue > 0 ? "Hastayı karşıla" : "Kuyruk boş";
}

export function resolveInteraction(state: RebootState, target: HotspotId | null): RebootState {
  if (!target || state.dayClosed) return state;

  if (target === "pharmacy-door") {
    const nextGoal = state.storageBoxes > 0
      ? "Depo odasına git, koliyi aç, sonra raf istasyonuna diz."
      : "İçeride banko, raf, depo odası, POS ve SGK masası fiziksel istasyonlar.";
    return {
      ...pushLog({ ...state, scene: "pharmacy", currentGoal: nextGoal }, "Eczane kapısından içeri girdin.", 5),
      scene: "pharmacy"
    };
  }

  if (target === "exit") {
    return {
      ...pushLog({ ...state, scene: "street", currentGoal: "Dışarıda depo, SGK ve banka binalarına yürüyerek git." }, "Sokağa çıktın.", 5),
      scene: "street"
    };
  }

  if (target === "depot") {
    if (state.storageBoxes > 0) return pushLog(state, "Depo kuryesi zaten bir koliyi teslim etti; eczane depo odasında aç.", 5);
    const next = {
      ...state,
      storageBoxes: state.storageBoxes + 1,
      debt: state.debt + 18500,
      currentGoal: "Eczaneye gir, depo odasında koliyi aç ve raflara diz."
    };
    return pushLog(next, "Ecza deposundan 45 gün vadeli 12 adetlik koli aldın. Borç arttı, koli eczane depo odasına gitti.", 25);
  }

  if (target === "storage") {
    if (state.storageBoxes > 0) {
      const next = { ...state, storageBoxes: state.storageBoxes - 1, openedBoxes: state.openedBoxes + 1, currentGoal: "Rafa git ve açılan koliyi diz." };
      return pushLog(next, "Koliyi açtın: parasetamol, ibuprofen, bebek destek ve OTC hızlı dönen ürünler çıktı.", 15);
    }
    if (state.openedBoxes > 0) {
      return pushLog(state, "Açılmış koli rafta bekliyor. Raf istasyonuna git ve ürünleri diz.", 5);
    }
    return pushLog(state, "Depo odasında açılacak koli yok. Önce dışarıdaki depoya git.", 5);
  }

  if (target === "shelf") {
    if (state.openedBoxes > 0) {
      const next = { ...state, openedBoxes: state.openedBoxes - 1, stock: Math.min(100, state.stock + 22), satisfaction: Math.min(100, state.satisfaction + 3), currentGoal: "Bankoya geç ve hastaları karşıla." };
      return pushLog(next, "Açılan koliyi rafa dizdin. Ürün bulunurluğu ve memnuniyet arttı.", 20);
    }
    const next = { ...state, currentGoal: state.stock < 35 ? "Raf kritik; dışarıdaki depodan koli al." : "Raf yeterli; bankoda hasta karşıla." };
    return pushLog(next, `Raf kontrolü: doluluk %${state.stock}. ${state.stock < 35 ? "Eksik raf satış kaçırabilir." : "Bugünlük güvenli."}`, 10);
  }

  if (target === "counter") {
    if (state.queue <= 0) return pushLog(state, "Bankoda bekleyen hasta yok. Raf veya SGK işlerini kontrol et.", 5);
    const stockPenalty = state.stock <= 0;
    const sold = stockPenalty ? 0 : 1;
    const next = {
      ...state,
      queue: Math.max(0, state.queue - 1),
      stock: Math.max(0, state.stock - (sold ? 6 : 0)),
      cash: state.cash + (sold ? 540 : 0),
      posReceivable: state.posReceivable + (sold ? 420 : 0),
      sgkReceivable: state.sgkReceivable + (sold ? 920 : 0),
      served: state.served + sold,
      missed: state.missed + (stockPenalty ? 1 : 0),
      satisfaction: Math.max(0, Math.min(100, state.satisfaction + (stockPenalty ? -7 : 2))),
      currentGoal: state.queue > 1 ? "Kuyruk bitene kadar bankoda kal veya raf eksikse depoya koş." : "Kuyruk azaldı; POS ve SGK dosyasını kontrol et."
    };
    return pushLog(next, stockPenalty ? "Hasta istediği ürünü bulamadı ve çıktı. Kaçan satış yazıldı." : "Bir hastayı karşıladın. Nakit, POS ve SGK alacağı ayrı ayrı yazıldı.", 28);
  }

  if (target === "pos" || target === "bank") {
    const collected = Math.min(state.posReceivable, 4500);
    const next = { ...state, cash: state.cash + collected, posReceivable: state.posReceivable - collected, currentGoal: "POS kontrol edildi; SGK veya bankoya dön." };
    return pushLog(next, collected > 0 ? `${formatMoney(collected)} POS alacağı kasaya geçti.` : "Bekleyen POS tahsilatı yok.", 18);
  }

  if (target === "sgk-building" || target === "sgk-desk") {
    const next = {
      ...state,
      complianceRisk: Math.max(0, state.complianceRisk - 8),
      energy: Math.max(0, state.energy - 5),
      currentGoal: "SGK riski düştü; şimdi banko ve raf akışını dengele."
    };
    return pushLog(next, "SGK dosyalarını kontrol ettin. Kesinti riski düştü ama enerji harcadın.", 30);
  }

  return state;
}
