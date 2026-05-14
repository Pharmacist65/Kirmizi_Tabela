export const sgkCalendarRules = [
  {
    id: "invoice-window",
    range: "1-7",
    title: "SGK fatura dönemi",
    description: "Reçete dosyaları kontrol edilir, fatura kesimi hazırlanır.",
    gameRisk: "Kontrol zayıfsa ileride kesinti veya teslim stresi doğar."
  },
  {
    id: "delivery-window",
    range: "7-15",
    title: "SGK teslim dönemi",
    description: "Dosyalar teslim edilir; örnekleme ve evrak düzeni önem kazanır.",
    gameRisk: "Eksik evrak memnuniyetten çok uyum riskini vurur."
  },
  {
    id: "payment-day",
    range: "15",
    title: "SGK ödeme günü",
    description: "Oyunda SGK tahsilatı ayın 15'i etrafında beklenir.",
    gameRisk: "Depo senedi/çek tarihi genelde bu beklentiye göre planlanır."
  },
  {
    id: "waiting-window",
    range: "16-30",
    title: "Bekleme ve düzeltme dönemi",
    description: "Geçmiş dönem kesintileri, itirazlar ve depo vadesi baskısı öne çıkar.",
    gameRisk: "Eski dosyadan gelen kesinti oyuncuyu beklenmedik yakalayabilir."
  }
];

export const prescriptionGroups = [
  {
    id: "e-prescription",
    name: "E-reçete",
    volume: "Yüksek",
    risk: "Orta",
    note: "Hız ve provizyon takibi oyunun ana reçete akışını oluşturur."
  },
  {
    id: "manual",
    name: "Manuel reçete",
    volume: "Düşük",
    risk: "Yüksek",
    note: "Evrak hatası ve kontrol yükü nedeniyle uyum riskini artırır."
  },
  {
    id: "magistral",
    name: "Majistral",
    volume: "Düşük",
    risk: "Yüksek",
    note: "Hazırlama zamanı, maliyet ve reçete kontrolü ayrı ele alınır."
  },
  {
    id: "colored",
    name: "Renkli reçete",
    volume: "Düşük",
    risk: "Kritik",
    note: "Oyunda özel dikkat ve kayıt skoru olarak soyutlanır."
  },
  {
    id: "abc",
    name: "A/B/C grupları",
    volume: "Orta",
    risk: "Orta",
    note: "Dosyalama ve dönem takibi için ayrı grup olarak görünür."
  },
  {
    id: "foreign",
    name: "Yurt dışı grup",
    volume: "Düşük",
    risk: "Yüksek",
    note: "Teslim ve ödeme takibi farklı olduğu için oyuncunun dikkatini ister."
  },
  {
    id: "private-insurance",
    name: "Özel sigorta",
    volume: "Değişken",
    risk: "Orta",
    note: "SGK dışı alacak ve mutabakat süresi yaratır."
  }
];

export const paymentChannels = [
  {
    id: "cash",
    name: "Nakit / elden",
    speed: "Anında",
    pressure: "Düşük",
    note: "Kasa rahatlatır ama her eczanede oranı lokasyona bağlıdır."
  },
  {
    id: "pos",
    name: "POS",
    speed: "Kısa vadeli",
    pressure: "Komisyon",
    note: "Banka oranı düşükse kârlılık artar; yüksekse küçük küçük yer."
  },
  {
    id: "sgk",
    name: "SGK",
    speed: "Gecikmeli",
    pressure: "Dosya/kesinti",
    note: "Ciroyu büyütür ama nakit akışını bekletir."
  },
  {
    id: "private",
    name: "Özel sigorta",
    speed: "Değişken",
    pressure: "Mutabakat",
    note: "Takip edilmezse alacak yaşlanır."
  }
];

export const supplierTermPatterns = [
  "SGK 15'inde yatar beklentisiyle 15'ine senet",
  "Daha güvenli olsun diye 17'sine çek",
  "Yüksek ciroya özel vade esnetme",
  "Kampanyalı ürün için kısa vade baskısı",
  "Güven bozulursa peşin/çok kısa vade"
];

export const pharmacyComplaintSeeds = [
  "Rakip eczacı vitrindeki yazı fontunu bile şikayet etmiş.",
  "Komşu apartman klima dış ünitesi yüzünden ilçe sağlığa kadar gitmiş.",
  "Bir müşteri emanet ilaç alamayınca bütün mahalle grubuna yazmış.",
  "Nöbette kuyruk dışarı taştı diye rakip 'düzen bozuyor' demiş.",
  "Dermo standı fazla parlak diye reklam şikayeti gelmiş."
];
