# Messenger Akış Analizi ve Kırmızı Tabela Uygulama Planı

## İnceleme Özeti

İncelenen site, oyunu bir web sayfası gibi değil tek parça bir WebGL sahnesi gibi sunuyor. HTML iskeleti neredeyse boş; asıl ürün büyük canvas içinde çalışan 3D dünya. İlk algı "menü" değil, "oyun dünyası".

Teknik izler:

- Minimal HTML ve tek WebGL giriş dosyası.
- Vite/Svelte tarzı hafif uygulama kabuğu.
- Three.js/WebGL tabanlı ağır 3D bundle.
- GLTF, DRACO ve KTX izleriyle optimize edilmiş 3D asset pipeline.
- Shader/postprocess izleriyle düz model değil, stilize görüntü dili.
- Pointer/click ve audio izleriyle sahnenin oyun etkileşimi taşıması.
- DOM tarafında az UI; UI sahneyi kapatmıyor, sahnenin ritmini tamamlıyor.

## Neden Daha Premium Hissediyor?

1. **Sahne önce geliyor.** Kullanıcı ekrana baktığında panel değil dünya görüyor.
2. **Tek büyük odak var.** Başlık, dünya ve tek ana buton. Kullanıcı ne yapacağını düşünmüyor.
3. **Stil tutarlı.** Renk, ışık, şekil ve tipografi aynı oyuna ait.
4. **Dünya ölçekli his var.** Küçük objeler bile büyük bir yerin parçası gibi duruyor.
5. **UI az ama kararlı.** Paneller bilgi deposu değil, karar çağrısı.
6. **Yükleme bile karakterli.** Basit spinner yerine oyuna ait çizgisel animasyon kullanılıyor.

## Bizdeki Problem

Kırmızı Tabela şu an çalışıyor ama aynı anda çok şey gösteriyor:

- Sahne arka plan gibi kalıyor.
- Sağ/sol/bottom paneller oyunu dashboard hissine çekiyor.
- Karar akışı "bir gün oynayayım" duygusu yerine "form doldurayım" hissi veriyor.
- 3D dünya eczane gerçekliğini anlatıyor ama yeterince atmosfer taşımıyor.
- Başarı ve riskler var, fakat oyuncuya tek güçlü hedef olarak sunulmuyor.

## Kopyalamadan Alınacak Yöntem

Messenger'dan görsel veya kod kopyalanmayacak. Alınacak şey üretim yöntemi:

- Canvas/3D dünyayı ana yüzey yapmak.
- UI'yi cam panel değil, oyun içi komuta katmanı gibi kullanmak.
- İlk ekranda tek ana eylem ve tek ana hedef göstermek.
- Mekanı odadan çıkarıp diorama hissine taşımak.
- Etkileşimli noktaları sahne objeleriyle ilişkilendirmek.
- Fazla metni gizleyip gerektiğinde açılan komuta paneline almak.

## Kırmızı Tabela'ya Uygulama Planı

### 1. Sahne Dili

Eczane içi yalnız bir oda olmayacak. Türkiye eczanesi bağlamı küçük bir mahalle dioraması olarak sunulacak:

- Eczane içi: banko, raf, SGK masası, personel, müşteri kuyruğu.
- Dış çevre: sokak, apartman, depo motoru, SGK binası, hastane/mahalle işaretleri.
- Kırmızı tabela ana görsel imza kalacak.
- Ürünler raflarda renkli ve okunur kalacak.

### 2. UI Akışı

Dashboard azaltılacak:

- Üstte sadece kimlik, kasa, borç, SGK, enerji ve ana gün butonu.
- Solda kısa senaryo brifi ve kritik riskler.
- Sağda aktif modül komut paneli.
- Alt bölüm varsayılan olarak küçük kalacak, "Komuta" ile açılacak.
- Günlük hedef tek cümle olarak sahnenin üstünde gösterilecek.

### 3. Oyun Hissi

Oyuncunun her turda düşünmesi gereken ana soru görünür olacak:

- Bugün raf mı, SGK mı, nakit mi, personel mi öncelik?
- Stok kritikse depo önerisi daha görünür olacak.
- Enerji düşüyorsa personel/vardiya uyarısı sertleşecek.
- SGK günü yaklaşıyorsa takvim hissi öne çıkacak.

### 4. İlk Uygulama Kapsamı

Bu turda uygulanacaklar:

- 3D eczaneyi daha geniş mahalle dioramasına çevirmek.
- Sahneyi daha canlı ve renkli yapmak.
- Panelleri azaltıp komuta odaklı düzen kurmak.
- Alt bilgi alanını açılır komuta paneline dönüştürmek.
- Ekranın ortasına tek güçlü günlük hedef kartı koymak.
- Test ajanı raporundaki zayıf noktaları görünür ürün eksikleri olarak korumak.

### 5. Sonraki Sprint

