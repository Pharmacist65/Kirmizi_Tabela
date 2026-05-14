import type { DailyAction } from "@/game/types";

export const dailyActions: DailyAction[] = [
  {
    id: "check-pos",
    title: "POS / banka tahsilatını kontrol et",
    description: "Ertesi gün ve blokeli POS alacaklarını kontrol eder.",
    phase: "morning",
    durationMinutes: 10,
    cost: 0,
    risk: "low",
    expectedEffect: "Nakit akış skoru artar, POS sürpriz riski düşer.",
    effects: { energy: -1, reputation: 1 }
  },
  {
    id: "prepare-order",
    title: "Ertesi gün sipariş listesini hazırla",
    description: "Eksik ürün ve kaçan satışa göre sipariş listesi çıkarır.",
    phase: "morning",
    durationMinutes: 20,
    cost: 0,
    risk: "low",
    expectedEffect: "Stok sağlığı artar, kaçan satış riski düşer.",
    effects: { stockHealth: 4, energy: -2 }
  },
  {
    id: "assign-counter",
    title: "Banko vardiyasını netleştir",
    description: "Yoğun saatlerde banko desteğini planlar.",
    phase: "morning",
    durationMinutes: 15,
    cost: 0,
    risk: "low",
    expectedEffect: "Kuyruk baskısı ve memnuniyet kaybı azalır.",
    effects: { satisfaction: 3, energy: -1 }
  },
  {
    id: "prepare-dermo",
    title: "Dermo vitrinini hazırla",
    description: "Cadde/AVM tarzı lokasyonda hızlı nakit döngüsü yaratır.",
    phase: "morning",
    durationMinutes: 25,
    cost: 1800,
    risk: "medium",
    expectedEffect: "Dermo potansiyeli ve perakende satış artar.",
    effects: { cash: -1800, dermoPotential: 4, otcPotential: 1 }
  },
  {
    id: "check-sgk",
    title: "SGK dönemini kontrol et",
    description: "1-7 ve 7-15 dönemlerinde dosya riskini azaltır.",
    phase: "morning",
    durationMinutes: 30,
    cost: 0,
    risk: "medium",
    expectedEffect: "Uyum riski azalır, enerji harcanır.",
    effects: { complianceRisk: -4, energy: -3 }
  },
  {
    id: "counter-support",
    title: "Bankoya destek ver",
    description: "Gün içinde kuyruk uzadıysa eczacı bankoya iner.",
    phase: "open",
    durationMinutes: 20,
    cost: 0,
    risk: "low",
    expectedEffect: "Memnuniyet artar, enerji düşer.",
    effects: { satisfaction: 4, energy: -4 }
  },
  {
    id: "emergency-trade",
    title: "Yakın eczacıdan takas iste",
    description: "Kritik ürün yoksa aynı il içinde takasla bulmaya çalışır.",
    phase: "open",
    durationMinutes: 25,
    cost: 1200,
    risk: "medium",
    expectedEffect: "Stok sağlığı toparlanır, itibar ilişkisi artar.",
    effects: { cash: -1200, stockHealth: 5, reputation: 2 }
  },
  {
    id: "calm-patient",
    title: "Kızgın hastayı sakinleştir",
    description: "Emanet ilaç, fiyat veya bekleme tartışmasını yönetir.",
    phase: "open",
    durationMinutes: 15,
    cost: 0,
    risk: "medium",
    expectedEffect: "Memnuniyet ve itibar korunur, enerji düşer.",
    effects: { satisfaction: 5, reputation: 2, energy: -5 }
  },
  {
    id: "supplier-offer",
    title: "Depo temsilcisinin teklifine cevap ver",
    description: "İskonto/vade teklifini değerlendirir.",
    phase: "open",
    durationMinutes: 10,
    cost: 0,
    risk: "medium",
    expectedEffect: "Depo güveni artar, sonraki vadeler iyileşebilir.",
    effects: { supplierTrust: 4, energy: -1 }
  },
  {
    id: "rest-staff",
    title: "Personeli dinlendir / görev değiştir",
    description: "Yanlış görevlendirme ve yorgunluk riskini azaltır.",
    phase: "open",
    durationMinutes: 20,
    cost: 0,
    risk: "low",
    expectedEffect: "Personel morali artar, kısa süreli akış yavaşlar.",
    effects: { staffMorale: 5, satisfaction: -1 }
  },
  {
    id: "cash-count",
    title: "Gün sonu kasa sayımı",
    description: "Nakit, POS fişi ve açıkları kapatır.",
    phase: "closing",
    durationMinutes: 20,
    cost: 0,
    risk: "low",
    expectedEffect: "Nakit akış skoru ve uyum güveni artar.",
    effects: { reputation: 1, complianceRisk: -1, energy: -1 }
  },
  {
    id: "review-ledger",
    title: "Depo vade defterini kontrol et",
    description: "15-17 civarı yaklaşan çek/senet ödemelerini izler.",
    phase: "closing",
    durationMinutes: 20,
    cost: 0,
    risk: "low",
    expectedEffect: "Vade kaçırma riski azalır, depo güveni artar.",
    effects: { supplierTrust: 2, complianceRisk: -1 }
  },
  {
    id: "next-order-list",
    title: "Yarınki sipariş listesini hazırla",
    description: "Kaçan satış ve azalan raflara göre yarınki alımı planlar.",
    phase: "closing",
    durationMinutes: 25,
    cost: 0,
    risk: "low",
    expectedEffect: "Stok sağlığı ve ertesi gün hazırlığı artar.",
    effects: { stockHealth: 3, energy: -2 }
  }
];
