# Kırmızı Tabela Gameplay Test Ajanı Raporu

Bu rapor `npm run agent:gameplay` ile üretildi. Ajan 6 senaryoyu oyun motorunun gerçek fonksiyonlarıyla 120 gün oynadı.

## Özet

- Ortalama skor: 80/100
- Toplam satış / kaçan satış: 63398 / 181 (%0,3)
- Hedef skoru kaçıran senaryo: 0/6
- Kontrol edilen akışlar: sıfırdan açılış kilidi, depo vadesi, POS alacağı, SGK alacağı, personel görevi, raf odağı ve gün sonu skorları.

## Öncelikli Ürün Eksikleri

- Açılış görevleri çalışıyor ama oyuncuya seçim duygusu az veriyor; görevlerden bazıları alternatifli karar kartına dönmeli.
- Senaryo sonu ve lig tablosu daha belirgin olmalı; oyuncu eczacı adı, eczane, il/ilçe, net kar, borç ve kaçan satış kırılımını tek sonuç ekranında görmeli.
- Stok azaldığında 3D rafta ürün eksilmesi var, fakat kritik raf uyarısı daha dramatik olmalı.
- Depo alımı karar sayısı fazla büyüyor; kategori kategori satın alma yerine sepet, önerilen sipariş ve vade karşılaştırması tek ekranda toplanmalı.
- Personel sisteminde görev ataması etkili, ancak işe alım ihtiyacı ve kötü görev eşleşmesi daha sert geri bildirim vermeli.
- SGK/POS vadeleri motor seviyesinde doğru ayrışıyor; arayüzde takvim şeridi ve yaklaşan tahsilat/ödeme listesi daha görünür olmalı.

## Senaryo Detayları

### Mahallede Sıfırdan Açılış

- Başlangıç modu: new
- Oynanan süre: 120 gün
- Skor: 83/100 (hedef 68)
- Değerlendirme: Senaryo devam ediyor
- Kasa / borç / SGK / POS: ₺1.407.100 / ₺0 / ₺348.700 / ₺14.800
- Satış: 10339 adet, kaçan 0 adet (%0)
- Dip metrikler: kasa ₺234.700, stok 36/100, memnuniyet 82/100, enerji 0/100, SGK risk tepe 6/100
- Depo alımı: 480 sipariş (480 peşin, 0 vadeli)

**Ajan notları**
- Sıfırdan açılış görevleri doğru kilitli, fakat akış tamamen lineer; oyuncuya 2-3 gerçek seçim dalı eklenmeli.
- Stok sağlığı 36/100 seviyesine kadar düştü; kritik raflar sahnede ve aksiyon panelinde daha net kırmızıya dönmeli.
- Enerji 0/100 seviyesine indi; personel dinlendirme ve vardiya kararları daha erken önerilmeli.
- 480 depo siparişi oluştu; tek tek kategori alımı yerine haftalık sipariş sepeti ve minimum sipariş limiti tasarlanmalı.

### Borçlu Mahalle Eczanesini Kurtar

- Başlangıç modu: takeover
- Oynanan süre: 120 gün
- Skor: 77/100 (hedef 70)
- Değerlendirme: Senaryo devam ediyor
- Kasa / borç / SGK / POS: ₺389.600 / ₺125.800 / ₺341.000 / ₺13.400
- Satış: 10911 adet, kaçan 27 adet (%0,2)
- Dip metrikler: kasa ₺28.600, stok 0/100, memnuniyet 76/100, enerji 0/100, SGK risk tepe 22/100
- Depo alımı: 480 sipariş (61 peşin, 419 vadeli)

**Ajan notları**
- Stok sağlığı 0/100 seviyesine kadar düştü; kritik raflar sahnede ve aksiyon panelinde daha net kırmızıya dönmeli.
- Enerji 0/100 seviyesine indi; personel dinlendirme ve vardiya kararları daha erken önerilmeli.
- 480 depo siparişi oluştu; tek tek kategori alımı yerine haftalık sipariş sepeti ve minimum sipariş limiti tasarlanmalı.

### Hastane Yakını Yoğun Banko

