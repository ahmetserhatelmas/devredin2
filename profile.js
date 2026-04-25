// Profile Page JavaScript

document.addEventListener('DOMContentLoaded', async () => {
    console.log('👤 Profil sayfası yükleniyor...')
    
    // Navbar is managed by api.js automatically
    
    // Check if user is logged in using cached data first
    const cachedUser = getCachedUser()
    
    if (!cachedUser) {
        // Verify with API
        const user = await getCurrentUser()
        if (!user) {
            alert('⚠️ Bu sayfayı görüntülemek için giriş yapmalısınız!')
            window.location.href = 'login.html'
            return
        }
    }
    
    // Profil bilgilerini yükle
    await loadProfile()
    
    // İlanları yükle
    await loadMyListings()
    
    // Favorileri yükle
    await loadFavorites()
})

// handleLogout is now handled by api.js

// Profil bilgilerini yükle
async function loadProfile() {
    try {
        const user = await getCurrentUser()
        
        const { data: profile, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', user.id)
            .single()
        
        if (profile) {
            document.getElementById('profileName').textContent = profile.full_name || 'Kullanıcı'
            document.getElementById('profileEmail').textContent = user.email
            document.getElementById('profilePhone').textContent = profile.phone || 'Telefon eklenmemiş'
            
            // Settings form'u doldur
            document.getElementById('editFullName').value = profile.full_name || ''
            document.getElementById('editPhone').value = profile.phone || ''
            
            console.log('✅ Profil yüklendi')
        }
    } catch (error) {
        console.error('❌ Profil yükleme hatası:', error)
    }
}

// Kullanıcının ilanlarını yükle
async function loadMyListings(statusFilter = 'all') {
    try {
        const user = await getCurrentUser()
        const container = document.getElementById('myListingsGrid')
        
        container.innerHTML = '<div class="loading">İlanlar yükleniyor...</div>'
        
        let query = supabase
            .from('listings')
            .select(`
                *,
                category:categories!category_id(name),
                city:cities(name),
                district:districts(name),
                images:listing_images(image_url, is_primary)
            `)
            .eq('user_id', user.id)
        
        if (statusFilter !== 'all') {
            query = query.eq('status', statusFilter)
        }
        
        const { data, error } = await query.order('created_at', { ascending: false })
        
        if (error) throw error
        
        // İstatistikleri güncelle
        updateStats(data)
        
        if (data.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                        <line x1="9" y1="9" x2="15" y2="15"/>
                        <line x1="15" y1="9" x2="9" y2="15"/>
                    </svg>
                    <h3>Henüz İlan Yok</h3>
                    <p>İlk ilanınızı oluşturarak başlayın</p>
                    <a href="add-listing.html" class="btn btn-primary">İlan Ver</a>
                </div>
            `
            return
        }
        
        container.innerHTML = data.map(listing => createMyListingCard(listing)).join('')
        
        console.log('✅ İlanlar yüklendi:', data.length)
    } catch (error) {
        console.error('❌ İlanlar yükleme hatası:', error)
        container.innerHTML = '<div class="empty-state"><p>İlanlar yüklenirken hata oluştu.</p></div>'
    }
}

// İstatistikleri güncelle
function updateStats(listings) {
    const total = listings.length
    const active = listings.filter(l => l.status === 'active').length
    const pending = listings.filter(l => l.status === 'pending').length
    
    document.getElementById('totalListings').textContent = total
    document.getElementById('activeListings').textContent = active
    document.getElementById('pendingListings').textContent = pending
}

// İlan kartı oluştur
function createMyListingCard(listing) {
    const statusText = {
        'active': 'Aktif',
        'pending': 'Bekleyen',
        'sold': 'Satıldı',
        'inactive': 'Pasif'
    }
    
    const primaryImage = listing.images?.find(img => img.is_primary) || listing.images?.[0]
    const imageStyle = primaryImage ? 
        `background-image: url('${primaryImage.image_url}'); background-size: cover; background-position: center;` :
        `background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);`
    
    return `
        <div class="profile-listing-card">
            <span class="listing-status-badge ${listing.status}">${statusText[listing.status] || 'Bilinmiyor'}</span>
            <div class="profile-listing-image" style="${imageStyle}"></div>
            <div class="profile-listing-content">
                <h3>${listing.title}</h3>
                <div class="listing-meta">
                    <span class="listing-price">${formatPrice(listing.price)}</span>
                    <span class="listing-views">👁️ ${listing.view_count || 0} görüntülenme</span>
                </div>
                <p style="font-size: 0.85rem; color: var(--gray-text);">
                    📍 ${listing.district?.name || ''}, ${listing.city?.name || ''}<br>
                    📅 ${formatDate(listing.created_at)}
                </p>
                <div class="listing-actions">
                    <button class="btn-edit" onclick="editListing('${listing.id}')">Düzenle</button>
                    <button class="btn-delete" onclick="deleteListing('${listing.id}')">Sil</button>
                </div>
            </div>
        </div>
    `
}

// Favorileri yükle
async function loadFavorites() {
    try {
        const user = await getCurrentUser()
        const container = document.getElementById('favoritesGrid')
        
        container.innerHTML = '<div class="loading">Favoriler yükleniyor...</div>'
        
        const { data, error } = await supabase
            .from('favorites')
            .select(`
                *,
                listing:listings(
                    *,
                    category:categories!category_id(name),
                    city:cities(name),
                    district:districts(name),
                    images:listing_images(image_url, is_primary)
                )
            `)
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
        
        if (error) throw error
        
        // Favori sayısını güncelle
        document.getElementById('favoriteCount').textContent = data.length
        
        if (data.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                    </svg>
                    <h3>Henüz Favori Yok</h3>
                    <p>Beğendiğiniz ilanları favorilerinize ekleyin</p>
                    <a href="listings.html" class="btn btn-primary">İlanları İncele</a>
                </div>
            `
            return
        }
        
        container.innerHTML = data.map(fav => createFavoriteCard(fav.listing)).join('')
        
        console.log('✅ Favoriler yüklendi:', data.length)
    } catch (error) {
        console.error('❌ Favoriler yükleme hatası:', error)
    }
}

