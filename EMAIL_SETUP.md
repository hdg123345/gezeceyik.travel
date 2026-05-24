# E-posta kurulumu (rezervasyon & iletişim)

Tüm formlar **gezeceyik1travel@gmail.com** adresine gider (veya `INQUIRY_TO` ile değiştirdiğiniz adres).

## 1. Gmail ile bağlama (önerilen)

1. [Google Hesabı](https://myaccount.google.com) → **Güvenlik** → **2 Adımlı Doğrulama** açık olsun.
2. **Uygulama şifreleri** → Uygulama: **Posta**, Cihaz: **Diğer** → “gezeceyik” → **Oluştur**.
3. 16 haneli şifreyi kopyalayın (boşluksuz yazın).

### Yerelde test

```bash
cd gezeceyik
cp .env.example .env
# .env dosyasını düzenleyin: GMAIL_USER ve GMAIL_APP_PASSWORD
npm install
npm run dev
```

Tarayıcıda açın: **http://localhost:3000/index.html**  
(Live Server / port 5500 ile formlar çalışmaz — `npm run dev` kullanın.)

### Canlı site (Vercel)

1. [vercel.com](https://vercel.com) → projeniz → **Settings** → **Environment Variables**
2. Ekleyin:

| Name | Value |
|------|--------|
| `GMAIL_USER` | `gezeceyik1travel@gmail.com` |
| `GMAIL_APP_PASSWORD` | (16 haneli uygulama şifresi) |
| `INQUIRY_TO` | `gezeceyik1travel@gmail.com` |

3. **Deployments** → son deploy → **Redeploy**

## 2. Alternatif: Web3Forms

1. [web3forms.com](https://web3forms.com) → kayıt → alıcı: **gezeceyik1travel@gmail.com**
2. Access Key alın.
3. Vercel’de veya `.env` içinde: `WEB3FORMS_ACCESS_KEY=...`

## Test

Rezervasyon formunu doldurup gönderin. Gelen kutusu ve **spam** klasörünü kontrol edin.

Hata alırsanız tarayıcıda F12 → **Network** → `booking` isteğine bakın; sunucu “E-posta servisi yapılandırılmamış” diyorsa `.env` veya Vercel değişkenleri eksiktir.
