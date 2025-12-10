# 🚀 HIZLI BAŞLANGIÇ REHBERİ

## ⚡ 5 Dakikada Başlayın!

### 1️⃣ Supabase Projesi Oluşturun (2 dk)

1. https://app.supabase.com adresine gidin
2. "New Project" tıklayın
3. Proje adı: `devredin-platform`
4. Güçlü bir database şifresi oluşturun
5. Region: Europe (Frankfurt)
6. "Create new project" tıklayın

### 2️⃣ Veritabanını Kurun (2 dk)

1. Supabase Dashboard'da **SQL Editor**'e gidin
2. `database/schema.sql` dosyasını açın
3. Tüm içeriği kopyalayın
4. SQL Editor'e yapıştırın
5. **"Run"** basın
6. ✅ Success! 10 tablo oluşturuldu

### 3️⃣ Storage Buckets (1 dk)

1. **Storage** menüsüne gidin
2. "New bucket" → `listing-images` (Public: ✅)
3. "New bucket" → `user-avatars` (Public: ✅)

### 4️⃣ API Keys'i Kopyalayın

**Settings > API** bölümünden:
- Project URL: `https://xxx.supabase.co`
- anon/public key: `eyJhbGc...`

### 5️⃣ Frontend'i Bağlayın

**Option A: CDN Kullanımı (En Kolay)**

Mevcut HTML dosyalarınızın `<head>` bölümüne ekleyin:

```html
<!-- Supabase JS -->
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>

<script>
  const supabase = window.supabase.createClient(
    'YOUR_SUPABASE_URL',
    'YOUR_SUPABASE_ANON_KEY'
  )
</script>

<!-- Backend API -->
<script src="backend/api.js"></script>
```

**Option B: NPM Kullanımı**

```bash
cd /Users/ase/Desktop/devredin
npm install
```

## 🎯 Şimdi Ne Yapmalı?

### İlanları Yükleyin

```html
<script>
  // İlanları yükle ve göster
  async function loadListings() {
    const { data } = await supabase
      .from('listings')
      .select('*, category:categories(*), city:cities(*), images:listing_images(*)')
      .eq('status', 'active')
      .limit(10)
    
    console.log('Listings:', data)
    // Data'yı HTML'e dönüştürün
  }
  
  loadListings()
</script>
```

### Kullanıcı Girişi

```html
<script>
  async function login(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    
    if (error) {
      alert('Giriş hatası: ' + error.message)
    } else {
      alert('Giriş başarılı!')
      window.location.href = 'index.html'
    }
  }
</script>
```

### İlan Oluşturma

```html
<script>
  async function createListing(formData) {
    const user = await supabase.auth.getUser()
    
    const { data, error } = await supabase
      .from('listings')
      .insert([{
        user_id: user.data.user.id,
        title: formData.title,
        description: formData.description,
        price: formData.price,
        category_id: formData.categoryId,
        city_id: formData.cityId,
        status: 'pending'
      }])
    
    if (!error) {
      alert('İlan oluşturuldu! Admin onayı bekleniyor.')
    }
  }
</script>
```

## 📚 Dosya Yapısı

```
devredin/
├── 📄 index.html                  # Ana sayfa (backende bağlayın)
├── 📄 listings.html               # İlanlar sayfası
├── 📄 listing-detail.html         # İlan detay
├── 📄 add-listing.html            # İlan ekleme formu
├── 📄 login.html                  # Giriş sayfası
│
├── 🎨 styles.css                  # Ana stiller
├── 🎨 listings.css
├── 🎨 listing-detail.css
├── 🎨 add-listing.css
├── 🎨 login.css
│
├── ⚡ script.js                   # Ana JavaScript
├── ⚡ listings.js
├── ⚡ listing-detail.js
│
├── 📁 backend/
│   ├── api.js                     # ⭐ BACKEND API (KULLANIN)
│   ├── supabase.js                # Supabase fonksiyonları
│   └── example-integration.html   # Entegrasyon örneği
│
└── 📁 database/
    ├── schema.sql                 # ⭐ Veritabanı şeması
    └── SETUP.md                   # Detaylı kurulum

```

## 🔥 Önemli Dosyalar

1. **database/schema.sql** → Supabase SQL Editor'de çalıştırın
2. **backend/api.js** → Tüm backend fonksiyonları burada
3. **backend/example-integration.html** → Nasıl kullanılacağını gösterir

## 📝 HTML Dosyalarınızı Güncelleyin

### index.html'e Ekleyin

`</body>` etiketinden önce:

