# 🧩 Ürün Tasarım Gereksinimleri (PDR) - Workshop Document (Dockerized)

## 🎯 Temel Başlıklar

* **Proje Adı:** Crypto Message Board  
* **Tür:** Basit Blockchain Uygulaması (Dockerized dApp)  
* **Platform:** Stellar Soroban  
* **Hedef:** Basic frontend + basit contract entegrasyonu + testnet deployment + docker-compose ortamı  

---

## 🎯 Proje Özeti  
Bu projede kullanıcıların **Freighter Wallet** ile bağlanarak blockchain üzerinde kısa mesajlar bırakabildiği basit bir mesaj panosu (message board) yapılacaktır.  
Uygulama tamamen **Dockerize** edilmiştir — yani frontend (Next.js) ve Soroban CLI (Rust) container’lar içinde çalışır.  
Kullanıcı tarafındaki Freighter Wallet ise **tarayıcı eklentisi** olarak çalışır ve container dışında kalır.  

---

## 🚀 Kısaca Projenizi Anlatın  
**Crypto Message Board**, kullanıcıların kendi cüzdan adresleriyle blockchain üzerinde halka açık kısa mesajlar yazabildiği bir mini dApp’tir.  
Mesajlar Soroban contract üzerinde saklanır, frontend bu mesajları listeler ve yeni mesaj ekleme imkanı sunar.  
Tüm işlemler Stellar testnet üzerinde yapılır, kullanıcı doğrulaması Freighter Wallet ile sağlanır.  
Proje, Docker ortamında kolayca çalıştırılabilir şekilde yapılandırılmıştır.  

---

## 📋 Problem Tanımı  
Amaç, **Soroban üzerinde çalışan basit bir kontratı** frontend ile entegre etmek ve bu ortamı **Docker** üzerinden yönetmektir.  
Kontrat, blockchain üzerinde mesajları saklar; frontend bu mesajları gösterir ve yenilerini ekler.  
Bu sayede hem **write** hem de **read** işlemleri entegre bir şekilde testnet ortamında çalışır.  

---

## ✅ Yapılacaklar (Sadece Bunlar)

### Frontend (Dockerized Next.js)
* Modern, sade bir arayüz (Next.js + Tailwind CSS + TypeScript)  
* Docker container’ı içinde çalışacak (`web` servisi)  
* Kullanıcı wallet’ını bağlayabilmeli (connect/disconnect)  
* Mesajları listeleyebilmeli ve yeni mesaj gönderebilmeli  
* `.env` dosyasındaki testnet bilgilerini kullanmalı  

### Smart Contract (Soroban + Rust)
* Basit, tek amaçlı bir kontrat yazılacak  
* Maksimum 3–4 fonksiyon içerecek  
* Fonksiyonlar:
  - `write_message(msg: String)`  
  - `get_messages()`  
  - `get_message_count()`  
  - (Opsiyonel) `clear_messages()`  
* Minimal veri saklama (mesaj listesi veya mapping)  
* Soroban CLI, ayrı bir container (`soroban` servisi) üzerinden yönetilecek  
* Kolay test edilebilirlik ve testnet deploy desteği  

### Frontend Entegrasyonu
* JavaScript üzerinden Soroban SDK çağrıları yapılacak  
* Contract fonksiyonları frontend’den çağrılabilecek  
* Mesaj ekleme işlemleri Freighter Wallet aracılığıyla imzalanacak  
* Docker ağında environment değişkenleriyle çalışacak  

### Wallet Bağlantısı
* **Freighter Wallet API** entegrasyonu  
* Basit connect/disconnect işlemleri  
* Wallet adresi üzerinden kullanıcı tanımlama  
* `FreighterWalletDocs.md` dökümanı referans alınacak  
* Not: Freighter tarayıcı eklentisidir, Docker container’ında çalışmaz; kullanıcı tarayıcısında aktif olmalıdır.  

---

## ⚙️ Docker Ortamı ve Servisler

### 🧩 Docker Servisleri
1. **web:**  
   - Next.js dev/prod ortamı  
   - Port: `3000:3000`  
   - Env:  
     ```bash
     NEXT_PUBLIC_STELLAR_RPC_URL=https://soroban-testnet.stellar.org:443
     NEXT_PUBLIC_STELLAR_NETWORK_PASSPHRASE=Test SDF Network ; September 2015
     NEXT_PUBLIC_CONTRACT_ID=<testnet_contract_id>
     ```  
   - Hot reload için bind mount aktif (development)

