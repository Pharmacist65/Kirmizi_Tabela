# Kırmızı Tabela Reboot: Playtest ve Oyun Akışı

## Kendi Oynayış Testi Bulgusu

17:12 civarında mevcut sürümü sıfırdan başlatıp oyuncu gibi denedim:

- Yeni oyun başlatınca sahne var ama oyuncu hedefi sahneden okuyamıyor.
- Eczaneye girince gerçek bir iç mekan oynanışı değil, raf/panel görünümünün üstüne karakter bindirilmiş hali çıkıyor.
- Karakter duvar, kapı, banko, raf gibi şeylerle anlamlı çarpışmıyor; eczanenin içinden geçme hissi veriyor.
- Tıklanan kişi/kart oyuncuya yeni bir oyun durumu açmıyor; sadece “ilgili modülü aç” mantığıyla dashboard’a dönüyor.
- Depo, SGK, POS ve raf sistemleri motor tarafında var ama karakterin dünyada yaptığı hareketlerle bağlanmıyor.
- Sonuç: Şu an oyun, “karakterli dashboard” gibi; playable adventure/tycoon değil.

## Silinecek veya Runtime’dan Çıkarılacak Yaklaşım

- Sürekli açık sağ modül paneli.
- Kişiye/nesneye tıklayınca çıkan bilgi kartları.
- İçeride ve dışarıda aynı mantıkla duran sahte rota oyunculuğu.
- Oyuncunun sadece butonla “gün atladığı” ana akış.
- Final kalite gibi gösterilen primitive/block avatarlar.

Bu parçalar motor verisi olarak kalabilir ama ana oynanış yüzü olmayacak.

## Yeni Ana Oyun Fantezisi

Oyuncu bir eczacıdır. Eczane bir dashboard değil, içinde yürünebilen ve işletilen bir mekandır.

Oyuncu şunları fiziksel olarak yapar:

1. Sokakta eczaneye, depoya, SGK kurumuna, bankaya ve eczacı odasına gider.
2. Eczane kapısından içeri girer.
3. Bankoda hasta karşılar.
4. Raflardan ürün seçer veya eksik raf görür.
5. Depo odasında gelen koliyi açar.
6. Açılan ürünleri raflara dizer.
7. POS noktasında kart tahsilatını bekleyen POS alacağına yazar.
8. SGK masasında reçete dosyası kontrol eder.
9. Gün 08:30’dan 19:00’a aksiyonlarla ilerler.
10. Gün sonu raporunda satış, kaçan hasta, POS alacağı, SGK alacağı, depo borcu ve XP çıkar.

## Oyun Döngüsü

### 1. Karakter ve Senaryo

- Oyuncu eczacı avatarını seçer.
- Senaryo seçer: sıfırdan açılış, devralma, kriz.
- İl/ilçe/lokasyon seçimi dünya temasını belirler: mahalle, hastane, cadde, AVM, turistik bölge.

### 2. Dünya Haritası

- Küçük gezegen/mahalle parçası vardır.
- Eczane, ecza deposu, SGK, banka, eczacı odası ayrı binalardır.
- Oyuncu sadece tıklamaz; karakterle yürür ve kapı/nesne yanına gelince etkileşir.

### 3. Eczane İçi

Temel istasyonlar:

- Banko: hasta karşılama ve satış.
- Raf: ürün bulunurluğu, eksik raf, raf dizimi.
- Depo odası: gelen koli, koli açma, rafa alma.
- SGK masası: reçete dosyası, kontrol, kesinti riski.
- POS noktası: anlık kasa değil, POS alacağı.
- Personel noktası: görev atama, moral, hız.

### 4. Aksiyon Mantığı

Her aksiyon:

- Oyun saatini ilerletir.
- Bir metriği değiştirir.
- Görsel sahnede bir şey değiştirir.
- Log’a düşer.
- Sonraki hedefi açar.

Örnek:

- “Koliyi aç” → 15 dk geçer, ürün listesi görünür, kutu açılır.
- “Rafa diz” → stok artar, raf görseli dolar.
- “Hastayı karşıla” → stok düşer, kasa/POS/SGK alacağı oluşur.
- “SGK dosyası kontrol et” → enerji düşer, uyum riski azalır.

## İlk Dikey Kesit Kabul Kriterleri

- Karakter sokakta yürür.
- Eczane kapısından fiziksel hotspot ile içeri girilir.
- İçeride duvar/banko hissi korunur; oyuncu sadece geçip gitmez.
- Banko, raf, depo odası, POS ve SGK masası ayrı etkileşim noktalarıdır.
- Bir koli sipariş edilip açılır ve rafa dizilir.
- En az 3 hasta hizmet alır.
- Gün sonu raporu oluşur.
- Dashboard paneli ana oyun değildir; sadece “telefon/tablet” gibi ikincil ekran olur.

## Asset Planı

Final kalite için primitive avatar yeterli değildir.

Gerçek asset hattı:

1. GLB/VRM karakter formatı ana format olacak.
2. Avatar parçaları ayrı slotlarla yüklenecek: saç, üst, alt, ayakkabı, maske, çanta.
3. Geçici blok karakterler sadece mekanik testte kalacak.
4. Lisanslı veya kendi üretilmiş asset dışında repo’ya model girmeyecek.
5. Eczane raf/ürün assetleri için marka ürünleri ilaç dışı kategorilerde kullanılacak; ilaçlar etken madde/generic kutu olarak kalacak.

## İlk Kod Hedefi

Mevcut ana ekran, yeni `RebootGame` dikey kesitiyle değiştirilecek:

- Başlangıç: senaryo + avatar seçimi.
- Oynanış: tam ekran üçüncü şahıs sahne.
- HUD: sadece işletme metrikleri ve aktif hedef.
- Etkileşim: yakındaki nesne + tek aksiyon butonu.
- Eski modüller: runtime’dan çıkarılacak.