```html
<!-- Supabase -->
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>

<script>
  const supabase = window.supabase.createClient(
    'YOUR_SUPABASE_URL',
    'YOUR_ANON_KEY'
  )
</script>

<!-- Backend API -->
<script src="backend/api.js"></script>

<!-- İlanları yükle -->
<script>
  document.addEventListener('DOMContentLoaded', async () => {
    const result = await loadListings({ limit: 6 })
    
    if (result.success) {
      const container = document.querySelector('.listings-grid')
      container.innerHTML = result.data.map(listing => 
        createListingHTML(listing)
      ).join('')
    }
  })
  
  function createListingHTML(listing) {
    return `
      <div class="listing-card">
        <h3>${listing.title}</h3>
        <p>${listing.city.name}</p>
        <span>${formatPrice(listing.price)}</span>
      </div>
    `
  }
</script>
```

### listings.html'e Ekleyin

Aynı script'leri ekleyin + filtreleme mantığı:

```html
<script>
  async function filterListings() {
    const categoryId = document.querySelector('#categoryFilter').value
    const minPrice = document.querySelector('#minPrice').value
    const maxPrice = document.querySelector('#maxPrice').value
    
    const result = await loadListings({
      categoryId,
      minPrice,
      maxPrice,
      limit: 20
    })
    
    // Sonuçları göster
    displayListings(result.data)
  }
</script>
```

### login.html'e Ekleyin

Login form submit event'i:

```html
<script>
  document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault()
    
    const email = document.querySelector('[name="email"]').value
    const password = document.querySelector('[name="password"]').value
    
    const result = await loginUser(email, password)
    
    if (result.success) {
      alert('Giriş başarılı!')
      window.location.href = 'index.html'
    } else {
      alert('Hata: ' + result.error)
    }
  })
</script>
```

### add-listing.html'e Ekleyin

Form submit event'i:

```html
<script>
  document.getElementById('addListingForm').addEventListener('submit', async (e) => {
    e.preventDefault()
    
    const formData = new FormData(e.target)
    const listingData = {
      title: formData.get('title'),
      description: formData.get('description'),
      category_id: parseInt(formData.get('category')),
      city_id: parseInt(formData.get('city')),
      district_id: parseInt(formData.get('district')),
      sector: formData.get('sector'),
      area_sqm: parseInt(formData.get('area')),
      price: parseFloat(formData.get('price')),
      monthly_rent: parseFloat(formData.get('rent')),
      contact_name: formData.get('contact_name'),
      contact_phone: formData.get('phone'),
      contact_email: formData.get('email')
    }
    
    const result = await createListing(listingData)
    
    if (result.success) {
      alert('✅ İlanınız oluşturuldu! Admin onayı sonrası yayınlanacak.')
      window.location.href = 'listings.html'
    } else {
      alert('❌ Hata: ' + result.error)
    }
  })
</script>
```

## ✅ Kontrol Listesi

- [ ] Supabase projesi oluşturuldu
- [ ] schema.sql çalıştırıldı
- [ ] Storage buckets oluşturuldu
- [ ] API keys kopyalandı
- [ ] backend/api.js'e keys eklendi
- [ ] HTML dosyalarına Supabase script eklendi
- [ ] Test kullanıcısı oluşturuldu
- [ ] Test ilanı eklendi
- [ ] Tarayıcıda test edildi

## 🧪 Test Edin

1. Browser'da index.html'i açın
2. Console'u açın (F12)
3. Şunu yazın:

```javascript
// Kategorileri test et
const { data } = await supabase.from('categories').select('*')
console.log('Categories:', data)

// İlanları test et
const { data: listings } = await supabase.from('listings').select('*')
console.log('Listings:', listings)
```

## 🎉 Tamamlandı!

Artık tam çalışan bir backend'iniz var!

## 🆘 Sorun mu Var?

### Hata: "relation does not exist"
➡️ schema.sql'i çalıştırın

### Hata: "Invalid API key"
➡️ API key'leri kontrol edin

### Hata: "RLS policy violated"
➡️ Kullanıcı girişi yapın veya RLS policies kontrol edin

### Console'da hata yok ama çalışmıyor
➡️ Network tab'ı kontrol edin, 401/403 var mı?

## 📖 Detaylı Dokümantasyon

- **database/SETUP.md** - Tam kurulum rehberi
- **backend/api.js** - Tüm fonksiyonlar açıklamalı
- **backend/example-integration.html** - Çalışan örnek

## 🚀 Production'a Deploy

1. Vercel/Netlify'a deploy edin
2. Environment variables ekleyin
3. Custom domain bağlayın
4. SSL sertifikası otomatik gelir

---

**Başarılar! 🎉**

