// Listings Page JavaScript - Dynamic Filtering

// Sayfa yüklendiğinde
document.addEventListener('DOMContentLoaded', async () => {
    console.log('📋 İlanlar sayfası yükleniyor...')
    
    // URL parametrelerini oku
    await parseURLParams()
    
    // Kategorileri yükle
    await loadCategoriesFilter()
    
    // Şehirleri yükle
    await loadCitiesFilter()
    
    // URL'den gelen filtreleri UI'a uygula
    await applyFiltersToUI()
    
    // İlanları yükle
    await loadListings()
})

// URL parametrelerini oku ve filtrelere uygula
async function parseURLParams() {
    const params = new URLSearchParams(window.location.search)
    
    // Kategori
    const categoryId = params.get('category')
    if (categoryId) {
        currentFilters.category = [parseInt(categoryId)]
        console.log('🏷️ URL\'den kategori:', categoryId)
    }
    
    // Şehir
    const cityId = params.get('city')
    if (cityId) {
        currentFilters.city = parseInt(cityId)
        console.log('🏙️ URL\'den şehir:', cityId)
    }
    
    // Arama
    const search = params.get('search')
    if (search) {
        currentFilters.search = search
        console.log('🔍 URL\'den arama:', search)
    }
}

// Filtreleri UI elementlerine uygula
async function applyFiltersToUI() {
    // Şehir dropdown'ını güncelle
    if (currentFilters.city) {
        const citySelect = document.getElementById('cityFilter')
        if (citySelect) {
            citySelect.value = currentFilters.city
        }
    }
    
    // Kategori radio'sunu güncelle
    if (currentFilters.category.length > 0) {
        const categoryId = currentFilters.category[0]
        const categoryRadio = document.querySelector(`input[name="mainCategory"][value="${categoryId}"]`)
        if (categoryRadio) {
            categoryRadio.checked = true
            // Sektörleri yükle (handleMainCategoryChange çağırmadan)
            await loadSubcategoriesForCategory(categoryId)
        }
    }
    
    // Arama inputunu güncelle
    if (currentFilters.search) {
        const searchInput = document.querySelector('.search-bar-compact input')
        if (searchInput) {
            searchInput.value = currentFilters.search
        }
    }
}

// Belirli kategori için sektörleri yükle (ilanları yeniden yüklemeden)
async function loadSubcategoriesForCategory(categoryId) {
    const subcategoryGroup = document.getElementById('subcategoryFilterGroup')
    if (subcategoryGroup) {
        subcategoryGroup.style.display = 'block'
    }
    
    try {
        const { data, error } = await supabase
            .from('categories')
            .select('id, name, slug, icon')
            .eq('parent_id', categoryId)
            .order('name')
        
        if (error) throw error
        
        const filterContent = document.getElementById('subcategoryFilterContent')
        
        if (data.length === 0) {
            filterContent.innerHTML = '<p style="color: #94a3b8; font-size: 0.9rem;">Bu kategoride sektör yok</p>'
            return
        }
        
        filterContent.innerHTML = data.map(sub => `
            <label class="checkbox-label" style="display: flex; align-items: center; gap: 0.5rem; padding: 0.4rem 0; cursor: pointer;">
                <input type="checkbox" name="subcategory" value="${sub.id}" onchange="handleSubcategoryChange()">
                <span>${sub.icon || '📌'} ${sub.name}</span>
            </label>
        `).join('')
        
        console.log('✅ Sektörler yüklendi:', data.length)
        
    } catch (error) {
        console.error('❌ Sektör yükleme hatası:', error)
    }
}

// Global filtre durumu
let currentFilters = {
    search: '',
    category: [],
    subcategory: [],
    city: null,
    minPrice: null,
    maxPrice: null,
    minArea: null,
    maxArea: null,
    features: [],
    sort: 'newest',
    page: 1
}

