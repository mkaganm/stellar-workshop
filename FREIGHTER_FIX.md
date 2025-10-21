# 🔧 Freighter Extension Sorun Çözümü

## ❌ Tespit Edilen Sorun
Freighter extension `window.freighterApi` objesini inject etmiyor.

## ✅ Çözüm Adımları

### 1. Extension İzinlerini Kontrol Et

#### Chrome/Brave için:
1. Adres çubuğuna gir: `chrome://extensions`
2. **Freighter Wallet** extension'ını bul
3. **"Details"** butonuna tıkla
4. **"Site access"** bölümünü bul:
   - ⚠️ Eğer **"On click"** seçiliyse → **"On all sites"** olarak değiştir
   - VEYA **"On specific sites"** → **"Add a new page"** → `http://localhost/*` ekle

#### Edge için:
1. `edge://extensions` → Aynı adımları takip et

### 2. Extension Permission Override

Eğer yukarıdaki çalışmazsa, **manuel olarak izin ver**:

1. `chrome://extensions` aç
2. Freighter'ın yanındaki **üç nokta (⋮)** → **"This can read and change site data"**
3. **"On all sites"** seç

### 3. Extension'ı Sıfırla

Extension bozulmuş olabilir:
1. `chrome://extensions`
2. Freighter'ı bul
3. **Toggle OFF** → **Toggle ON** yap
4. Sayfayı yenile

### 4. Extension'ı Yeniden Yükle

Tamamen temiz başlat:
1. `chrome://extensions`
2. Freighter'ı **"Remove"** ile kaldır
3. Chrome Web Store'dan yeniden yükle: https://chrome.google.com/webstore/search/freighter
4. Yükledikten sonra **"Allow"** butonuna tıkla (eğer soruyorsa)

---

## 🧪 Manuel Test

Extension'ın çalışıp çalışmadığını test etmek için:

### Test 1: Freighter'ın Kendi Sayfası
Freighter'ın kendi dahili sayfasında API her zaman çalışır:
1. Freighter icon'una tıkla (toolbar'da)
2. Popup açılacak
3. Popup içindeki herhangi bir linke tıkla
4. O sayfada **F12** → **Console** aç
5. Şunu yaz: `console.log(window.freighterApi)`
6. Eğer burada `undefined` dönerse **extension bozuk**, yeniden yükle

### Test 2: Bilinen Bir Site
Freighter'ın çalıştığı bilinen bir sitede test et:
- https://laboratory.stellar.org → F12 → Console → `console.log(window.freighterApi)`
- Eğer burada çalışıyorsa sorun **site izinlerinde**

---

## 🎯 Hızlı Fix: Extension İzinlerini Zorla

1. **Tarayıcıyı KAPAT** (tamamen)
2. Tarayıcıyı **yönetici modda** aç:
   - Windows: Chrome/Brave'e sağ tık → **"Run as administrator"**
3. `chrome://extensions` → Freighter → **Developer mode** aç
4. **"Reload"** butonuna bas
5. http://localhost:3000 aç
6. Freighter popup'ı aç → **Settings** → **Manage Site Access** kontrol et

---

## 📋 Alternatif: Farklı Port Dene

Bazen extension `localhost:3000` yerine farklı portları engelliyor.

`.env.local` dosyasını aç ve port değiştir (OPSIYONEL):
```bash
PORT=8080
```

Sonra container'ı yeniden başlat:
```powershell
docker compose down
# docker-compose.yml'de portu da değiştir: "8080:3000"
docker compose up -d web
```

---

## ⚡ Hızlı Checklist

- [ ] `chrome://extensions` → Freighter → "Site access" → "On all sites"
- [ ] Extension toggle OFF → ON
- [ ] Tarayıcıyı tamamen kapat → yeniden aç
- [ ] Sayfada F12 → Console → `window.freighterApi` kontrol et
- [ ] Extension'ı kaldır → yeniden yükle

---

## 🆘 Hala Çalışmıyor?

Eğer hiçbir şey işe yaramazsa:

### Son Çare: Freighter Alternatifi Test Et
Freighter yerine başka bir Stellar wallet extension dene:
- **Albedo** (eski ama stabil)
- **xBull** (alternatif Stellar wallet)

### Developer Mode Extension
Manuel olarak extension yükle:
1. GitHub'dan Freighter'ın source code'unu indir
2. `chrome://extensions` → **Developer mode** → **"Load unpacked"**
3. Freighter klasörünü seç

---

## 📞 Destek

Eğer sorun devam ederse Freighter Discord'una sor:
https://discord.gg/stellar

