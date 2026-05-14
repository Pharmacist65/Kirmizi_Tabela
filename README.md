# Kırmızı Tabela

Web tabanlı eczane yönetme simülasyonu prototipi.

İlk demo hedefi: **Borçlu Mahalle Eczanesini 12 Ayda Kurtar**.

## Çalıştırma

```bash
npm install
npm run dev
```

Tarayıcıda `http://localhost:3000` adresini aç.

## Şimdiki kapsam

- Günlük karar kartları
- Bugünün Sürprizi kartı: bazen iyi, bazen kötü, bazen komik gerçekçi olaylar
- Eczacı Ligi: başarı puanı ana kıyas, ciro yardımcı kıyas
- Kasa, depo borcu, SGK alacağı, enerji, stok, memnuniyet ve uyum riski
- Basit 2D eczane görünümü
- Gün sonu özeti ve başarı skoru
- Firebase ayarlarına hazır ama demo modunda yerel kayıt

Detaylı oynanış tasarımı için [GAMEPLAY.md](./GAMEPLAY.md) dosyasına bak.

## Firebase

Firebase bağlamak için `.env.local` içinde şu değerler gerekecek:

```bash
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
```
