# Kırmızı Tabela Oynanış Tasarımı

## Oyun Türü

Kırmızı Tabela, Türkiye'deki serbest eczane işleyişini temel alan bir **eczane tycoon / operasyon simülasyonu**dur. Oyuncu eczacı rolündedir. Amaç sadece ciro yapmak değil; nakit akışını, SGK alacağını, depo vadesini, reçete riskini, personeli, rafları, müşteri memnuniyetini ve eczacı enerjisini birlikte yönetmektir.

## Oyun Süresi

Ana mod gerçek zamanlı 12 ay değildir. Oyun içi günler tıklamayla ilerler.

- Hızlı oynanış: 30-60 dakika içinde bir senaryo bitirilebilir.
- Detaylı kariyer: 2-4 saatlik oturumda 12 oyun ayı oynanabilir.
- Uzun kariyer: Sezonlar, yeni lokasyonlar ve eczane geliştirmeleri eklenirse 10+ saatlik ilerleme olur.
- Günlük mobil mod ileride ayrı açılabilir: her gerçek gün 1 oyun günü.

## Ana Döngü

1. Oyuncu senaryo seçer.
2. Sıfırdan kurma modunda açılış görevlerini başlatır.
3. Oyuncu günlük ana hamleyi seçer.
4. Oyuncu raf/banko odağını seçer.
5. Oyuncu depo/stok/personel/SGK ekranlarında gerekirse işlem yapar.
6. Günün olay kartı gelir.
7. Oyuncu olay kartında karar verir.
8. Kapalı sürpriz açılır.
9. Gün sonu raporu çıkar.
10. Oyun günü ilerler.
11. Haftalık ve aylık sistemler çalışır.

## Zamanlı Görevler

Zamanlı görevler oyunun gerçekçi tarafını verir ama oyuncuyu kilitlememelidir.

Doğru kullanım:

- Ruhsat evraklarını topla: 2 saat.
- Kira/kroki ve yerleşim: 3 saat.
- Eczacı odası başvurusu: 4 saat.
- Depo ön anlaşması: 1,5 saat.
- Tabela ve mimari kurulum: 6 saat.
- İlk stok ve raf açılışı: 4 saat.

Bu süreler gerçek oyunda arka planda akar. Oyuncu beklerken başka işleri planlar. MVP/demo sürümünde süreler saniyelere ölçeklenir. Sadece "bas ve bekle" oyunu sıkıcıdır; iyi tasarım, aynı anda birden fazla dosyayı yönetme hissi vermelidir.

## Başlangıç Senaryoları

Senaryolar oyunun zorluk ve ritmini belirler.

- Mahallede Sıfırdan Açılış: öğretici, düşük kira, orta reçete baskısı.
- Borçlu Mahalle Eczanesini Kurtar: nakit sıkışık, sadık müşteri, depo borcu baskılı.
- Hastane Yakını Yoğun Banko: yüksek reçete, yüksek SGK alacağı, yüksek hata riski.
- Cadde Üstü Dermo Hamlesi: yüksek kira, güçlü OTC/dermo potansiyeli, peşin kasa oyunu.
- İlçe Eczanesinde Nöbet Yükü: düşük rekabet, tedarik ve nöbet stresi.
- Turistik Bölgede Sezon Oyunu: sezonluk patlama, kış durgunluğu, raf zamanlaması.

## Günlük Ana Hamleler

Oyuncu her oyun günü bir ana hamle seçer.

- Reçete Stok Siparişi: stok ve memnuniyet artar, kasa düşer, SGK alacağı büyüyebilir.
- Dermo Raf Atağı: peşin satış potansiyeli artar, stok ve vade riski büyüyebilir.
- Depo Vade Görüşmesi: borç baskısı azalabilir, depo güveni ve enerji etkilenir.
- SGK Dosya Kontrolü: uyum riski düşer, günlük tempo ve enerji azalır.
- Vardiya ve Banko Planı: personel morali ve memnuniyet artar, küçük maliyet doğar.
- Nakit Disiplini: kasa korunur, stok/memnuniyet riske girebilir.
- Delege Et ve Toparlan: enerji artar, maliyet ve kontrol riski doğabilir.
- Banka POS Pazarlığı: kart komisyonu baskısı azalır.
- Özel Sigorta Mutabakatı: bekleyen alacak daha hızlı kasaya döner.
- Emanet İlaç Politikası: memnuniyet ve uyum riski arasında denge kurar.

## Raf ve Banko Odağı

Raf düzeni sadece görsel değildir; satış kırılımını etkiler.

- Dengeli Düzen: güvenli ama patlayıcı olmayan oyun.
- Reçete Hızı: reçete akışı ve SGK alacağı artar, peşin kasa yavaşlayabilir.
- Dermo Vitrini: peşin kasa ve marj artar, stok/vade baskısı büyür.
- OTC Hızlı Raf: hızlı dönen ürünlerle günlük nakit artar.
- Akış & Banko: kuyruk, enerji ve memnuniyet toparlanır; operasyon maliyeti vardır.

