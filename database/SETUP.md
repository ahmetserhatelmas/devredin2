# SUPABASE KURULUM REHBERİ

## 🚀 Adım 1: Supabase Projesi Oluşturun

1. [Supabase Dashboard](https://app.supabase.com) adresine gidin
2. "New Project" butonuna tıklayın
3. Proje bilgilerini girin:
   - Project name: `devretlink` (veya tercih ettiğiniz ad)
   - Database Password: Güçlü bir şifre oluşturun (kaydedin!)
   - Region: Europe (Frankfurt) veya yakınınız
4. "Create new project" tıklayın (2-3 dakika sürer)

## 📊 Adım 2: Veritabanı Şemasını Oluşturun

1. Supabase Dashboard'da sol menüden **"SQL Editor"** seçin
2. "New query" butonuna tıklayın
3. `database/schema.sql` dosyasının içeriğini kopyalayın
4. SQL Editor'e yapıştırın
5. **"Run"** butonuna basın
6. ✅ Success mesajı görmelisiniz

**Alternatif:** Terminal'den çalıştırın:
```bash
psql -h db.xxx.supabase.co -U postgres -d postgres -f database/schema.sql
```

## 🗂️ Adım 3: Storage Buckets Oluşturun

1. Sol menüden **"Storage"** seçin
2. "New bucket" butonuna tıklayın
3. İki bucket oluşturun:

### Bucket 1: listing-images
- Name: `listing-images`
- Public bucket: ✅ Aktif
- "Create bucket" tıklayın

### Bucket 2: user-avatars
- Name: `user-avatars`
- Public bucket: ✅ Aktif
- "Create bucket" tıklayın

### Storage Policies Ekleyin

Her bucket için:
1. Bucket'a tıklayın
2. "Policies" tabına gidin
3. "New Policy" tıklayın

**listing-images için policies:**

```sql
-- Anyone can view images
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'listing-images' );

-- Authenticated users can upload
CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'listing-images' 
  AND auth.role() = 'authenticated'
);

-- Users can delete their own images
CREATE POLICY "Users can delete own images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'listing-images'
  AND auth.uid()::text = (storage.foldername(name))[1]
);
```

## 🔑 Adım 4: API Keys'leri Alın

1. Sol menüden **"Settings" > "API"** seçin
2. Şu bilgileri kopyalayın:
   - **Project URL:** `https://xxx.supabase.co`
   - **anon/public key:** `eyJhbGc...` (uzun bir token)

## 📦 Adım 5: Frontend Kurulumu

### NPM Paketlerini Kurun

```bash
cd /path/to/proje
npm init -y
npm install @supabase/supabase-js
```

### .env Dosyası Oluşturun

```bash
# Proje kök dizininde .env dosyası oluşturun
touch .env
```

`.env` dosyasına ekleyin:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

⚠️ **Önemli:** `.env` dosyasını `.gitignore`'a ekleyin!

```bash
echo ".env" >> .gitignore
echo "node_modules/" >> .gitignore
```

## 🌐 Adım 6: HTML'de Supabase'i Kullanın

HTML dosyalarınızın `<head>` bölümüne ekleyin:

```html
<!-- Supabase Client -->
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
<script>
  // Supabase client'ı initialize et
  const SUPABASE_URL = 'YOUR_SUPABASE_URL'
  const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY'
  
  const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
</script>
```

## 🧪 Adım 7: Test Edin

### SQL Editor'de Test Sorguları

```sql
-- Kategori sayısını kontrol et
SELECT COUNT(*) FROM categories;
-- Sonuç: 10 olmalı

-- Şehir sayısını kontrol et
SELECT COUNT(*) FROM cities;
-- Sonuç: 8 olmalı

-- İstanbul'un ilçelerini göster
SELECT d.name, c.name as city
FROM districts d
JOIN cities c ON d.city_id = c.id
WHERE c.slug = 'istanbul';
```

### JavaScript ile Test

Tarayıcı konsolunda:

```javascript
// Kategorileri getir
const { data, error } = await supabase
  .from('categories')
  .select('*')

console.log('Categories:', data)
```

## 🔒 Adım 8: Authentication Kurulumu

1. Sol menüden **"Authentication" > "Providers"** seçin
2. Email provider'ı aktif edin
3. **Google OAuth** için (opsiyonel):
   - Google Cloud Console'da OAuth client oluşturun
   - Client ID ve Secret'ı Supabase'e girin

### Email Templates Ayarlayın

**Authentication > Email Templates** bölümünden:
- Confirmation email
- Reset password email
- Magic link email

Şablonları Türkçeleştirin!

## 📧 Adım 9: SMTP Ayarları (Opsiyonel)

Production için kendi SMTP sunucunuzu kullanın:

**Settings > Auth > SMTP Settings:**
```
Host: smtp.gmail.com
Port: 587
Username: your-email@gmail.com
Password: your-app-password
Sender email: kendi domain noreply adresiniz (ör. noreply@devretlink.com)
```

## 🎯 Adım 10: Test Verisi Ekleyin

SQL Editor'de test ilanı oluşturun:

```sql
-- Test kullanıcısı oluştur (önce Supabase Auth'dan kayıt olun)
-- Sonra test ilanı ekleyin:

INSERT INTO listings (
  user_id,
  category_id,
  title,
  slug,
  description,
  city_id,
  district_id,
  sector,
  area_sqm,
  establishment_year,
  employee_count,
  is_franchise,
  price,
  monthly_rent,
  contact_name,
  contact_phone,
  contact_email,
  status
) VALUES (
  'YOUR_USER_ID', -- Auth'dan kullanıcı ID'nizi alın
  1, -- Yeme-İçme kategorisi
  'Test Restoran Devren Kiralık',
  'test-restoran-devren-kiralik',
  'Bu bir test ilanıdır. Harika bir lokasyonda...',
  (SELECT id FROM cities WHERE slug = 'istanbul'),
  (SELECT id FROM districts WHERE slug = 'sisli' AND city_id = (SELECT id FROM cities WHERE slug = 'istanbul')),
  'Restoran',
  150,
  2020,
  5,
  false,
  2500000,
  35000,
  'Test Kullanıcı',
  '0532 123 45 67',
  'test@example.com',
  'active'
);
```

## 🔍 Adım 11: RPC Functions Oluşturun

Bazı özel fonksiyonlar için SQL Editor'de:

```sql
-- View count artırma fonksiyonu
CREATE OR REPLACE FUNCTION increment_view_count(listing_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE listings
  SET view_count = view_count + 1
  WHERE id = listing_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

## 📱 Adım 12: Realtime Ayarları (Opsiyonel)

**Database > Replication** bölümünden:
- `listings` tablosunu Realtime için aktif edin
- `messages` tablosunu aktif edin

Bu sayede yeni ilanlar ve mesajlar gerçek zamanlı gelir!

## 🚨 Güvenlik Kontrolleri

✅ RLS (Row Level Security) tüm tablolarda aktif
✅ Auth policies doğru ayarlanmış
✅ API keys güvenli saklanıyor (.env)
✅ Storage policies ayarlanmış
✅ Email verification aktif

## 🎉 Tamamlandı!

Artık Supabase backend'iniz hazır!

## 📚 Sonraki Adımlar

1. Frontend kodlarını backend'e bağlayın (`backend/api.js` kullanın)
2. Image upload özelliğini test edin
3. Authentication flow'u test edin
4. Production'a deploy edin (Vercel/Netlify)

## 🆘 Sorun Giderme

### Hata: "relation does not exist"
- SQL şemasının düzgün çalıştığından emin olun
- Database > Tables'da tabloları kontrol edin

### Hata: "RLS policy violated"
- Authentication yapıldığından emin olun
- RLS policies'i kontrol edin

### Hata: "Storage bucket not found"
- Storage buckets'ların oluşturulduğundan emin olun
- Bucket adlarının doğru olduğunu kontrol edin

## 📞 Destek

Supabase Documentation: https://supabase.com/docs
Community: https://github.com/supabase/supabase/discussions