// İlanları yükle
async function loadListings() {
    const grid = document.getElementById('listingsGrid')
    
    grid.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 3rem;">
            <p style="font-size: 1.2rem; color: #64748b;">⏳ İlanlar yükleniyor...</p>
        </div>
    `
    
    try {
        let query = supabase
            .from('listings')
            .select(`
                *,
                category:categories!category_id(id, name, slug),
                subcategory:categories!subcategory_id(id, name, slug),
                city:cities(id, name),
                district:districts(id, name),
                images:listing_images(image_url, is_primary)
            `, { count: 'exact' })
            .in('status', ['active', 'pending'])
        
        // Kategori filtresi
        if (currentFilters.category.length > 0) {
            query = query.in('category_id', currentFilters.category)
        }
        
        // Sektör (alt kategori) filtresi
        if (currentFilters.subcategory.length > 0) {
            query = query.in('subcategory_id', currentFilters.subcategory)
        }
        
        // Şehir filtresi
        if (currentFilters.city) {
            query = query.eq('city_id', currentFilters.city)
        }
        
        // Fiyat filtresi
        if (currentFilters.minPrice) {
            query = query.gte('price', currentFilters.minPrice)
        }
        if (currentFilters.maxPrice) {
            query = query.lte('price', currentFilters.maxPrice)
        }
        
        // Alan filtresi
        if (currentFilters.minArea) {
            query = query.gte('area_sqm', currentFilters.minArea)
        }
        if (currentFilters.maxArea) {
            query = query.lte('area_sqm', currentFilters.maxArea)
        }
        
        // Arama filtresi
        if (currentFilters.search) {
            query = query.or(`title.ilike.%${currentFilters.search}%,description.ilike.%${currentFilters.search}%`)
        }
        
        // Özellik filtreleri
        if (currentFilters.features.includes('franchise')) {
            query = query.eq('is_franchise', true)
        }
        
        // Sıralama
        switch (currentFilters.sort) {
            case 'newest':
                query = query.order('created_at', { ascending: false })
                break
            case 'oldest':
                query = query.order('created_at', { ascending: true })
                break
            case 'price-high':
                query = query.order('price', { ascending: false })
                break
            case 'price-low':
                query = query.order('price', { ascending: true })
                break
            case 'area-high':
                query = query.order('area_sqm', { ascending: false })
                break
        }
        
        // Sayfalama
        const perPage = 12
        const from = (currentFilters.page - 1) * perPage
        const to = from + perPage - 1
        query = query.range(from, to)
        
        const { data, error, count } = await query
        
        if (error) throw error
        
        // Toplam sayıyı güncelle
        const totalCountEl = document.getElementById('totalListingCount')
        if (totalCountEl) {
            totalCountEl.textContent = count || 0
        }
        
        if (!data || data.length === 0) {
            grid.innerHTML = `
                <div style="grid-column: 1/-1; text-align: center; padding: 3rem;">
                    <h3 style="color: #1e293b; margin-bottom: 1rem;">🔍 Sonuç Bulunamadı</h3>
                    <p style="color: #64748b;">Filtrelerinizi değiştirmeyi deneyin</p>
                    <button onclick="clearAllFilters()" class="btn btn-primary" style="margin-top: 1rem;">Filtreleri Temizle</button>
                </div>
            `
            updatePagination(0, perPage)
            return
        }
        
        // İlanları render et
        grid.innerHTML = data.map(listing => createListingCard(listing)).join('')
        
        // Sayfalamayı güncelle
        updatePagination(count, perPage)
        
        console.log(`✅ ${data.length} ilan yüklendi (Toplam: ${count})`)
        
    } catch (error) {
        console.error('❌ İlanlar yüklenirken hata:', error)
        grid.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 3rem;">
                <h3 style="color: #ef4444;">❌ Hata Oluştu</h3>
                <p style="color: #64748b;">${error.message}</p>
                <button onclick="loadListings()" class="btn btn-primary" style="margin-top: 1rem;">Tekrar Dene</button>
            </div>
        `
    }
}

