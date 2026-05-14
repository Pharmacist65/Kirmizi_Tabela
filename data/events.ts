import type { EventTemplate } from "@/game/types";

export const eventTemplates: EventTemplate[] = [
  {
    id: "supplier-due-pressure",
    title: "Depo Vadesi Kapıya Dayandı",
    category: "supplier",
    description:
      "Ana deponun ödemesi yaklaşıyor. Kasa rahat değil, SGK alacağı ise birkaç gün sonra bekleniyor.",
    trigger: (state) => state.debt > 180000,
    choices: [
      {
        label: "Depoyla vade uzatmayı dene",
        detail: "Kasa korunur, güven biraz yıpranır.",
        effects: { supplierTrust: -7, complianceRisk: 2, energy: -4 }
      },
      {
        label: "Dermo stoklarından hızlı kampanya çıkar",
        detail: "Nakit girer ama raf dengesi bozulabilir.",
        effects: { cash: 26000, stockHealth: -5, satisfaction: 2, dermoPotential: -3 }
      },
      {
        label: "Kısa vadeli finansman kullan",
        detail: "Bugün nefes alırsın, toplam borç büyür.",
        effects: { cash: 50000, debt: 57000, energy: -2 }
      }
    ]
  },
  {
    id: "chronic-patient-out-of-stock",
    title: "Raporlu Hasta İlacını Bekliyor",
    category: "customer",
    description:
      "Uzun süredir gelen bir hasta, düzenli kullandığı ürün grubunu soruyor. Stokta az kaldı.",
    trigger: (state) => state.stockHealth < 70,
    choices: [
      {
        label: "Acil depo siparişi aç",
        detail: "Memnuniyet artar, nakit biraz sıkışır.",
        effects: { cash: -14000, stockHealth: 8, satisfaction: 5, reputation: 3 }
      },
      {
        label: "Personeli bilgilendirip bekleme listesi oluştur",
        detail: "Daha ucuz ama iletişim kalitesi belirleyici olur.",
        effects: { staffMorale: 2, satisfaction: 1, energy: -1 }
      },
      {
        label: "Raf önceliğini kronik hasta ürünlerine kaydır",
        detail: "Dermo ivmesi azalır, güvenli hizmet güçlenir.",
        effects: { stockHealth: 5, dermoPotential: -2, reputation: 4 }
      }
    ]
  },
  {
    id: "staff-fatigue",
    title: "Personel Bugün Gergin",
    category: "staff",
    description:
      "Kuyruk uzadı, kasa tarafında küçük bir tartışma çıktı. Ekip senden net görev dağılımı bekliyor.",
    trigger: (state) => state.staffMorale < 72 || state.energy < 65,
    choices: [
      {
        label: "Görevleri yeniden dağıt",
        detail: "Hizmet hızı toparlanır, sen biraz yorulursun.",
        effects: { staffMorale: 5, satisfaction: 2, energy: -5 }
      },
      {
        label: "Kısa mola ve sıcak devir toplantısı yap",
        detail: "Ciro temposu düşer ama hata riski azalır.",
        effects: { staffMorale: 8, complianceRisk: -3, cash: -3500 }
      },
      {
        label: "Dermo primini bugüne özel aç",
        detail: "Motivasyon artar, maliyet yazılır.",
        effects: { staffMorale: 6, dermoPotential: 3, cash: -5000 }
      }
    ]
  },
  {
    id: "sgk-file-check",
    title: "SGK Dosyası Kontrol İstiyor",
    category: "sgk",
    description:
      "Ay sonuna yaklaşırken reçete kontrol listesinde eksik görünen kalemler var. Hız mı, dikkat mi?",
    trigger: (state) => state.currentDay % 30 > 20 || state.complianceRisk > 28,
    choices: [
      {
        label: "Bugünü kontrol gününe çevir",
        detail: "Ciro kaçabilir ama kesinti riski düşer.",
        effects: { complianceRisk: -8, cash: -6500, energy: -3 }
      },
      {
        label: "SGK sorumlusuna tam yetki ver",
        detail: "Ekip sahiplenir; moral ve düzen artar.",
        effects: { complianceRisk: -5, staffMorale: 4, energy: 2 }
      },
      {
        label: "Satış temposunu koru",
        detail: "Bugünkü kasa iyi gelir, risk birikir.",
        effects: { cash: 12000, complianceRisk: 7, satisfaction: -1 }
      }
    ]
  },
  {
    id: "dermo-representative",
    title: "Dermo Temsilcisi Geldi",
    category: "dermo",
    description:
      "Yeni bir kampanya paketi öneriliyor. Alırsan raf daha güçlü görünür, ama toplu alım kasayı zorlar.",
    trigger: (state) => state.dermoPotential < 70,
    choices: [
      {
        label: "Küçük eğitim paketi al",
        detail: "Personel bilgisi artar, risk düşük kalır.",
        effects: { dermoPotential: 5, staffMorale: 3, cash: -8000 }
      },
      {
        label: "Toplu kampanyaya gir",
        detail: "Potansiyel yüksek, vade baskısı da yüksek.",
        effects: { dermoPotential: 11, stockHealth: 3, debt: 28000, cash: -6000 }
      },
      {
        label: "Şimdilik vitrin düzeniyle yetin",
        detail: "Ucuz hamle; etkisi sınırlı.",
        effects: { dermoPotential: 2, reputation: 1, energy: -1 }
      }
    ]
  },
  {
    id: "night-shift-warning",
    title: "Nöbet Listesi Açıklandı",
    category: "night-shift",
    description:
      "Bu hafta nöbet var. Hazırlık iyi yapılırsa ciro ve itibar artar; yapılmazsa enerji erir.",
    trigger: (state) => state.currentDay % 14 === 0,
    choices: [
      {
        label: "Nöbet öncesi stok hazırlığı yap",
        detail: "Kasa çıkar, stok ve itibar güçlenir.",
        effects: { cash: -18000, stockHealth: 10, reputation: 5 }
      },
      {
        label: "Ek personel desteği ayarla",
        detail: "Maliyetli ama ekip ayakta kalır.",
        effects: { cash: -9000, staffMorale: 7, energy: 4, satisfaction: 2 }
      },
      {
        label: "Mevcut düzenle idare et",
        detail: "Bugün ucuz, gece pahalı olabilir.",
        effects: { cash: 5000, energy: -8, satisfaction: -3 }
      }
    ]
  },
  {
    id: "otc-season",
    title: "Sezonluk OTC Talebi Arttı",
    category: "stock",
    description:
      "Hava değişimiyle destek ürünleri ve OTC kategorileri sorulmaya başladı. Raf kararın bugünü etkiler.",
    choices: [
      {
        label: "OTC rafını güçlendir",
        detail: "Kârlı satış ihtimali artar.",
        effects: { cash: -10000, otcPotential: 7, stockHealth: 4 }
      },
      {
        label: "Personeli danışmanlık dilinde eğit",
        detail: "Satıştan çok güvene yatırım.",
        effects: { otcPotential: 4, satisfaction: 3, staffMorale: 2, energy: -3 }
      },
      {
        label: "Sadece hızlı dönenleri takip et",
        detail: "Daha kontrollü, daha sınırlı büyüme.",
        effects: { cash: 4000, stockHealth: 2, otcPotential: 1 }
      }
    ]
  },
  {
    id: "difficult-customer",
    title: "Zor Müşteri Bankoda",
    category: "customer",
    description:
      "Bir müşteri fiyat ve bekleme süresi yüzünden yükseldi. Ekip senin tavrına bakıyor.",
    choices: [
      {
        label: "Sakin açıklamayla olayı üstlen",
        detail: "İtibar korunur, enerji düşer.",
        effects: { satisfaction: 4, reputation: 2, energy: -7 }
      },
      {
        label: "Tecrübeli personele devret",
        detail: "Sen korunursun, sonuç moral durumuna bağlı.",
        effects: { energy: 2, staffMorale: -2, satisfaction: 1 }
      },
      {
        label: "Sistemde bekleme önceliği düzenle",
        detail: "Kuyruk akışı iyileşir, kısa süreli karmaşa olur.",
        effects: { satisfaction: 3, complianceRisk: -1, cash: -2500 }
      }
    ]
  },
  {
    id: "old-sgk-cut",
    title: "Geçmiş Dosyadan Kesinti",
    category: "sgk",
    description:
      "Aylar önceki kontrolden küçük ama sinir bozucu bir kesinti bildirimi geldi. Eczacı hafızası bunu unutmaz.",
    trigger: (state) => state.month > 2 || state.complianceRisk > 35,
    choices: [
      {
        label: "İtiraz dosyasını hazırla",
        detail: "Enerji gider, kesinti riski azalır.",
        effects: { energy: -5, complianceRisk: -5, sgkReceivable: -3000 }
      },
      {
        label: "Kesintiyi kabullen, bugüne odaklan",
        detail: "Zaman kalır ama para gider.",
        effects: { sgkReceivable: -10000, energy: 1 }
      },
      {
        label: "SGK sorumlusuna kontrol listesi aç",
        detail: "Sistem düzelir, moral biraz gerilir.",
        effects: { complianceRisk: -7, staffMorale: -2, cash: -2500 }
      }
    ]
  },
  {
    id: "emanet-request",
    title: "Hasta Emanet İlaç İstiyor",
    category: "customer",
    description:
      "Mahalleden tanıdık bir hasta 'yarın getireceğim' diyerek emanet ürün istiyor. İlişki ve risk karşı karşıya.",
    choices: [
      {
        label: "Kibarca net politika uygula",
        detail: "Risk azalır, hasta tepkisi yönetilmeli.",
        effects: { complianceRisk: -4, satisfaction: -1, reputation: 1 }
      },
      {
        label: "Personeli açıklama dilinde destekle",
        detail: "Enerji gider, memnuniyet korunur.",
        effects: { energy: -3, satisfaction: 3, complianceRisk: -2 }
      },
      {
        label: "Bugünlük idare et",
        detail: "Memnuniyet artar ama risk birikir.",
        effects: { satisfaction: 4, complianceRisk: 7, reputation: 2 }
      }
    ]
  },
  {
    id: "district-health-complaint",
    title: "İlçe Sağlığa Tuhaf Şikayet",
    category: "compliance",
    description:
      "Rakiplerden biri vitrin düzenini fazla iddialı bulmuş. Şikayet komik ama denetim ciddidir.",
    trigger: (state) => state.dermoPotential > 62 || state.reputation > 70,
    choices: [
      {
        label: "Vitrini mesleki sınıra çek",
        detail: "Dermo ivmesi azalır, risk düşer.",
        effects: { dermoPotential: -3, complianceRisk: -6, reputation: 1 }
      },
      {
        label: "Odaya danışıp yazılı ilerle",
        detail: "Zaman ve enerji harcanır, güvenli olur.",
        effects: { energy: -4, complianceRisk: -8, supplierTrust: 1 }
      },
      {
        label: "Hiç bozma, gelen gelsin",
        detail: "Satış havası korunur ama risk büyür.",
        effects: { dermoPotential: 3, complianceRisk: 9, reputation: -2 }
      }
    ]
  },
  {
    id: "pos-rate-call",
    title: "Banka POS Oranını Hatırlattı",
    category: "finance",
    description:
      "Kartlı satış artınca POS komisyonu küçük küçük kârı kemirmeye başladı. Banka temsilcisi görüşmeye açık.",
    choices: [
      {
        label: "Oran pazarlığı yap",
        detail: "Enerji gider, nakit kalitesi artar.",
        effects: { cash: 7000, energy: -3, reputation: 1 }
      },
      {
        label: "Peşin kampanya dilini güçlendir",
        detail: "Kasa rahatlar, memnuniyet hassaslaşır.",
        effects: { cash: 9000, satisfaction: -2, otcPotential: 2 }
      },
      {
        label: "Şimdilik akışa bırak",
        detail: "Uğraşmazsın ama komisyon sürer.",
        effects: { cash: -3500, energy: 1 }
      }
    ]
  },
  {
    id: "special-insurance-delay",
    title: "Özel Sigorta Mutabakatı Bekliyor",
    category: "finance",
    description:
      "Özel sigorta dosyalarında birkaç kalem beklemede. SGK değil ama nakit akışında o da can yakar.",
    choices: [
      {
        label: "Dosyayı bugün kapat",
        detail: "Enerji gider, tahsilat hızlanır.",
        effects: { cash: 12000, energy: -4, complianceRisk: -2 }
      },
      {
        label: "Personelden takip listesi iste",
        detail: "Daha dengeli ama yavaş.",
        effects: { cash: 6000, staffMorale: -1, complianceRisk: -1 }
      },
      {
        label: "Ay sonuna bırak",
        detail: "Bugün rahat, alacak yaşlanır.",
        effects: { energy: 2, cash: -4000 }
      }
    ]
  }
];