// Favori kartı oluştur
function createFavoriteCard(listing) {
    if (!listing) return ''
    
    const primaryImage = listing.images?.find(img => img.is_primary) || listing.images?.[0]
    const imageStyle = primaryImage ? 
        `background-image: url('${primaryImage.image_url}'); background-size: cover;` :
        `background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);`
    
    return `
        <a href="listing-detail.html?id=${listing.id}" class="profile-listing-card">
            <div class="profile-listing-image" style="${imageStyle}"></div>
            <div class="profile-listing-content">
                <h3>${listing.title}</h3>
                <div class="listing-meta">
                    <span class="listing-price">${formatPrice(listing.price)}</span>
                </div>
                <p style="font-size: 0.85rem; color: var(--gray-text);">
                    📍 ${listing.district?.name || ''}, ${listing.city?.name || ''}
                </p>
            </div>
        </a>
    `
}

// Tab switching
const profileTabs = document.querySelectorAll('.profile-tab')
const tabPanes = document.querySelectorAll('.tab-pane')

profileTabs.forEach(tab => {
    tab.addEventListener('click', () => {
        const targetTab = tab.dataset.tab
        
        profileTabs.forEach(t => t.classList.remove('active'))
        tabPanes.forEach(pane => pane.classList.remove('active'))
        
        tab.classList.add('active')
        document.getElementById(targetTab).classList.add('active')
    })
})

// Status filter
const filterBtns = document.querySelectorAll('.filter-btn')
filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'))
        btn.classList.add('active')
        
        const status = btn.dataset.status
        loadMyListings(status)
    })
})

// Edit profile form
document.getElementById('editProfileForm').addEventListener('submit', async (e) => {
    e.preventDefault()
    
    const user = await getCurrentUser()
    const formData = new FormData(e.target)
    
    const { error } = await supabase
        .from('users')
        .update({
            full_name: formData.get('full_name'),
            phone: formData.get('phone'),
            updated_at: new Date().toISOString()
        })
        .eq('id', user.id)
    
    if (error) {
        alert('❌ Güncelleme hatası: ' + error.message)
    } else {
        alert('✅ Profil başarıyla güncellendi!')
        await loadProfile()
    }
})

// Change password form
document.getElementById('changePasswordForm').addEventListener('submit', async (e) => {
    e.preventDefault()
    
    const formData = new FormData(e.target)
    const newPassword = formData.get('new_password')
    const confirmPassword = formData.get('confirm_password')
    
    if (newPassword !== confirmPassword) {
        alert('❌ Şifreler eşleşmiyor!')
        return
    }
    
    const { error } = await supabase.auth.updateUser({
        password: newPassword
    })
    
    if (error) {
        alert('❌ Şifre değiştirme hatası: ' + error.message)
    } else {
        alert('✅ Şifreniz başarıyla değiştirildi!')
        e.target.reset()
    }
})

// Edit listing
function editListing(listingId) {
    window.location.href = 'add-listing.html?edit=' + encodeURIComponent(listingId)
}

// Delete listing
async function deleteListing(listingId) {
    if (!confirm('Bu ilanı silmek istediğinize emin misiniz? Bu işlem geri alınamaz!')) {
        return
    }
    
    try {
        const user = await getCurrentUser()
        
        const { error } = await supabase
            .from('listings')
            .delete()
            .eq('id', listingId)
            .eq('user_id', user.id)
        
        if (error) throw error
        
        alert('✅ İlan başarıyla silindi!')
        await loadMyListings()
    } catch (error) {
        alert('❌ İlan silinirken hata oluştu: ' + error.message)
        console.error('Delete error:', error)
    }
}

// Delete account
async function deleteAccount() {
    const confirm1 = confirm('⚠️ UYARI: Hesabınızı silmek istediğinize emin misiniz?\n\nBu işlem GERİ ALINAMAZ!')
    if (!confirm1) return
    
    const confirm2 = confirm('⚠️ SON UYARI: Tüm ilanlarınız, favorileriniz ve mesajlarınız silinecek!\n\nDevam etmek istiyor musunuz?')
    if (!confirm2) return
    
    try {
        const user = await getCurrentUser()
        
        // İlanları sil
        await supabase.from('listings').delete().eq('user_id', user.id)
        
        // Favorileri sil
        await supabase.from('favorites').delete().eq('user_id', user.id)
        
        // User kaydını sil
        await supabase.from('users').delete().eq('id', user.id)
        
        // Auth'dan sil (bu kısım manuel yapılmalı veya admin API gerektirir)
        alert('✅ Hesabınız silindi. Çıkış yapılıyor...')
        
        await logoutUser()
        window.location.href = 'index.html'
    } catch (error) {
        alert('❌ Hesap silinirken hata oluştu: ' + error.message)
        console.error('Delete account error:', error)
    }
}

console.log('✅ Profil sayfası yüklendi')