// İlan kartı oluştur
function createListingCard(listing) {
    const primaryImage = listing.images?.find(img => img.is_primary) || listing.images?.[0]
    const imageStyle = primaryImage ? 
        `background-image: url('${primaryImage.image_url}'); background-size: cover; background-position: center;` :
        `background: #f1f5f9; display: flex; align-items: center; justify-content: center;`
    const noImageIcon = !primaryImage ? '<span style="font-size: 3rem; opacity: 0.3;">🏪</span>' : ''
    
    return `
        <a href="listing-detail.html?id=${listing.id}" class="listing-card">
            <div class="listing-image" style="${imageStyle}">
                ${noImageIcon}
                <span class="listing-badge">${listing.category?.name || 'Kategori'}</span>
                <button class="favorite-btn" onclick="event.preventDefault(); toggleFav('${listing.id}')" style="width: 32px; height: 32px; border-radius: 50%; background: white; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center;">
                    ❤️
                </button>
            </div>
            <div class="listing-content">
                <h3>${listing.title}</h3>
                <div class="listing-location">
                    📍 ${listing.district?.name || ''}, ${listing.city?.name || ''}
                </div>
                <div class="listing-details">
                    <span>📐 ${listing.area_sqm || 0} m²</span>
                    <span>💰 Kira: ${formatPrice(listing.monthly_rent)}</span>
                    <span>📅 ${listing.establishment_year || '-'}</span>
                </div>
                <div class="listing-footer">
                    <span class="listing-price">${formatPrice(listing.price)}</span>
                    <span class="listing-date">${formatDate(listing.created_at)}</span>
                </div>
            </div>
        </a>
    `
}

// Ana kategorileri filtre olarak yükle (parent_id = null)
async function loadCategoriesFilter() {
    try {
        const { data, error } = await supabase
            .from('categories')
            .select('id, name, slug, icon')
            .is('parent_id', null)
            .order('name')
        
        if (error) throw error
        
        const filterContent = document.getElementById('categoryFilterContent')
        if (filterContent && data) {
            filterContent.innerHTML = data.map(cat => `
                <label class="checkbox-label" style="display: flex; align-items: center; gap: 0.5rem; padding: 0.5rem 0; cursor: pointer;">
                    <input type="radio" name="mainCategory" value="${cat.id}" onchange="handleMainCategoryChange(${cat.id})">
                    <span>${cat.icon || '📁'} ${cat.name}</span>
                </label>
            `).join('')
        }
        
        console.log('✅ Ana kategoriler yüklendi:', data.length)
    } catch (error) {
        console.error('❌ Kategori yükleme hatası:', error)
    }
}

// Ana kategori seçildiğinde sektörleri (alt kategorileri) yükle
async function handleMainCategoryChange(categoryId) {
    currentFilters.category = [categoryId]
    currentFilters.subcategory = []
    currentFilters.page = 1
    
    // Sektör filter grubunu göster
    const subcategoryGroup = document.getElementById('subcategoryFilterGroup')
    subcategoryGroup.style.display = 'block'
    
    try {
        const { data, error } = await supabase
            .from('categories')
            .select('id, name, slug, icon')
            .eq('parent_id', categoryId)
            .order('name')
        
        if (error) throw error
        
        const filterContent = document.getElementById('subcategoryFilterContent')
        
        if (data.length === 0) {
            filterContent.innerHTML = '<p style="color: #94a3b8; font-size: 0.9rem;">Bu kategoride sektör yok</p>'
            loadListings()
            return
        }
        
        filterContent.innerHTML = data.map(sub => `
            <label class="checkbox-label" style="display: flex; align-items: center; gap: 0.5rem; padding: 0.4rem 0; cursor: pointer;">
                <input type="checkbox" name="subcategory" value="${sub.id}" onchange="handleSubcategoryChange()">
                <span>${sub.icon || '📌'} ${sub.name}</span>
            </label>
        `).join('')
        
        console.log('✅ Sektörler yüklendi:', data.length)
        
        // İlanları yükle
        loadListings()
        
    } catch (error) {
        console.error('❌ Sektör yükleme hatası:', error)
    }
}

// Sektör (alt kategori) değişikliği
function handleSubcategoryChange() {
    const checked = document.querySelectorAll('input[name="subcategory"]:checked')
    currentFilters.subcategory = Array.from(checked).map(cb => parseInt(cb.value))
    currentFilters.page = 1
    console.log('🏪 Sektör filtresi:', currentFilters.subcategory)
    loadListings()
}

