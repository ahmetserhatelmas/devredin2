# DevredinPlatform - İşletme Devir Platformu

Türkiye'nin en büyük işletme devir platformu. İşletmenizi devredin veya hayalinizdeki işletmeyi devralın.

## 🚀 Özellikler

### Ana Özellikler
- ✅ **Ana Sayfa** - Modern hero section, kategoriler, öne çıkan ilanlar
- ✅ **İlanlar Sayfası** - Filtreleme, arama, sıralama, sayfalama
- ✅ **İlan Detay Sayfası** - Fotoğraf galerisi, detaylı bilgiler, iletişim
- ✅ **İlan Ver** - Kapsamlı form ile ilan oluşturma
- ✅ **Giriş/Kayıt** - Kullanıcı authentication sayfası

### Teknik Özellikler
- 📱 **Responsive Tasarım** - Tüm cihazlarda mükemmel görünüm
- 🎨 **Modern UI/UX** - Kullanıcı dostu arayüz
- ⚡ **Hızlı Performans** - Optimize edilmiş kod
- 🔍 **SEO Uyumlu** - Arama motorları için optimize
- ♿ **Erişilebilir** - WCAG standartlarına uygun

## 📁 Dosya Yapısı

```
devredin/
├── index.html              # Ana sayfa
├── listings.html           # İlanlar listesi sayfası
├── listing-detail.html     # İlan detay sayfası
├── add-listing.html        # İlan ekleme formu
├── login.html              # Giriş sayfası
├── styles.css              # Ana stil dosyası
├── listings.css            # İlanlar sayfası stilleri
├── listing-detail.css      # İlan detay stilleri
├── add-listing.css         # İlan ekleme stilleri
├── login.css               # Giriş sayfası stilleri
├── script.js               # Ana JavaScript
├── listings.js             # İlanlar sayfası JS
├── listing-detail.js       # İlan detay JS
└── README.md              # Bu dosya
```

## 🎨 Renk Paleti

- **Primary Color**: `#FF6B35` (Turuncu)
- **Secondary Color**: `#004E89` (Lacivert)
- **Accent Color**: `#1A659E` (Mavi)
- **Background**: `#f8fafc` (Açık gri)
- **Text**: `#1e293b` (Koyu gri)

## 🔧 Kullanım

### Kurulum

1. Projeyi indirin
2. Tarayıcınızda `index.html` dosyasını açın

### Geliştirme

Yerel bir server ile çalıştırmak için:

```bash
# Python ile
python -m http.server 8000

# Node.js ile (live-server)
npx live-server

# VS Code Live Server extension
# Sağ tık > Open with Live Server
```

## 📄 Sayfalar

### 1. Ana Sayfa (index.html)
- Hero bölümü ile arama
- Popüler kategoriler
- Öne çıkan ilanlar
- Nasıl çalışır bölümü
- İstatistikler
- CTA bölümü
- İletişim formu

### 2. İlanlar Sayfası (listings.html)
- Yan filtre paneli (Yer, Sektör, Fiyat, Metrekare)
- Arama ve sıralama
- Grid/List/Map görünüm
- Sayfalama
- 1113 ilan listesi

### 3. İlan Detay (listing-detail.html)
- Fotoğraf galerisi
- Detaylı açıklama
- İlan özellikleri
- Konum bilgisi
- İletişim kartı
- Benzer ilanlar

### 4. İlan Ver (add-listing.html)
- Temel bilgiler formu
- Konum seçimi
- İşletme özellikleri
- Finansal bilgiler
- Fotoğraf yükleme
- İletişim bilgileri

### 5. Giriş (login.html)
- Email/Şifre ile giriş
- Beni hatırla
- Şifremi unuttum
- Google ile giriş

## 🎯 Özelleştirme

### Renkleri Değiştirme

`styles.css` dosyasındaki CSS değişkenlerini düzenleyin:

```css
:root {
    --primary-color: #FF6B35;
    --secondary-color: #004E89;
    --accent-color: #1A659E;
    /* ... */
}
```

### İçerik Güncelleme

HTML dosyalarındaki metinleri düzenleyin:
- İlan başlıkları ve açıklamaları
- Kategori isimleri
- İletişim bilgileri
- Footer linkleri

### Logo Değiştirme

`.logo` class'ındaki içeriği güncelleyin veya bir `<img>` etiketi ekleyin.

## 🚀 Geliştirme Önerileri

### Backend Entegrasyonu
- Node.js + Express veya
- PHP + Laravel veya
- Python + Django/Flask

### Veritabanı
- PostgreSQL
- MongoDB
- MySQL

### Eklenebilecek Özellikler
- [ ] Gerçek kullanıcı kayıt/giriş sistemi
- [ ] Favori ilanlar
- [ ] İlan karşılaştırma
- [ ] Mesajlaşma sistemi
- [ ] Ödeme entegrasyonu
- [ ] Email bildirimleri
- [ ] Admin paneli
- [ ] İstatistik dashboard
- [ ] Mobil uygulama
- [ ] API geliştirme

## 📱 Tarayıcı Desteği

- ✅ Chrome (Son 2 versiyon)
- ✅ Firefox (Son 2 versiyon)
- ✅ Safari (Son 2 versiyon)
- ✅ Edge (Son 2 versiyon)
- ✅ Mobile browsers

## 📝 Lisans

Bu proje eğitim amaçlı oluşturulmuştur.

## 🤝 Katkıda Bulunma

1. Fork edin
2. Feature branch oluşturun (`git checkout -b feature/AmazingFeature`)
3. Commit edin (`git commit -m 'Add some AmazingFeature'`)
4. Push edin (`git push origin feature/AmazingFeature`)
5. Pull Request açın

## 📧 İletişim

Sorularınız için: info@devredinplatform.com

## 🎉 Teşekkürler

Bu projeyi kullandığınız için teşekkürler!

---

Made with ❤️ in Turkey

