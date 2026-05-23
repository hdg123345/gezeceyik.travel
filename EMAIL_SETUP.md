# E-posta kurulumu (rezervasyon & iletişim formları)

Formlar **gezeceyik1travel@gmail.com** adresine gönderilir. Vercel’de aşağıdakilerden **birini** yapılandırmanız gerekir.

## Seçenek A — Gmail (önerilen)

1. **gezeceyik1travel@gmail.com** ile [Google Hesabı](https://myaccount.google.com) → **Güvenlik** → **2 Adımlı Doğrulama** açık olsun.
2. **Uygulama şifreleri** → Uygulama: Posta, Cihaz: Diğer → “gezeceyik” → Oluştur.
3. 16 haneli şifreyi kopyalayın.
4. [Vercel](https://vercel.com) → projeniz → **Settings** → **Environment Variables**:

| Ad | Değer |
|----|--------|
| `GMAIL_USER` | `gezeceyik1travel@gmail.com` |
| `GMAIL_APP_PASSWORD` | (16 haneli uygulama şifresi, boşluksuz) |
| `INQUIRY_TO` | `gezeceyik1travel@gmail.com` (isteğe bağlı) |

5. **Redeploy** yapın (Deployments → son deploy → Redeploy).

## Seçenek B — Web3Forms

1. [web3forms.com](https://web3forms.com) → kayıt → alıcı e-posta: **gezeceyik1travel@gmail.com**
2. **Access Key** kopyalayın.
3. Vercel’de `WEB3FORMS_ACCESS_KEY` = (anahtarınız)
4. Redeploy.

## Test

Deploy sonrası sitede iletişim veya rezervasyon formunu doldurun. Gelen kutusu + spam klasörünü kontrol edin.

Yerel `index.html` dosyası açıldığında `/api/booking` çalışmaz; test için `npx vercel dev` veya canlı site kullanın.