// Şehirleri filtre olarak yükle
async function loadCitiesFilter() {
    try {
        const { data, error } = await supabase
            .from('cities')
            .select('id, name')
            .order('name')
        
        if (error) throw error
        
        const citySelect = document.getElementById('cityFilter')
        if (citySelect && data) {
            citySelect.innerHTML = `
                <option value="">Tüm Şehirler</option>
                ${data.map(city => `<option value="${city.id}">${city.name}</option>`).join('')}
            `
            citySelect.addEventListener('change', handleCityChange)
        }
        
        console.log('✅ Şehirler yüklendi:', data.length)
    } catch (error) {
        console.error('❌ Şehir yükleme hatası:', error)
    }
}

// Şehir değişikliği
function handleCityChange() {
    const citySelect = document.getElementById('cityFilter')
    currentFilters.city = citySelect.value ? parseInt(citySelect.value) : null
    currentFilters.page = 1
    console.log('🏙️ Şehir filtresi:', currentFilters.city)
    loadListings()
}

// Fiyat değişikliği
function handlePriceChange() {
    const minPrice = document.getElementById('minPrice')
    const maxPrice = document.getElementById('maxPrice')
    currentFilters.minPrice = minPrice?.value ? parseInt(minPrice.value) : null
    currentFilters.maxPrice = maxPrice?.value ? parseInt(maxPrice.value) : null
    currentFilters.page = 1
    console.log('💰 Fiyat filtresi:', currentFilters.minPrice, '-', currentFilters.maxPrice)
}

// Alan değişikliği
function handleAreaChange() {
    const minArea = document.getElementById('minArea')
    const maxArea = document.getElementById('maxArea')
    currentFilters.minArea = minArea?.value ? parseInt(minArea.value) : null
    currentFilters.maxArea = maxArea?.value ? parseInt(maxArea.value) : null
    currentFilters.page = 1
    console.log('📐 Alan filtresi:', currentFilters.minArea, '-', currentFilters.maxArea)
}

// Gelişmiş filtre değişikliği
function handleFeatureChange() {
    const checked = document.querySelectorAll('input[name="feature"]:checked')
    currentFilters.features = Array.from(checked).map(cb => cb.value)
    currentFilters.page = 1
    console.log('⚙️ Özellik filtresi:', currentFilters.features)
}

// Filtrele butonuna tıklama
const filterButton = document.getElementById('filterButton')
if (filterButton) {
    filterButton.addEventListener('click', (e) => {
        e.preventDefault()
        console.log('🔍 Filtreleme başlatılıyor...')
        handlePriceChange()
        handleAreaChange()
        handleFeatureChange()
        loadListings()
    })
}

// Tüm filtreleri temizle
function clearAllFilters() {
    // Filtreleri sıfırla
    currentFilters = {
        search: '',
        category: [],
        subcategory: [],
        city: null,
        minPrice: null,
        maxPrice: null,
        minArea: null,
        maxArea: null,
        features: [],
        sort: 'newest',
        page: 1
    }
    
    // UI'ı temizle
    document.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.checked = false)
    document.querySelectorAll('input[type="radio"]').forEach(rb => rb.checked = false)
    document.querySelectorAll('.price-input').forEach(input => input.value = '')
    document.querySelectorAll('.filter-select').forEach(select => select.value = '')
    
    const cityFilter = document.getElementById('cityFilter')
    if (cityFilter) cityFilter.value = ''
    
    const sortSelect = document.querySelector('.sort-select')
    if (sortSelect) sortSelect.value = 'newest'
    
    const searchInput = document.querySelector('.search-bar-compact input')
    if (searchInput) searchInput.value = ''
    
    // Sektör filter grubunu gizle
    const subcategoryGroup = document.getElementById('subcategoryFilterGroup')
    if (subcategoryGroup) subcategoryGroup.style.display = 'none'
    
    // İlanları yeniden yükle
    loadListings()
    
    console.log('🗑️ Tüm filtreler temizlendi')
}