Bir sonraki mantıklı adım:

- Haftalık depo sipariş sepeti.
- Enerji/vardiya sistemi için daha net ceza-ödül.
- Açılış görevlerinde alternatif karar dalları.
- Skor ve lig ekranını ayrı sonuç töreni haline getirmek.
- Gerçek GLTF/texture asset pipeline kurmak.

## Lokasyon Dioraması Revizyonu

Eczane artık tek başına yüzen bir oda gibi kalmamalı. Senaryo seçimi sahnenin çevresini değiştirmeli:

- Mahalle: apartman, aile sağlığı merkezi, pastane, yol ve ağaçlar.
- Hastane: büyük hastane bloğu, poliklinik, taksi/yol yoğunluğu, yakın SGK teslim odağı.
- Cadde: banka, dermo mağazası, kafe ve daha geniş cadde akışı.
- AVM: AVM bloğu, otopark, plaza ve mal kabul deposu.
- Kırsal: ilçe meydanı, ASM, tarla ve uzak depo vurgusu.
- Turistik: otel, sahil/su alanı, sezon pazarı ve sezon deposu.
- Üniversite/Sanayi: kampüs veya sanayi bağlamı, buna göre müşteri akışı.

SGK binası eczane içinde durmayacak; dış dünyada ayrı bir resmi kurum landmark'ı olacak ve tıklanınca SGK modülünü açacak. Eczane içindeki SGK noktası sadece dosya/işlem masası olarak kalacak.

Depo da ayrı bir landmark olacak; sokak/tedarik hattında "Ecza Deposu", "Nöbetçi Depo", "AVM Mal Kabul" veya "Uzak Depo" gibi senaryo diline göre değişecek. Depo motoru bu landmark'ın yanında konumlanacak.

## Sokak Seviyesi Kamera Revizyonu

Bu turda üstten bakan iç-mekan maketi ana render'dan çıkarıldı. Oyun artık eczanenin bulunduğu sokakta, oyuncu avatarının arkasından bakan düşük kamera ile açılıyor.

- Eczane vitrin, kapı, tabela ve ön raf görünümüyle ayrı bir bina olarak kuruldu.
- Depo bina ve teslim aracıyla sol lojistik nokta olarak ayrıldı.
- SGK resmi bina cephesiyle sağ tarafta ayrı landmark olarak duruyor.
- Aktif sahnedeki tabela ve bina isimleri 3D fonta bağımlı olmadan HTML hotspot olarak çiziliyor; font yüklemesi beklenirken WebGL canvas'ın boş kalma riski düşürüldü.
- Karakter üstü büyük görev etiketleri kaldırıldı; personel ve müşteri kalabalığı sahneyi kapatmadan akış hissi veriyor.

## Aktör ve Rota Motoru Revizyonu

Örnek siteden kod veya asset alınmadı; yöntem olarak tek WebGL dünya, tıklanabilir aktör state'i, rota boyunca hareket ve az DOM panel yaklaşımı uyarlandı.

- Eczacı, personel, hasta ve depo kuryesi ayrı aktör tipleri olarak tanımlandı.
- Aktörler sabit durmuyor; rota üzerinde ilerliyor, yönünü rotaya göre çeviriyor ve tıklanınca oyun içi bilgi kartını güncelliyor.
- Personel görevi rotayı belirliyor: SGK görevi resmi kurum hattına, stok görevi depo/raf hattına, dermo görevi vitrin ve OTC hattına yaklaşıyor.
- Sıfırdan kurulumda satış kilidi korunuyor ama hasta trafiği sahnede görünür kalıyor; oyuncu açılış görevlerinin neden önemli olduğunu görsel olarak hissediyor.
- Depo aracı ayrı lojistik rotada çalışıyor; depo/vade kararları artık sahnede seçilebilir bir hareketli unsurla temsil ediliyor.
- Harita ölçeği büyütüldü: SGK, depo, eczane ve yan sokak landmark'ları ayrı pozisyonlara dağıtıldı.

## Eczane İçine Giriş Revizyonu

Oyun artık sadece sokak cephesinde kalmıyor. Oyuncu eczane kapısından veya sabit "Eczaneye gir" butonundan iç mekana geçebiliyor.

- Sokak modu: depo, SGK kurumu, yan sokak ve dış hasta trafiği görünür.
- İç mekan modu: raflar, banko/POS, SGK işlem masası, stok alanı ve dışarı çıkış noktası görünür.
- İçeride eczacı, personel ve hastalar ayrı iç mekan rotalarında hareket eder.
- İç mekan rafları font yüklemesine bağımlı olmayan HTML hotspot ve kutu ürünlerle çizilir; WebGL sahnesinin boş kalma riski azaltıldı.
- Test için `?view=interior` parametresi doğrudan iç mekan render'ını açar; normal oynanışta kapı veya buton kullanılır.
