// Listing Detail Page - Dynamic Content (Optimized)

let currentListing = null;

// ⚡ Sayfa yüklendiğinde HIZLI başlat
function initListingDetail() {
    console.log('📋 İlan detay sayfası yükleniyor...')
    
    // URL'den ilan ID'sini al (senkron - hızlı)
    const urlParams = new URLSearchParams(window.location.search)
    const listingId = urlParams.get('id')
    
    if (!listingId) {
        showError('İlan ID bulunamadı!')
        return
    }
    
    console.log('🔍 İlan ID:', listingId)
    
    // ⚡ İlanı hemen yükle (await yok - paralel)
    loadListingDetail(listingId)
}

// Sayfa hazır olduğunda başlat
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initListingDetail)
} else {
    initListingDetail()
}

// ⚡ OPTİMİZE: İlan detaylarını hızlı yükle
async function loadListingDetail(listingId) {
    try {
        // ⚡ Sadece gerekli alanları çek (performans için)
        const { data, error } = await supabase
            .from('listings')
            .select(`
                id, title, price, description, address, area_sqm, monthly_rent,
                monthly_revenue, monthly_profit, employee_count, establishment_year,
                lease_end_date, transfer_reason, is_franchise, inventory_value,
                equipment_value, contact_name, contact_phone, sector,
                category:categories!category_id(name, icon),
                city:cities(name),
                district:districts(name),
                images:listing_images(image_url, is_primary)
            `)
            .eq('id', listingId)
            .single()
        
        if (error) {
            console.error('Supabase hatası:', error)
            throw error
        }
        
        if (!data) {
            showError('İlan bulunamadı!')
            return
        }
        
        currentListing = data
        console.log('✅ İlan yüklendi:', data)
        
        // ⚡ Sayfayı HEMEN render et
        renderListingDetail(data)
        
        // ⚡ View count arka planda artır (beklemeden)
        incrementViewCount(listingId)
        
    } catch (error) {
        console.error('❌ İlan yükleme hatası:', error)
        showError('İlan yüklenirken bir hata oluştu: ' + (error.message || error))
    }
}

// Görüntülenme sayısını artır
async function incrementViewCount(listingId) {
    try {
        await supabase.rpc('increment_view_count', { listing_id: listingId })
    } catch (error) {
        console.log('View count artırılamadı:', error)
    }
}

