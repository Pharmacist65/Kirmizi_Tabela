import type { TimedTask } from "@/game/types";

export const openingTaskTemplates: TimedTask[] = [
  {
    id: "confirm-budget",
    title: "Başlangıç Bütçesini Onayla",
    description: "Kira, tadilat, ilk stok ve işletme sermayesi için açılış dosyasını kilitle.",
    durationMinutes: 45,
    demoDurationSeconds: 8,
    status: "ready",
    effects: { energy: -1, reputation: 1 }
  },
  {
    id: "collect-documents",
    title: "Ruhsat ve Evrak Süreci",
    description: "Diploma, kimlik, ikamet, sabıka, sağlık ve ruhsat dosyasını toparla.",
    durationMinutes: 120,
    demoDurationSeconds: 20,
    status: "locked",
    unlocksAfter: ["confirm-budget"],
    effects: { complianceRisk: -4, energy: -2 }
  },
  {
    id: "chamber-application",
    title: "Eczacı Odası / Oda Kaydı",
    description: "Oda başvurusu, kayıt ve uygunluk dosyasını tamamla.",
    durationMinutes: 240,
    demoDurationSeconds: 18,
    status: "locked",
    unlocksAfter: ["collect-documents"],
    effects: { complianceRisk: -6, reputation: 3, cash: -4500 }
  },
  {
    id: "district-health",
    title: "İlçe Sağlık ve Tabela Uygunluğu",
    description: "İlçe sağlık kontrolü, tabela uygunluğu ve fiziki şartları onaylat.",
    durationMinutes: 360,
    demoDurationSeconds: 18,
    status: "locked",
    unlocksAfter: ["chamber-application"],
    effects: { complianceRisk: -7, reputation: 2, cash: -6500 }
  },
  {
    id: "supplier-predeal",
    title: "Depo Anlaşması Yap",
    description: "İlk depo limiti, iskonto ve 45/60/90 gün vade sınırlarını aç.",
    durationMinutes: 90,
    demoDurationSeconds: 15,
    status: "locked",
    unlocksAfter: ["district-health"],
    effects: { supplierTrust: 12, reputation: 1 }
  },
  {
    id: "pos-bank",
    title: "POS / Banka Anlaşması Seç",
    description: "Ertesi gün ödeme mi, blokeli düşük komisyon mu? İlk banka dosyasını aç.",
    durationMinutes: 75,
    demoDurationSeconds: 12,
    status: "locked",
    unlocksAfter: ["supplier-predeal"],
    effects: { cash: -2500, reputation: 1 }
  },
  {
    id: "first-stock",
    title: "İlk Temel Stok Siparişi",
    description: "Reçete temel, kronik, OTC ve dermo rafını açılışa yetecek kadar doldur.",
    durationMinutes: 240,
    demoDurationSeconds: 20,
    status: "locked",
    unlocksAfter: ["pos-bank"],
    effects: { stockHealth: 22, satisfaction: 4, cash: -26000, supplierTrust: 3 }
  },
  {
    id: "counter-shelves",
    title: "Banko / Raf / Depo Odası Kurulumu",
    description: "Banko akışı, raf dizimi, depo odası ve POS noktasını yerleştir.",
    durationMinutes: 300,
    demoDurationSeconds: 18,
    status: "locked",
    unlocksAfter: ["first-stock"],
    effects: { satisfaction: 5, stockHealth: 6, cash: -18000 }
  },
  {
    id: "staff-choice",
    title: "Personel Planını Yap",
    description: "Tek kişi başlama riskini veya ilk teknikeri alma maliyetini değerlendir.",
    durationMinutes: 90,
    demoDurationSeconds: 12,
    status: "locked",
    unlocksAfter: ["counter-shelves"],
    effects: { staffMorale: 3, energy: 4 }
  },
  {
    id: "sign-and-architecture",
    title: "Tabela Montajını Tamamla",
    description: "Kırmızı ECZANE tabelası ve yandan yanan E logosunu tak.",
    durationMinutes: 360,
    demoDurationSeconds: 18,
    status: "locked",
    unlocksAfter: ["staff-choice"],
    effects: { reputation: 6, satisfaction: 3, cash: -16000 }
  },
  {
    id: "opening-day",
    title: "Açılış Gününü Başlat",
    description: "Satış, depo, SGK, POS ve personel modüllerini aç.",
    durationMinutes: 30,
    demoDurationSeconds: 8,
    status: "locked",
    unlocksAfter: ["sign-and-architecture"],
    effects: { reputation: 5, energy: 6, satisfaction: 4 }
  }
];
