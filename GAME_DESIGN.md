# Kırmızı Tabela Oyun Tasarımı

## Ana Fikir

Kırmızı Tabela, eczaneyi sadece ciro üzerinden değil; kasa, depo borcu, SGK alacağı, stok sağlığı, personel morali, müşteri memnuniyeti, uyum riski ve eczacının enerjisi üzerinden yöneten bir web simülasyonudur.

## Günlük Döngü

1. Oyuncu günün stratejik hamlesini seçer: stok, depo vadesi, SGK kontrolü, personel planı, nakit disiplini veya dinlenme/delege.
2. Oyuncu o günün eczane düzenini seçer.
3. Günlük olay kartı gelir ve oyuncu bir seçenek seçer.
4. Bugünün Sürprizi kapalı zarf olarak otomatik uygulanır; oyuncu bunu gün bitmeden göremez.
5. Oyun motoru ciro, nakit, SGK alacağı, stok, enerji ve riskleri hesaplar.
6. Haftalık depo ödemesi ve aylık SGK/gider döngüleri belirli günlerde çalışır.
7. Hedef paneli oyuncunun başarıya mı, başarısızlığa mı gittiğini gösterir.
8. Eczacı Ligi oyuncunun başarı puanını diğer kurgu eczanelerle kıyaslar.

## Başlangıç

Oyuncu oyuna tek tip eczaneyle başlamaz. Önce bir kariyer dosyası seçer:

- Sıfırdan kurulan mahalle eczanesi
- Borçlu mevcut mahalle eczanesi
- Hastane yakını yoğun reçete eczanesi
- Cadde üstü dermo/OTC odaklı eczane
- Kırsal ilçe ve nöbet yükü olan eczane
- Turistik bölgede sezonluk satış eczanesi

Her dosya başlangıç kasası, depo borcu, SGK alacağı, aylık kira, müşteri trafiği, reçete baskısı ve OTC/dermo potansiyeliyle gelir. Bu değerler günlük satış algoritmasına bağlanır.

## Türkiye Eczane Gerçekliği

Kırmızı Tabela'nın farkı genel ticaret oyunu değil, Türkiye'deki serbest eczane operasyonunu oyunlaştırmasıdır.

Ana sistemler:

- SGK takvimi: ayın 1-7 arası fatura/kontrol, 7-15 arası teslim, 15'i etrafında ödeme beklentisi, sonrasında düzeltme/kesinti dönemi.
- Reçete grupları: e-reçete, manuel reçete, majistral, renkli reçete, A/B/C grupları, yurt dışı grup, özel sigorta.
- Depo vadesi: SGK ödeme günü beklentisine göre 15'ine senet, 17'sine çek, özel ciroya göre vade esnetme gibi oyun kuralları.
- Ödeme kanalları: nakit, POS, SGK alacağı, özel sigorta alacağı.
- POS komisyonu: banka oranı küçük görünür ama kârlılığı sürekli kemirir.
- Eski kesinti riski: geçmiş dönem kontrolden bugüne kesinti gelebilir.
- Emanet ilaç baskısı: hasta ilişkisi ve uyum riski arasında karar yaratır.
- İlçe sağlık/şikayet olayları: rakip çekememe, vitrin, reklam, komşu ve nöbet kaynaklı komik ama stresli olaylar.

Bu sistemler gerçek mevzuat hesaplayıcısı değildir; eczacıların tanıdığı baskıları oyun kuralına çevirir.

## Eczane Düzeni

Eczane düzeni sadece görsel değildir; günlük satış kırılımını etkiler.

- Dengeli Düzen: Riskleri dengeler.
- Reçete Hızı: Reçete akışı ve SGK alacağı artabilir, peşin kasa daha yavaş gelir.
- Dermo Vitrini: Peşin kasa ve marj artar, stok ve vade baskısı büyür.
- OTC Hızlı Raf: Hızlı satış ve nakit akışı desteklenir.
- Akış & Banko: Kuyruk, enerji, memnuniyet ve uyum tarafı toparlanır; küçük operasyon maliyeti vardır.

## Algoritma Mantığı

Günlük ciro şu ana bileşenlerden hesaplanır:

- Lokasyon trafiği
- Reçete baskısı
- OTC/dermo perakende potansiyeli
- Stok sağlığı
- Müşteri memnuniyeti
- Personel morali
- İtibar
- Seçili raf/banko düzeni
- Günlük olay kartı
- Bugünün Sürprizi

Bu yüzden oyun sadece "kart seç ve gün atla" değildir. Kartlar günlük krizi verir; asıl strateji lokasyon, stok, raf odağı, personel ve finans kararlarından oluşur.

## Kıyas Sistemi

Ana kıyas başarı puanıdır. Ciro yanında gösterilir ama tek başına sıralama ölçütü değildir. Çünkü yüksek ciro; yüksek borç, düşük enerji ve artan uyum riskiyle sağlanmış olabilir.

## Başarı ve Başarısızlık

Her senaryo 12 ay sürer. Senaryo sonunda oyuncu şu hedefleri tutturmaya çalışır:

- Hedef kasa
- Maksimum depo borcu
- Minimum müşteri memnuniyeti
- Minimum stok sağlığı
- Minimum eczacı enerjisi
- Maksimum uyum riski
- Minimum başarı puanı

Erken başarısızlık koşulları:

- Depo borcunun sürdürülemez seviyeye çıkması
- Uyum riskinin kritik eşiği geçmesi
- Müşteri memnuniyetinin çökmesi
- Eczacı enerjisinin tükenmesi
- Depo güveninin kaybedilmesi

## Uzun Serüven

Hedef yapı oyun içi 12 aylık sezon döngüsüdür. Bu gerçek hayatta 12 ay boyunca her gün giriş yapılacak bir oyun olmak zorunda değildir. Her tıklama bir oyun gününü ilerletir.

Oynama hızları:

- Hızlı sezon: Oyuncu kararları hızlı seçer, 12 ayı 1-2 saatte bitirebilir.
- Detaylı sezon: Oyuncu stok, depo, personel ve finans ekranlarını inceleyerek birkaç saat oynar.
- İleride eklenebilecek günlük giriş modu: Oyuncuya her gerçek gün bir oyun günü açılır; bu ayrı bir mod olur.

## Eksik Ana Sistemler

- Personel işe alma, eğitim, vardiya ve maaş pazarlığı
- Depo seçimi, vade pazarlığı ve tedarik güveni ekranı
- Kategori bazlı gerçek stok yatırımı
- Mimari yatırımlar: banko sayısı, dermo alanı, depo odası, bekleme alanı
- Zaman hızı: hızlı gün geçme, detaylı gün, haftalık plan
- Aylık hedefler, başarı rozetleri ve kriz senaryoları
- Firebase Auth ve Firestore ile kalıcı kullanıcı hesapları
- Çok sezonlu kariyer ve eczane devralma/açma modları
