# Freighter Extension Troubleshooting

## Problem: Extension görünmüyor

### Adım 1: Freighter yüklü mü?
1. Chrome/Brave: `chrome://extensions`
2. Firefox: `about:addons`
3. **Freighter Wallet** extension'ının aktif olduğundan emin olun

### Adım 2: Browser Console Test
1. http://localhost:3000 sayfasını açın
2. F12 ile Developer Tools'u açın
3. Console tab'ına şunu yazın:
```javascript
console.log('Freighter API:', window.freighterApi);
```

**Beklenen sonuçlar:**
- ✅ `Freighter API: {isConnected: ƒ, requestAccess: ƒ, ...}` → Extension çalışıyor
- ❌ `Freighter API: undefined` → Extension yüklü değil veya domain izni yok

### Adım 3: Extension Domain İzinleri
Freighter extension'ı bazen `localhost`'a otomatik izin vermez.

**Çözüm:**
1. Extension icon'una sağ tıklayın
2. "Manage Extension" / "Extension'ı Yönet" seçin
3. "Site Access" / "Site Erişimi" bölümünde:
   - "On all sites" seçin VEYA
   - "On specific sites" → `http://localhost:3000` ekleyin

### Adım 4: Sayfayı Hard Refresh
- Windows/Linux: `Ctrl + Shift + R` veya `Ctrl + F5`
- Mac: `Cmd + Shift + R`

### Adım 5: Extension'ı Yeniden Yükle
Eğer hala çalışmıyorsa:
1. `chrome://extensions` açın
2. Freighter'ın yanındaki "Reload" butonuna tıklayın
3. Sayfayı yenileyin

## Alternatif Test: Browser Console'dan Manuel Bağlantı

Console'a yapıştırın:
```javascript
(async () => {
  if (!window.freighterApi) {
    console.error('❌ Freighter extension not found!');
    return;
  }
  
  console.log('✅ Freighter found!');
  
  const result = await window.freighterApi.requestAccess();
  console.log('Connection result:', result);
})();
```

## Polling Mekanizması Güncellendi ✅

Son güncellemeler:
- ✅ `frontend/pages/index.tsx` - Extension'ı 3 saniye boyunca her 100ms'de bir kontrol eder
- ✅ `frontend/.env.local` - Environment variables eklendi
- ✅ `frontend/tsconfig.json` - `global.d.ts` type definitions eklendi

## Hala Çalışmıyorsa

### Chrome'da Test Et
Farklı tarayıcıda dene:
1. Freighter'ı Chrome'a yükle: https://chrome.google.com/webstore (Freighter ara)
2. http://localhost:3000 aç
3. Extension'ın toolbar'da göründğünden emin ol

### Network İzinleri
Docker container `0.0.0.0:3000` üzerinde çalışıyor. Eğer browser `127.0.0.1` yerine farklı bir IP kullanıyorsa:
```bash
# .env.local'e ekle:
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Debug Modu
Container loglarını izle:
```powershell
docker compose logs web -f
```

Tarayıcı console loglarını kontrol et:
- F12 → Console tab
- Herhangi bir kırmızı hata var mı?

## Son Çare: Clean Restart
```powershell
docker compose down
docker compose up --build web
```

Tarayıcı cache'ini temizle:
- Chrome: `Ctrl + Shift + Delete` → "Cached images and files" → Clear

---

**İletişim:** Extension'ın doğru yüklendiğinden emin olun: https://www.freighter.app