2. **soroban:**  
   - Rust + Soroban CLI içeren container  
   - Kontrat build/deploy/test işlemleri  
   - Volume: `./contracts:/contracts`  
   - Ağ: testnet RPC üzerinden dış bağlantı  

---

### 🐳 docker-compose.yml Özeti
```yaml
version: "3.9"
services:
  web:
    build:
      context: ./frontend
      dockerfile: Dockerfile.dev
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_STELLAR_RPC_URL=https://soroban-testnet.stellar.org:443
      - NEXT_PUBLIC_STELLAR_NETWORK_PASSPHRASE=Test SDF Network ; September 2015
      - NEXT_PUBLIC_CONTRACT_ID=${NEXT_PUBLIC_CONTRACT_ID}
    volumes:
      - ./frontend:/app
      - /app/node_modules

  soroban:
    build:
      context: ./contracts
      dockerfile: Dockerfile.soroban
    working_dir: /contracts
    volumes:
      - ./contracts:/contracts
    environment:
      - STELLAR_RPC_URL=https://soroban-testnet.stellar.org:443
      - STELLAR_NETWORK_PASSPHRASE=Test SDF Network ; September 2015
```

---

## ❌ Yapılmayacaklar (Kesinlikle)

### Contract Tarafında
* ❌ Karmaşık iş mantığı  
* ❌ Token transferi veya ödeme işlemleri  
* ❌ Gelişmiş erişim kontrolü  
* ❌ Multi-signature  
* ❌ Time-locked işlemler  
* ❌ Fee hesaplama  

### Frontend Tarafında
* ❌ Karmaşık state management  
* ❌ Authentication veya kullanıcı rolleri  
* ❌ Container içinde Freighter Wallet çalıştırma girişimleri  

---

## 🛠 Teknik Spesifikasyonlar

### Minimal Tech Stack
* **Frontend:** Next.js, Tailwind CSS, TypeScript  
* **Contract:** Rust + Soroban SDK (basic)  
* **Wallet:** Freighter API (connect/sign)  
* **Network:** Stellar Testnet  
* **Containerization:** Docker, docker-compose  
* **Build Tools:** Makefile (opsiyonel kısa komutlar)

---

## 🧪 Test Senaryoları

* ✅ Contract başarılı şekilde build + deploy ediliyor mu?  
* ✅ Wallet bağlantısı sorunsuz çalışıyor mu?  
* ✅ `write_message` fonksiyonu doğru şekilde mesaj ekliyor mu?  
* ✅ `get_messages` fonksiyonu frontend’e doğru veriyi dönüyor mu?  
* ✅ Container içinde frontend düzgün build oluyor mu?  
* ✅ Compose ağı üzerinden backend/CLI erişimi stabil mi?  
* ✅ Connect/Disconnect işlemleri düzgün çalışıyor mu?  

---

## 🐙 Docker Komutları

```bash
# Geliştirme ortamını başlat
docker compose up --build web

# Soroban CLI container’ına bağlan
docker compose run --rm soroban bash

# Kontratı build et
soroban contract build --package message-board

# Testnet deploy
soroban contract deploy   --wasm target/wasm32-unknown-unknown/release/message_board.wasm   --network testnet   --source deployer

# Contract ID çıktıktan sonra frontend .env dosyasına ekle
NEXT_PUBLIC_CONTRACT_ID=<ID>
```

---

## 🎯 Başarı Kriterleri

### Teknik Başarı
* ✅ Contract testnet’te hatasız çalışıyor  
* ✅ Frontend container’ı Soroban SDK ile entegre şekilde çalışıyor  
* ✅ Docker Compose ile tek komutla çalıştırılabiliyor  
* ✅ Freighter wallet bağlantısı sorunsuz  
* ✅ Mesaj gönderme ve görüntüleme işlemleri aktif  
* ✅ Dev → Prod pipeline container’lar arası tutarlı  

---

## 🧩 Ek Notlar

* Freighter Wallet yalnızca kullanıcı tarayıcısında çalışır, container içinde değil.  
* Container sadece uygulama ortamını sağlar, cüzdan veya private key içermez.  
* CI/CD sürecinde Soroban container’ı kontrat build + deploy işlemlerinde kullanılabilir.  
* Tüm yapı `docker-compose up --build` komutuyla hızlıca ayağa kaldırılabilir.