- Başlangıç modu: takeover
- Oynanan süre: 120 gün
- Skor: 74/100 (hedef 66)
- Değerlendirme: Senaryo devam ediyor
- Kasa / borç / SGK / POS: ₺450.900 / ₺187.400 / ₺358.000 / ₺13.000
- Satış: 11008 adet, kaçan 154 adet (%1,4)
- Dip metrikler: kasa ₺112.400, stok 3/100, memnuniyet 57/100, enerji 0/100, SGK risk tepe 39/100
- Depo alımı: 480 sipariş (87 peşin, 393 vadeli)

**Ajan notları**
- Stok sağlığı 3/100 seviyesine kadar düştü; kritik raflar sahnede ve aksiyon panelinde daha net kırmızıya dönmeli.
- Enerji 0/100 seviyesine indi; personel dinlendirme ve vardiya kararları daha erken önerilmeli.
- 480 depo siparişi oluştu; tek tek kategori alımı yerine haftalık sipariş sepeti ve minimum sipariş limiti tasarlanmalı.

### Cadde Üstü Dermo Hamlesi

- Başlangıç modu: new
- Oynanan süre: 120 gün
- Skor: 82/100 (hedef 72)
- Değerlendirme: Senaryo devam ediyor
- Kasa / borç / SGK / POS: ₺1.425.400 / ₺0 / ₺315.900 / ₺13.400
- Satış: 10382 adet, kaçan 0 adet (%0)
- Dip metrikler: kasa ₺356.800, stok 34/100, memnuniyet 69/100, enerji 0/100, SGK risk tepe 6/100
- Depo alımı: 480 sipariş (480 peşin, 0 vadeli)

**Ajan notları**
- Sıfırdan açılış görevleri doğru kilitli, fakat akış tamamen lineer; oyuncuya 2-3 gerçek seçim dalı eklenmeli.
- Stok sağlığı 34/100 seviyesine kadar düştü; kritik raflar sahnede ve aksiyon panelinde daha net kırmızıya dönmeli.
- Enerji 0/100 seviyesine indi; personel dinlendirme ve vardiya kararları daha erken önerilmeli.
- 480 depo siparişi oluştu; tek tek kategori alımı yerine haftalık sipariş sepeti ve minimum sipariş limiti tasarlanmalı.

### İlçe Eczanesinde Nöbet Yükü

- Başlangıç modu: takeover
- Oynanan süre: 120 gün
- Skor: 82/100 (hedef 68)
- Değerlendirme: Senaryo devam ediyor
- Kasa / borç / SGK / POS: ₺525.600 / ₺0 / ₺341.600 / ₺13.700
- Satış: 10703 adet, kaçan 0 adet (%0)
- Dip metrikler: kasa ₺27.800, stok 25/100, memnuniyet 84/100, enerji 0/100, SGK risk tepe 26/100
- Depo alımı: 480 sipariş (160 peşin, 320 vadeli)

**Ajan notları**
- Stok sağlığı 25/100 seviyesine kadar düştü; kritik raflar sahnede ve aksiyon panelinde daha net kırmızıya dönmeli.
- Enerji 0/100 seviyesine indi; personel dinlendirme ve vardiya kararları daha erken önerilmeli.
- 480 depo siparişi oluştu; tek tek kategori alımı yerine haftalık sipariş sepeti ve minimum sipariş limiti tasarlanmalı.

### Turistik Bölgede Sezon Oyunu

- Başlangıç modu: new
- Oynanan süre: 120 gün
- Skor: 82/100 (hedef 70)
- Değerlendirme: Senaryo devam ediyor
- Kasa / borç / SGK / POS: ₺1.341.900 / ₺0 / ₺299.000 / ₺13.500
- Satış: 10055 adet, kaçan 0 adet (%0)
- Dip metrikler: kasa ₺265.100, stok 35/100, memnuniyet 65/100, enerji 0/100, SGK risk tepe 6/100
- Depo alımı: 480 sipariş (480 peşin, 0 vadeli)

**Ajan notları**
- Sıfırdan açılış görevleri doğru kilitli, fakat akış tamamen lineer; oyuncuya 2-3 gerçek seçim dalı eklenmeli.
- Stok sağlığı 35/100 seviyesine kadar düştü; kritik raflar sahnede ve aksiyon panelinde daha net kırmızıya dönmeli.
- Enerji 0/100 seviyesine indi; personel dinlendirme ve vardiya kararları daha erken önerilmeli.
- 480 depo siparişi oluştu; tek tek kategori alımı yerine haftalık sipariş sepeti ve minimum sipariş limiti tasarlanmalı.
