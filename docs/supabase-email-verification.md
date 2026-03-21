# E-posta ile kayıt doğrulama (zorunlu + OTP kodu)

Bu projede kayıt sonrası kullanıcı **e-postayı doğrulamadan** şifre ile giriş yapamaz. İki yöntem desteklenir:

1. **6 haneli kod** — `login.html` üzerindeki alana girilir (`verifyOtp` + `type: 'signup'`).
2. **E-postadaki bağlantı** — Supabase’in gönderdiği `{{ .ConfirmationURL }}` linki.

## Supabase Dashboard ayarları

1. **Authentication** → **Providers** → **Email**
   - **Confirm email** açık olsun (kullanıcı e-postayı onaylamadan oturum açmasın).

2. **Authentication** → **URL Configuration**
   - **Site URL**: canlı site kök adresiniz (örn. `https://devretlink.com`).
   - **Redirect URLs** içine ekleyin:
     - `http://localhost:8000/login.html`
     - `http://localhost:8000/login.html?verified=true`
     - Canlı domain için aynı yollar.

3. **Authentication** → **Email Templates** → **Confirm signup**
   - Metne **6 haneli kod** için şu değişkeni ekleyin (Supabase dokümantasyonu: `{{ .Token }}`):

```html
<p>Doğrulama kodunuz: <strong style="font-size:1.25rem;letter-spacing:0.2em">{{ .Token }}</strong></p>
<p>Veya bu bağlantıya tıklayın: <a href="{{ .ConfirmationURL }}">Hesabımı doğrula</a></p>
```

   - Kod süresi (varsayılan genelde **yaklaşık 1 saat**) proje / GoTrue ayarlarına bağlıdır; hosted Supabase’de **Project Settings → Authentication** altında OTP / e-posta ile ilgili süre varsa oradan değiştirilebilir.

## Geliştirici notları

- `backend/api.js`: `registerUser`, `verifySignupWithOtp`, `resendSignupVerificationEmail`, `loginUser` içinde `EMAIL_NOT_CONFIRMED` yanıtı.
- E-posta onayı **kapalı** projelerde kayıt sonrası doğrudan `session` döner; uygulama yine de çalışır.

## SMTP

Özel SMTP (Outlook vb.) kullanıyorsanız, şifre sıfırlama ile aynı kanaldan doğrulama postaları da gider; gönderim takılırsa Supabase **Email** / SMTP loglarını kontrol edin.