// ⚡ İlan detaylarını hızlı render et
function renderListingDetail(listing) {
    // Sayfa başlığı
    document.title = `${listing.title} - DevredinPlatform`
    
    // ⚡ Loaded class ekle (skeleton'ları kaldır)
    document.body.classList.add('loaded')
    
    // Breadcrumb
    const breadcrumb = document.querySelector('.breadcrumb-detail')
    if (breadcrumb) {
        breadcrumb.innerHTML = `
            <a href="index.html">Ana Sayfa</a> / 
            <a href="listings.html">İlanlar</a> / 
            <span>${listing.title}</span>
        `
    }
    
    // İlan başlığı
    const titleEl = document.querySelector('.listing-title')
    if (titleEl) titleEl.textContent = listing.title
    
    // Fiyat
    const priceEl = document.querySelector('.detail-price')
    if (priceEl) priceEl.textContent = formatPrice(listing.price)
    
    // Konum bilgisi (sidebar)
    const locationInfo = document.querySelector('.info-location')
    if (locationInfo) {
        locationInfo.innerHTML = '' // Skeleton temizle
        const locText = listing.district?.name && listing.city?.name ? 
            `${listing.district.name} / ${listing.city.name}` : 
            listing.city?.name || 'Konum belirtilmemiş'
        locationInfo.textContent = locText
    }
    
    // ⚡ Ana görsel - hızlı yükleme
    const mainImage = document.querySelector('.main-image')
    if (mainImage) {
        mainImage.classList.remove('skeleton-image')
        const primaryImage = listing.images?.find(img => img.is_primary) || listing.images?.[0]
        if (primaryImage) {
            // Preload image for faster display
            const img = new Image()
            img.onload = () => {
                mainImage.innerHTML = `<img src="${primaryImage.image_url}" alt="${listing.title}" style="opacity: 0; transition: opacity 0.3s ease;">`
                setTimeout(() => {
                    mainImage.querySelector('img').style.opacity = '1'
                }, 50)
            }
            img.src = primaryImage.image_url
            // Fallback - show immediately
            mainImage.innerHTML = `<img src="${primaryImage.image_url}" alt="${listing.title}">`
        } else {
            mainImage.innerHTML = `
                <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white;">
                    <span style="font-size: 4rem;">📷</span>
                    <p>Görsel bulunmuyor</p>
                </div>
            `
        }
    }
    
    // Thumbnail'lar
    const thumbnailsContainer = document.querySelector('.thumbnails')
    if (thumbnailsContainer && listing.images?.length > 0) {
        thumbnailsContainer.innerHTML = listing.images.map((img, index) => `
            <div class="thumbnail ${index === 0 ? 'active' : ''}" onclick="changeMainImage('${img.image_url}', this)">
                <span>${index + 1}</span>
            </div>
        `).join('')
    }
    
    // Detay bilgileri
    updateDetailInfo('.info-sector', listing.sector || listing.category?.name || '-')
    updateDetailInfo('.info-area', listing.area_sqm ? `${listing.area_sqm} m²` : '-')
    updateDetailInfo('.info-rent', listing.monthly_rent ? formatPrice(listing.monthly_rent) : '-')
    updateDetailInfo('.info-lease-end', listing.lease_end_date || 'Belirlenmemiş')
    updateDetailInfo('.info-employees', listing.employee_count || '-')
    updateDetailInfo('.info-revenue', listing.monthly_revenue ? formatPrice(listing.monthly_revenue) : '-')
    updateDetailInfo('.info-profit', listing.monthly_profit ? formatPrice(listing.monthly_profit) : '-')
    
    // İlan sahibi bilgileri (skeleton'ları temizle)
    const ownerName = document.querySelector('.owner-name')
    if (ownerName) {
        ownerName.innerHTML = '' // Skeleton temizle
        ownerName.textContent = listing.contact_name || 'İlan Sahibi'
    }
    
    const ownerPhone = document.querySelector('.owner-phone')
    if (ownerPhone) {
        const phone = listing.contact_phone || ''
        ownerPhone.innerHTML = `📞 <span>${phone || 'Belirtilmemiş'}</span>`
        if (phone) ownerPhone.href = `tel:${phone}`
    }
    
    // Açıklama
    const descriptionEl = document.querySelector('.listing-description')
    if (descriptionEl) {
        descriptionEl.innerHTML = listing.description ? 
            listing.description.replace(/\n/g, '<br>') : 
            'Açıklama bulunmuyor.'
    }
    
    // Konum bilgisi
    const locationEl = document.querySelector('.listing-location-info')
    if (locationEl) {
        locationEl.innerHTML = `
            <p><strong>Adres:</strong> ${listing.address || '-'}</p>
            <p><strong>İlçe:</strong> ${listing.district?.name || '-'}</p>
            <p><strong>Şehir:</strong> ${listing.city?.name || '-'}</p>
        `
    }
    
    // İlan detayları tablosu
    const detailsTable = document.querySelector('.listing-details-table')
    if (detailsTable) {
        detailsTable.innerHTML = `
            <tr><td>İlan Tarihi:</td><td>${listing.created_at ? formatDate(listing.created_at) : '-'}</td></tr>
            <tr><td>Kategori:</td><td>${listing.category?.icon || ''} ${listing.category?.name || '-'}</td></tr>
            <tr><td>Sektör:</td><td>${listing.sector || '-'}</td></tr>
            <tr><td>Envanter:</td><td>${listing.inventory_value ? formatPrice(listing.inventory_value) : 'Belirtilmemiş'}</td></tr>
            <tr><td>Demirbaş:</td><td>${listing.equipment_value ? formatPrice(listing.equipment_value) : 'Belirtilmemiş'}</td></tr>
            <tr><td>Mobilya, Demirbaş ve Ekipman (FF&E):</td><td>Belirtilmemiş</td></tr>
            <tr><td>Destek ve Eğitim:</td><td>${listing.includes_training ? 'Evet' : 'Hayır'}</td></tr>
            <tr><td>Satış Sebebi:</td><td>${listing.transfer_reason || 'Sektör Değişikliği'}</td></tr>
            <tr><td>Kuruluş Tarihi:</td><td>${listing.establishment_year || 'Belirtilmemiş'}</td></tr>
            <tr><td>Franchise:</td><td>${listing.is_franchise ? 'Evet' : 'Hayır'}</td></tr>
            <tr><td>Kontrat Bitiş Tarihi:</td><td>${listing.lease_end_date ? formatDate(listing.lease_end_date) : 'Belirtilmemiş'}</td></tr>
        `
    }
    
    // WhatsApp ve Arama butonları
    setupContactButtons(listing)
}

