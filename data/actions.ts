import type { StrategicAction } from "@/game/types";

export const strategicActions: StrategicAction[] = [
  {
    id: "none",
    title: "Normal Gün",
    description: "Ekstra hamle yapmadan günlük akışı koru.",
    bestFor: "Denge bozulmadığında",
    effects: {}
  },
  {
    id: "rx-stock",
    title: "Reçete Stok Siparişi",
    description: "Kronik hasta ve reçeteli ürün gruplarını güçlendir.",
    bestFor: "Stok düşük, reçete baskısı yüksek",
    effects: { cash: -22000, stockHealth: 9, satisfaction: 3, sgkReceivable: 6000 }
  },
  {
    id: "dermo-push",
    title: "Dermo Raf Atağı",
    description: "Vitrin ve dermo rafını parlat, peşin satış şansını artır.",
    bestFor: "Cadde/turistik lokasyon",
    effects: { cash: -16000, dermoPotential: 8, reputation: 2, stockHealth: -2 }
  },
  {
    id: "supplier-term",
    title: "Depo Vade Görüşmesi",
    description: "Depoyla güveni zorlamadan ödeme takvimini rahatlatmaya çalış.",
    bestFor: "Borç ve vade baskısı",
    effects: { debt: -12000, supplierTrust: -2, energy: -3 }
  },
  {
    id: "sgk-audit",
    title: "SGK Dosya Kontrolü",
    description: "Reçete ve dosya kontrolüne zaman ayır, kesinti riskini azalt.",
    bestFor: "Uyum riski yükselince",
    effects: { complianceRisk: -8, energy: -4, cash: -4500 }
  },
  {
    id: "staff-shift",
    title: "Vardiya ve Banko Planı",
    description: "Ekibin görevlerini yeniden dağıt, kuyruk ve moral baskısını azalt.",
    bestFor: "Yoğun trafik ve düşük moral",
    effects: { staffMorale: 7, satisfaction: 3, energy: -2, cash: -3500 }
  },
  {
    id: "cash-discipline",
    title: "Nakit Disiplini",
    description: "Zorunlu olmayan alımları kıs, kısa vadeli kasa güvenliği yarat.",
    bestFor: "Kasa kritik seviyedeyken",
    effects: { cash: 12000, stockHealth: -3, satisfaction: -1, energy: -1 }
  },
  {
    id: "rest-delegate",
    title: "Delege Et ve Toparlan",
    description: "Eczacı enerjisini korumak için işleri ekibe devret.",
    bestFor: "Enerji düşünce",
    effects: { energy: 10, staffMorale: 2, cash: -6000, complianceRisk: 2 }
  },
  {
    id: "pos-bargain",
    title: "Banka POS Pazarlığı",
    description: "POS komisyonu için banka temsilcisiyle görüş, oran baskısını azaltmaya çalış.",
    bestFor: "Kartlı satış oranı yüksekse",
    effects: { cash: 4500, energy: -2, reputation: 1 }
  },
  {
    id: "private-insurance-check",
    title: "Özel Sigorta Mutabakatı",
    description: "Özel sigorta alacaklarını kontrol et, bekleyen ödemeyi hızlandır.",
    bestFor: "Özel sigorta alacağı birikince",
    effects: { cash: 9000, energy: -3, complianceRisk: -2 }
  },
  {
    id: "emanet-policy",
    title: "Emanet İlaç Politikası",
    description: "Emanet taleplerinde net ama kırmadan ilerleyen bir iletişim dili kur.",
    bestFor: "Mahalle sadakati ve risk dengesi",
    effects: { satisfaction: 3, reputation: 2, complianceRisk: -3, energy: -2 }
  }
];
