import type { SurpriseTemplate } from "@/game/types";

export const surpriseTemplates: SurpriseTemplate[] = [
  {
    id: "sgk-cut-small",
    title: "Kesinti Haberi Geldi",
    description: "Kontrol listesinde ufak bir eksik yakalandı. SGK alacağından 10.000 TL kesinti yazıldı.",
    tone: "bad",
    effects: { sgkReceivable: -10000, complianceRisk: 5, energy: -4 }
  },
  {
    id: "tax-refund",
    title: "Vergi Mükerrer Alınmış",
    description: "Muhasebeci aradı: fazla alınan ödeme geri yatacak. Kasa bir anda yüzünü güldürdü.",
    tone: "good",
    effects: { cash: 10000, energy: 3 }
  },
  {
    id: "auntie-reputation",
    title: "Mahalle Teyzesi Memnun Kaldı",
    description: "Sabırla ilgilendiğiniz müşteri bütün apartmana anlatmış. Bugün itibar bedavadan arttı.",
    tone: "good",
    effects: { reputation: 4, satisfaction: 3, energy: 2 }
  },
  {
    id: "pos-drama",
    title: "POS Cihazı Kısa Bir Tiyatro Yaptı",
    description: "Tam kuyruk varken POS nazlandı. Sorun çözüldü ama birkaç müşteri homurdandı.",
    tone: "bad",
    effects: { cash: -4500, satisfaction: -3, energy: -3 }
  },
  {
    id: "supplier-correction",
    title: "Depocu Yanlış Koliyi Düzeltti",
    description: "Eksik gelen koli bulundu. Depo güveni ve stok düzeni bugün küçük bir nefes aldı.",
    tone: "good",
    effects: { stockHealth: 5, supplierTrust: 3 }
  },
  {
    id: "expiry-alarm",
    title: "Miat Alarmı Öttü",
    description: "Arka rafta unutulan birkaç ürün fark edildi. Zarar küçük, ders büyük.",
    tone: "bad",
    effects: { cash: -7000, stockHealth: -4, complianceRisk: 3 }
  },
  {
    id: "rep-coffee",
    title: "Temsilci Kahveyi Güzel Getirdi",
    description: "Kampanya hâlâ pahalı ama personelin modu düzeldi. Bazen simülasyon da kahveyle yürür.",
    tone: "odd",
    effects: { staffMorale: 3, energy: 2 }
  },
  {
    id: "neighbor-doctor-rush",
    title: "Komşu Poliklinikte Yoğunluk",
    description: "Yakındaki poliklinik bugün doldu taştı. Reçete akışı arttı, ekip biraz gerildi.",
    tone: "odd",
    effects: { cash: 9000, sgkReceivable: 13000, energy: -5, staffMorale: -2 }
  }
];