// ⚡ Detay bilgisi güncelle (skeleton'ı temizle)
function updateDetailInfo(selector, value) {
    const el = document.querySelector(selector)
    if (el) {
        el.innerHTML = '' // Skeleton'ı temizle
        el.textContent = value
    }
}

// Ana görseli değiştir
function changeMainImage(imageUrl, thumbnail) {
    const mainImage = document.querySelector('.main-image')
    if (mainImage) {
        mainImage.innerHTML = `<img src="${imageUrl}" alt="İlan Görseli">`
    }
    
    document.querySelectorAll('.thumbnail').forEach(t => t.classList.remove('active'))
    thumbnail.classList.add('active')
}

// İletişim butonlarını ayarla
function setupContactButtons(listing) {
    const phone = listing.contact_phone || ''
    const cleanPhone = phone.replace(/\D/g, '')
    
    const whatsappBtn = document.querySelector('.btn-whatsapp')
    if (whatsappBtn && cleanPhone) {
        whatsappBtn.onclick = () => {
            window.open(`https://wa.me/90${cleanPhone}?text=Merhaba, ${listing.title} ilanınız hakkında bilgi almak istiyorum.`, '_blank')
        }
    }
    
    const callBtn = document.querySelector('.btn-call')
    if (callBtn && cleanPhone) {
        callBtn.onclick = () => {
            window.location.href = `tel:+90${cleanPhone}`
        }
    }
    
    const offerBtn = document.querySelector('.btn-offer')
    if (offerBtn) {
        offerBtn.onclick = () => {
            alert('Teklif gönderme özelliği yakında eklenecek!')
            // TODO: Teklif formu modal açılacak
        }
    }
}

// Hata göster
function showError(message) {
    const container = document.querySelector('.listing-detail-section .container')
    if (container) {
        container.innerHTML = `
            <div style="text-align: center; padding: 4rem;">
                <h2 style="color: #ef4444; margin-bottom: 1rem;">❌ ${message}</h2>
                <a href="listings.html" class="btn btn-primary">İlanlara Dön</a>
            </div>
        `
    }
}

// Navbar and handleLogout are now managed centrally by api.js

// Tab functionality
document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const targetTab = btn.dataset.tab
        
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'))
        document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'))
        
        btn.classList.add('active')
        document.getElementById(targetTab)?.classList.add('active')
    })
})

// Paylaşım butonları
document.querySelectorAll('.share-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const url = window.location.href
        
        if (btn.classList.contains('share-copy')) {
            navigator.clipboard.writeText(url).then(() => alert('Link kopyalandı!'))
        } else if (btn.classList.contains('share-facebook')) {
            window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank')
        } else if (btn.classList.contains('share-twitter')) {
            window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(currentListing?.title || '')}`, '_blank')
        } else if (btn.classList.contains('share-whatsapp')) {
            window.open(`https://wa.me/?text=${encodeURIComponent(currentListing?.title + ' ' + url)}`, '_blank')
        }
    })
})

console.log('✅ Listing detail JS yüklendi')