## SGK Takvimi

Her oyun ayı 30 gündür.

- Gün 1-7: reçete kontrolü ve fatura hazırlığı.
- Gün 7-15: SGK teslim dönemi.
- Gün 15 civarı: SGK ödeme beklentisi.
- Gün 16-30: kesinti, düzeltme, depo vadesi ve nakit baskısı.

Oyuncu 1-7 arasında kontrol yapmazsa ileride kesinti, teslim stresi veya uyum riski görebilir. SGK alacağı ciroyu büyütür ama kasaya geç girer.

## Reçete Grupları

Reçete grupları operasyon riskini ve iş yükünü değiştirir.

- E-reçete: ana hacim, orta risk.
- Manuel reçete: düşük hacim, yüksek evrak riski.
- Majistral: hazırlama zamanı ve kontrol yükü.
- Renkli reçete: özel dikkat ve kayıt riski.
- A/B/C grupları: dosya ayrımı ve teslim disiplini.
- Yurt dışı grup: ödeme/teslim takibi farklı.
- Özel sigorta: SGK dışı alacak ve mutabakat süresi.

## Para Akışı

Oyunda para tek havuz değildir.

- Elden/nakit satış: kasaya anında girer.
- POS: kasaya kısa vadede girer ama komisyon keser.
- SGK: alacak oluşturur, geç yatar.
- Özel sigorta: ayrı alacak oluşturur, mutabakat ister.
- Depo borcu: vade günü gelince kasayı zorlar.
- Kira/maaş/gider: ay sonu sabit baskı yaratır.

## Puan Sistemi

Başarı puanı tek başına ciro değildir.

Puanı artıranlar:

- Kasa sağlığı
- Borç kontrolü
- Müşteri memnuniyeti
- Stok sağlığı
- Personel morali
- Eczacı enerjisi
- Düşük uyum riski
- Depo güveni
- İtibar
- OTC/dermo potansiyelini doğru kullanmak

Puanı düşürenler:

- Depo borcunun şişmesi
- SGK kesinti riski
- Stok yokluğu veya fazla stok
- Eczacı enerjisinin tükenmesi
- Personel moralinin düşmesi
- Hasta/müşteri memnuniyetsizliği
- İlçe sağlık/şikayet olaylarının kötü yönetilmesi

## Level Sistemi

Level, eczanenin işletme olgunluğunu gösterir.

- Level 1: Açılış ve temel stok.
- Level 2: SGK dosya disiplini açılır.
- Level 3: Personel görev dağılımı açılır.
- Level 4: Dermo/OTC bayilik anlaşmaları açılır.
- Level 5: Depo vade pazarlığı güçlenir.
- Level 6: Mimari yatırım ve banko düzeni açılır.
- Level 7: Özel sigorta ve kurumsal hasta takibi açılır.
- Level 8: Nöbet optimizasyonu açılır.
- Level 9: Rakip eczane hamleleri belirginleşir.
- Level 10: İkinci eczane değil, prestij/kariyer sezonu açılır.

Level; başarı puanı, aylık ciro, düşük kesinti, yüksek memnuniyet ve görev tamamlamayla artar. Türkiye gerçekliğinde eczacı birden fazla serbest eczane sahibi gibi kurgulanmamalı; büyüme eczane kalitesi, itibar, sistem ve prestij üzerinden olmalı.

## Kazanma ve Kaybetme

Senaryo kazanma:

- Hedef kasa tutar.
- Depo borcu hedefin altında kalır.
- Memnuniyet ve stok sağlığı hedefi geçer.
- Enerji tamamen bitmez.
- Uyum riski kritik seviyeye çıkmaz.
- Başarı puanı hedefi geçer.

Kaybetme:

- Depo borcu sürdürülemez hale gelir.
- Uyum riski kritik seviyeye çıkar.
- Müşteri memnuniyeti çöker.
- Enerji tükenir.
- Depo güveni kaybedilir.
- 12 oyun ayı sonunda hedefler tutmaz.

## Eğlence Tonu

Oyun gerçekçi ama kuru olmamalıdır. Komik olaylar sistemin üstüne gelir.

Örnekler:

- Rakip eczacı tabela fontunu şikayet eder.
- Mahalle grubu "emanet vermiyorlar" diye karışır.
- POS cihazı yoğun anda naz yapar.
- Eski dosyadan kesinti gelir.
- Depocu "abi 17'sine çek yapalım" diye arar.
- Dermo standı fazla parlak diye şikayet edilir.
- Komşu klima dış ünitesini ilçe sağlığa taşır.

Komedi, eczacının yaşadığı gerçek baskılardan çıkmalı; hasta güvenliği ve meslek saygınlığıyla dalga geçmemeli.