// Filter toggles
document.querySelectorAll('.filter-toggle').forEach(toggle => {
    toggle.addEventListener('click', () => {
        const content = toggle.nextElementSibling
        const icon = toggle.querySelector('.toggle-icon')
        
        if (content.style.display === 'none') {
            content.style.display = 'block'
            icon.textContent = '−'
        } else {
            content.style.display = 'none'
            icon.textContent = '+'
        }
    })
})

// View toggle
document.querySelectorAll('.view-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.view-btn').forEach(b => b.classList.remove('active'))
        btn.classList.add('active')
        
        const view = btn.dataset.view
        const grid = document.getElementById('listingsGrid')
        
        if (view === 'list') {
            grid.style.gridTemplateColumns = '1fr'
        } else if (view === 'grid') {
            grid.style.gridTemplateColumns = 'repeat(auto-fill, minmax(350px, 1fr))'
        } else if (view === 'map') {
            alert('Harita görünümü yakında eklenecek!')
        }
    })
})

// Clear filters button
const clearFiltersBtn = document.querySelector('.clear-filters')
if (clearFiltersBtn) {
    clearFiltersBtn.addEventListener('click', clearAllFilters)
}

// Sort functionality
const sortSelect = document.querySelector('.sort-select')
if (sortSelect) {
    sortSelect.addEventListener('change', (e) => {
        currentFilters.sort = e.target.value
        currentFilters.page = 1
        loadListings()
    })
}

// Search functionality
const searchBtn = document.querySelector('.btn-search-compact')
if (searchBtn) {
    searchBtn.addEventListener('click', () => {
        const searchInput = document.querySelector('.search-bar-compact input')
        currentFilters.search = searchInput.value.trim()
        currentFilters.page = 1
        loadListings()
    })
}

// Search on Enter
const searchInput = document.querySelector('.search-bar-compact input')
if (searchInput) {
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            currentFilters.search = searchInput.value.trim()
            currentFilters.page = 1
            loadListings()
        }
    })
}

// Sayfalama güncelle
function updatePagination(totalCount, perPage) {
    const totalPages = Math.ceil(totalCount / perPage)
    const paginationContainer = document.querySelector('.pagination')
    
    if (!paginationContainer) return
    
    if (totalPages <= 1) {
        paginationContainer.style.display = 'none'
        return
    }
    
    paginationContainer.style.display = 'flex'
    
    let paginationHTML = `
        <button class="page-btn" onclick="goToPage(${currentFilters.page - 1})" ${currentFilters.page === 1 ? 'disabled' : ''}>
            ← Önceki
        </button>
    `
    
    // İlk 5 sayfa
    for (let i = 1; i <= Math.min(5, totalPages); i++) {
        paginationHTML += `
            <button class="page-btn ${i === currentFilters.page ? 'active' : ''}" onclick="goToPage(${i})">
                ${i}
            </button>
        `
    }
    
    if (totalPages > 5) {
        paginationHTML += `<button class="page-btn" disabled>...</button>`
        paginationHTML += `
            <button class="page-btn ${totalPages === currentFilters.page ? 'active' : ''}" onclick="goToPage(${totalPages})">
                ${totalPages}
            </button>
        `
    }
    
    paginationHTML += `
        <button class="page-btn" onclick="goToPage(${currentFilters.page + 1})" ${currentFilters.page === totalPages ? 'disabled' : ''}>
            Sonraki →
        </button>
    `
    
    paginationContainer.innerHTML = paginationHTML
}

// Sayfaya git
function goToPage(page) {
    if (page < 1) return
    currentFilters.page = page
    loadListings()
    
    // Sayfanın üstüne scroll
    window.scrollTo({ top: 0, behavior: 'smooth' })
}

// Favori toggle
async function toggleFav(listingId) {
    const user = await getCurrentUser()
    if (!user) {
        alert('❤️ Favorilere eklemek için giriş yapmalısınız!')
        window.location.href = 'login.html'
        return
    }
    
    const result = await toggleFavorite(listingId)
    if (result.success) {
        alert(result.action === 'added' ? '❤️ Favorilere eklendi!' : '💔 Favorilerden çıkarıldı!')
    }
}

console.log('✅ Listings.js yüklendi!')
