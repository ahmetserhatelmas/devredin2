// Listing Detail Page - Dynamic Content

let currentListing = null;

// Sayfa yüklendiğinde
async function initListingDetail() {
    console.log('📋 İlan detay sayfası yükleniyor...')
    
    // URL'den ilan ID'sini al
    const urlParams = new URLSearchParams(window.location.search)
    const listingId = urlParams.get('id')
    
    if (!listingId) {
        showError('İlan ID bulunamadı!')
        return
    }
    
    console.log('🔍 İlan ID:', listingId)
    
    // İlanı yükle
    await loadListingDetail(listingId)
    
    // Kullanıcı durumunu kontrol et
    await checkUserStatus()
}

// Sayfa hazır olduğunda başlat
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initListingDetail)
} else {
    initListingDetail()
}

// İlan detaylarını yükle
async function loadListingDetail(listingId) {
    try {
        // Önce basit sorgu ile ilanı al
        const { data, error } = await supabase
            .from('listings')
            .select(`
                *,
                category:categories!category_id(id, name, slug, icon),
                city:cities(id, name),
                district:districts(id, name),
                images:listing_images(id, image_url, is_primary)
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
        
        // Görüntülenme sayısını artır
        await incrementViewCount(listingId)
        
        // Sayfayı render et
        renderListingDetail(data)
        
    } catch (error) {
        console.error('❌ İlan yükleme hatası:', error)
        console.error('Hata detayı:', JSON.stringify(error, null, 2))
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

// İlan detaylarını render et
function renderListingDetail(listing) {
    // Sayfa başlığı
    document.title = `${listing.title} - DevredinPlatform`
    
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
    
    // Ana görsel
    const mainImage = document.querySelector('.main-image')
    if (mainImage) {
        const primaryImage = listing.images?.find(img => img.is_primary) || listing.images?.[0]
        if (primaryImage) {
            mainImage.innerHTML = `<img src="${primaryImage.image_url}" alt="${listing.title}">`
        } else {
            mainImage.innerHTML = `
                <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; color: white;">
                    <span style="font-size: 4rem;">📷</span>
                    <p>Görseller yüklenecek</p>
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
    
    // İlan sahibi bilgileri
    const ownerName = document.querySelector('.owner-name')
    if (ownerName) ownerName.textContent = listing.contact_name || 'İlan Sahibi'
    
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
            <tr><td>Kategori</td><td>${listing.category?.name || '-'}</td></tr>
            <tr><td>Sektör</td><td>${listing.subcategory?.name || '-'}</td></tr>
            <tr><td>Metrekare</td><td>${listing.area_sqm ? listing.area_sqm + ' m²' : '-'}</td></tr>
            <tr><td>Kuruluş Yılı</td><td>${listing.establishment_year || '-'}</td></tr>
            <tr><td>Çalışan Sayısı</td><td>${listing.employee_count || '-'}</td></tr>
            <tr><td>Franchise</td><td>${listing.is_franchise ? 'Evet' : 'Hayır'}</td></tr>
            <tr><td>Aylık Kira</td><td>${listing.monthly_rent ? formatPrice(listing.monthly_rent) : '-'}</td></tr>
            <tr><td>Aylık Ciro</td><td>${listing.monthly_revenue ? formatPrice(listing.monthly_revenue) : '-'}</td></tr>
            <tr><td>Aylık Net Kâr</td><td>${listing.monthly_profit ? formatPrice(listing.monthly_profit) : '-'}</td></tr>
            <tr><td>Envanter Değeri</td><td>${listing.inventory_value ? formatPrice(listing.inventory_value) : '-'}</td></tr>
            <tr><td>Ekipman Değeri</td><td>${listing.equipment_value ? formatPrice(listing.equipment_value) : '-'}</td></tr>
            <tr><td>Devir Sebebi</td><td>${listing.transfer_reason || '-'}</td></tr>
        `
    }
    
    // WhatsApp ve Arama butonları
    setupContactButtons(listing)
}

// Detay bilgisi güncelle
function updateDetailInfo(selector, value) {
    const el = document.querySelector(selector)
    if (el) el.textContent = value
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

// Kullanıcı durumu kontrolü
async function checkUserStatus() {
    const user = await getCurrentUser()
    
    const navLoading = document.getElementById('navLoading')
    const loggedOut = document.getElementById('loggedOutButtons')
    const loggedIn = document.getElementById('loggedInButtons')
    const userName = document.getElementById('userName')
    
    if (navLoading) navLoading.style.display = 'none'
    
    if (user) {
        loggedOut.style.display = 'none'
        loggedIn.style.display = 'flex'
        
        const { data: profile } = await supabase
            .from('users')
            .select('full_name')
            .eq('id', user.id)
            .single()
        
        if (profile && profile.full_name) {
            userName.textContent = `👤 ${profile.full_name.split(' ')[0]}`
        }
    } else {
        loggedOut.style.display = 'flex'
        loggedIn.style.display = 'none'
    }
}

async function handleLogout() {
    if (confirm('Çıkış yapmak istediğinize emin misiniz?')) {
        await logoutUser()
        window.location.href = 'index.html'
    }
}

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
