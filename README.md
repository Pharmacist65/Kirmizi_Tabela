# Kırmızı Tabela

**Kırmızı Tabela**, Türkiye'deki serbest eczane işleyişinden ilham alan web tabanlı bir tycoon / idle-management oyun prototipidir.

Oyuncu bir eczacı kimliğiyle eczanesini kurar ya da mevcut bir eczaneyi devralır; stok, depo vadeleri, SGK alacakları, POS tahsilatları, personel, raf düzeni ve hasta memnuniyeti arasında denge kurmaya çalışır.

Buradaki amaç sadece yüksek ciro yapmak değildir. En iyi oyuncu; nakit akışını bozmadan, depo borcunu şişirmeden, SGK riskini kontrol ederek ve eczaneyi yaşayan bir işletme gibi yöneterek yükselir.

## Oyun Fikri

Kırmızı Tabela klasik bir dashboard değil; oyuncuya her gün küçük ama sonuçları görünen kararlar aldıran bir eczane yönetme oyunudur.

Ana döngü:

1. Senaryo seç.
2. Eczacı ve eczane kimliğini oluştur.
3. Sıfırdan açılışta kurulum görevlerini tamamla.
4. Depodan, bayiden veya eczacı pazarından stok planla.
5. Raf odağını ve personel görevlerini seç.
6. 08:30-19:00 arasındaki günü simüle et.
7. Satış, kaçan müşteri, POS, SGK alacağı ve depo vadesi sonucunu gör.
8. XP kazan, level atla ve eczacılar liginde yüksel.

## Oynanabilir Modlar

- **Sıfırdan Eczane Aç**: İl, ilçe, lokasyon, dükkan, ruhsat, oda kaydı, depo anlaşması, POS anlaşması, ilk stok ve tabela montajı gibi açılış adımlarını tamamlayarak eczaneyi faaliyete geçir.
- **Mevcut Eczaneyi Devral**: Hazır müşteri kitlesi, eski stok, depo borcu, SGK alacağı, personel alışkanlıkları ve vade baskısıyla oyuna başla.
- **12 Aylık Kriz Senaryosu**: Kısa ama yoğun hedeflerle eczaneyi belirli bir sezon sonunda ayakta tutmaya çalış.

## Neyi Oyunlaştırıyor?

- Depo alımlarında 45, 60 ve 90 günlük vadeler
- Nakit, POS, SGK ve özel sigorta alacak dengesi
- Ayın 1-7 / 7-15 / 15 sonrası SGK takvimi
- Stok bulunurluğu, miat riski ve kaçan satış
- Personel hızı, dikkati, morali ve görev uyumu
- Raf odağına göre değişen reçete, OTC ve dermo satışları
- Eczacı pazarı ve eczaneler arası takas mantığı
- Rakip eczacılarla sadece ciro değil, başarı puanı üzerinden kıyas
- Komik ama gerçekçi günlük olaylar ve sürprizler

## Başarı Puanı

Eczacılar liginde sıralama tek başına ciroya göre yapılmaz. Başarı puanı şu alanlardan oluşur:

- Net karlılık
- Kasa ve nakit akışı
- Depo borcu / vade yönetimi
- SGK uyum ve kesinti riski
- Stok sağlığı
- Kaçan satış oranı
- Hasta memnuniyeti
- Personel morali

Yani çok satan ama borca, kesintiye ve mutsuz müşteriye boğulan eczane zirveye çıkamaz.

## Mevcut Prototip Kapsamı

- Next.js + TypeScript arayüz
- Eczacı / eczane adı, il, ilçe ve başlangıç tipi seçimi
- Sıfırdan açılış için kilitli ve zamanlı kurulum görevleri
- Canlı eczane sahnesi: banko, raf, depo, SGK masası, müşteri ve personel animasyonları
- Günlük 08:30-19:00 akış mantığı
- Depo, stok, SGK, POS, personel ve finans modülleri
- Vadeli depo borcu, POS alacağı ve SGK alacağı ledger sistemi
- Gün sonu raporu ve aksiyon sonucu paneli
- Eczacılar ligi / başarı puanı tablosu

Detaylı oynanış tasarımı için [GAMEPLAY.md](./GAMEPLAY.md) dosyasına bak.

## Çalıştırma

```bash
npm install
npm run dev
```

Tarayıcıda şu adresi aç:

```text
http://localhost:3000
```

Kontrol komutları:

```bash
npm run typecheck
npm run build
```

## Firebase

Proje Firebase bağlantısına hazırdır. Demo modunda yerel state ile çalışabilir.

Firebase bağlamak için `.env.local` içine şu değerler eklenir:

```bash
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
```

## Not

Bu proje gerçek tıbbi tavsiye, gerçek ilaç verisi veya gerçek SGK hesaplama motoru değildir. Eczane operasyonunu oyunlaştıran kurgu bir yönetim simülasyonudur.
