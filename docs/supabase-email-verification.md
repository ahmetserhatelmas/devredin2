# E-posta ile kayıt doğrulama (bağlantı + isteğe bağlı kod)

Bu projede kayıt sonrası kullanıcı **e-postayı doğrulamadan** şifre ile giriş yapamaz.

**Önemli:** Supabase’in varsayılan **Confirm signup** şablonunda genelde yalnızca **`{{ .ConfirmationURL }}`** bağlantısı vardır; **sayısal kod satırı yoktur.** Arayüz hem bağlantıyı hem (şablona eklerseniz) kodu destekler. Kullanıcılar önce e-postadaki linke tıklayıp ardından giriş sayfasından oturum açmalıdır.

1. **E-postadaki bağlantı** — `{{ .ConfirmationURL }}` (varsayılan; zorunlu değil ama ana yöntem).
2. **6 haneli kod** — Şablona `{{ .Token }}` eklerseniz `login.html` üzerindeki alana girilebilir (`verifyOtp` + `type: 'signup'`).

## Supabase Dashboard ayarları

1. **Authentication** → **Providers** → **Email**
   - **Confirm email** açık olsun (kullanıcı e-postayı onaylamadan oturum açmasın).

2. **Authentication** → **URL Configuration**
   - **Site URL**: canlı site kök adresiniz (örn. `https://devretlink.com`).
   - **Redirect URLs** içine ekleyin (Vercel `cleanUrls` ile canlıda `/login` kullanılır):
     - `http://localhost:8000/login.html` ve `http://localhost:8000/login.html?verified=true`
     - `https://devretlink.com/login` ve `https://devretlink.com/login?verified=true`
     - İsteğe bağlı: `.../login.html` varyantları (eski linkler için).

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

---

## Türkçe e-posta şablonları (Dashboard)

Metinler **Supabase Dashboard** → **Authentication** → **Email** → **Templates** içinden düzenlenir. Konu satırı (Subject) ve gövde (Body) alanlarına aşağıdakileri yapıştırabilirsiniz. Değişkenler (`{{ ... }}`) silinmez; Supabase çalışma anında doldurur.

### 1) Kayıt doğrulama — **Confirm signup**

**Subject (konu):**
```text
Devret Link — E-posta adresinizi doğrulayın
```

**Body (HTML):**
```html
<h2>E-posta adresinizi doğrulayın</h2>
<p>Merhaba,</p>
<p>Devret Link’e kaydınız için teşekkürler. Hesabınızı etkinleştirmek için aşağıdaki bağlantıya tıklayın:</p>
<p><a href="{{ .ConfirmationURL }}">Hesabımı doğrula</a></p>
<p>İsterseniz bu doğrulama kodunu da kullanabilirsiniz:</p>
<p style="font-size:1.25rem;letter-spacing:0.15em;font-weight:bold">{{ .Token }}</p>
<p>Bu e-postayı siz talep etmediyseniz yok sayabilirsiniz.</p>
<p>Saygılarımızla,<br>Devret Link</p>
```

> **Not:** `{{ .Token }}` satırını istemezseniz o iki satırı silin; sadece bağlantı yeterlidir.

---

### 2) Şifre sıfırlama — **Reset password** (veya **Magic Link** / recovery şablonu)

Projede şifre sıfırlama, `recover` akışı ile **`reset-password.html`** sayfasına yönlendiren bağlantı kullanır. Şablonda genelde **`{{ .ConfirmationURL }}`** kullanılır (editörün altındaki “Available variables” listesine bakın; farklı isim gösteriyorsa onu kullanın).

**Subject (konu):**
```text
Devret Link — Şifre sıfırlama talebi
```

**Body (HTML):**
```html
<h2>Şifre sıfırlama</h2>
<p>Merhaba,</p>
<p>Hesabınız için şifre sıfırlama talebinde bulunuldu. Yeni şifre belirlemek için aşağıdaki bağlantıya tıklayın:</p>
<p><a href="{{ .ConfirmationURL }}">Yeni şifre oluştur</a></p>
<p>Bu talebi siz yapmadıysanız bu e-postayı yok sayın; mevcut şifreniz değişmez.</p>
<p>Bağlantı güvenlik nedeniyle kısa süre sonra geçersiz olabilir.</p>
<p>Saygılarımızla,<br>Devret Link</p>
```

**Redirect URL hatırlatması:** **Authentication** → **URL Configuration** → **Redirect URLs** içinde `https://devretlink.com/reset-password` ve `https://devretlink.com/reset-password.html` (ve localhost karşılıkları) tanımlı olmalı.

---

### Diğer şablonlar

**Change email address**, **Invite user** vb. için de aynı ekranda İngilizce metinleri Türkçe çevirerek değiştirebilirsiniz; önemli olan Supabase’in sunduğu `{{ .ConfirmationURL }}`, `{{ .Token }}`, `{{ .Email }}` gibi alanları aynen bırakmanızdır.
