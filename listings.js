// Listings Page JavaScript - Modern Filter Design

// Global filtre durumu
let currentFilters = {
    search: '',
    category: [],
    subcategory: [],
    city: null,
    cityName: '',
    minPrice: null,
    maxPrice: null,
    minArea: null,
    maxArea: null,
    features: [],
    sort: 'newest',
    page: 1
}

// Kategori verileri cache
let categoriesCache = []
let citiesCache = []

// Sayfa yüklendiğinde
document.addEventListener('DOMContentLoaded', async () => {
    console.log('📋 İlanlar sayfası yükleniyor...')
    
    // URL parametrelerini oku
    parseURLParams()
    
    // Accordion event listeners
    setupAccordions()
    
    // Filter button listeners
    setupFilterButtons()
    
    // Search listeners
    setupSearchListeners()
    
    // URL'den gelen filtreleri UI'a uygula
    applyFiltersToUI()
    
    // ⚡ HIZLI: İlanları önce yükle (en önemli veri)
    loadListings()
    
    // ⚡ PARALEL: Diğer verileri eşzamanlı yükle
    Promise.all([
        loadCategoriesOptimized(),
        loadCitiesFilter(),
        createPriceHistogramOptimized()
    ]).then(() => {
        setupPriceSlider()
        console.log('✅ Tüm filtreler yüklendi')
    })
})

// Accordion setup
function setupAccordions() {
    document.querySelectorAll('.accordion-header').forEach(header => {
        header.addEventListener('click', () => {
            const accordion = header.closest('.filter-accordion')
            const wasActive = accordion.classList.contains('active')
            
            // Diğer accordion'ları kapat
            document.querySelectorAll('.filter-accordion').forEach(acc => {
                acc.classList.remove('active')
            })
            
            // Tıklananı aç/kapat
            if (!wasActive) {
                accordion.classList.add('active')
            }
        })
    })
}

// ⚡ OPTİMİZE: Kategorileri tek sorguda yükle
async function loadCategoriesOptimized() {
    try {
        // Ana kategorileri çek
        const { data: categories, error } = await supabase
            .from('categories')
            .select('id, name, slug, icon')
            .is('parent_id', null)
            .order('name')
        
        if (error) throw error
        
        // Kategorileri hemen render et (sayısız)
        categoriesCache = categories.map(cat => ({ ...cat, count: '...' }))
        renderCategories(categoriesCache)
        
        // Arka planda ilan sayılarını tek sorguda çek
        const { data: listings } = await supabase
            .from('listings')
            .select('category_id')
            .in('status', ['active', 'pending'])
        
        // Sayıları hesapla
        const counts = {}
        listings?.forEach(l => {
            counts[l.category_id] = (counts[l.category_id] || 0) + 1
        })
        
        // Kategorileri güncelle
        categoriesCache = categories.map(cat => ({ 
            ...cat, 
            count: counts[cat.id] || 0 
        }))
        
        renderCategories(categoriesCache)
        
        console.log('✅ Kategoriler yüklendi:', categoriesCache.length)
    } catch (error) {
        console.error('❌ Kategori yükleme hatası:', error)
    }
}

// Eski fonksiyon için alias (geriye uyumluluk)
async function loadCategoriesWithCounts() {
    return loadCategoriesOptimized()
}

// Kategorileri render et
function renderCategories(categories) {
    const categoryList = document.getElementById('categoryList')
    if (!categoryList) return
    
    categoryList.innerHTML = categories.map(cat => `
        <div class="category-item" data-id="${cat.id}" onclick="selectCategory(${cat.id}, '${cat.name}')">
            <div class="cat-icon">${cat.icon || '📁'}</div>
            <div class="cat-info">
                <span class="cat-name">${cat.name}</span>
                <span class="cat-count">${cat.count} ilan</span>
            </div>
        </div>
        <div class="subcategory-list" id="subcategories-${cat.id}" style="display: none;"></div>
    `).join('')
}

// Kategori seçimi
async function selectCategory(categoryId, categoryName) {
    const categoryItem = document.querySelector(`.category-item[data-id="${categoryId}"]`)
    const wasSelected = categoryItem.classList.contains('selected')
    
    // Önceki seçimleri temizle
    document.querySelectorAll('.category-item').forEach(item => {
        item.classList.remove('selected')
    })
    document.querySelectorAll('.subcategory-list').forEach(list => {
        list.style.display = 'none'
    })
    
    if (wasSelected) {
        // Seçimi kaldır
        currentFilters.category = []
        currentFilters.subcategory = []
        updateFilterValue('sector', 'Belirlenmedi')
        updateSelectedTags()
        return
    }
    
    // Yeni seçim
    categoryItem.classList.add('selected')
    currentFilters.category = [categoryId]
    currentFilters.subcategory = []
    
    // Değeri güncelle
    updateFilterValue('sector', categoryName)
    
    // Seçili tag ekle
    updateSelectedTags()
    
    // Alt kategorileri yükle
    await loadSubcategories(categoryId)
}

// ⚡ OPTİMİZE: Alt kategorileri hızlı yükle
async function loadSubcategories(categoryId) {
    try {
        const subcategoryList = document.getElementById(`subcategories-${categoryId}`)
        if (!subcategoryList) return
        
        // Önce loading göster
        subcategoryList.innerHTML = '<div style="padding: 0.5rem; color: #94a3b8;">Yükleniyor...</div>'
        subcategoryList.style.display = 'block'
        
        const { data, error } = await supabase
            .from('categories')
            .select('id, name, icon')
            .eq('parent_id', categoryId)
            .order('name')
        
        if (error) throw error
        if (data.length === 0) {
            subcategoryList.style.display = 'none'
            return
        }
        
        // Önce sayısız render et (hızlı)
        subcategoryList.innerHTML = data.map(sub => `
            <div class="subcategory-item" data-id="${sub.id}" onclick="selectSubcategory(${sub.id}, '${sub.name}', event)">
                <span class="sub-icon">${sub.icon || '📌'}</span>
                <span>${sub.name}</span>
            </div>
        `).join('')
        
    } catch (error) {
        console.error('❌ Alt kategori yükleme hatası:', error)
    }
}

// Alt kategori seçimi
function selectSubcategory(subcategoryId, subcategoryName, event) {
    event.stopPropagation()
    
    const subcategoryItem = document.querySelector(`.subcategory-item[data-id="${subcategoryId}"]`)
    const wasSelected = subcategoryItem.classList.contains('selected')
    
    // Toggle seçimi
    if (wasSelected) {
        subcategoryItem.classList.remove('selected')
        currentFilters.subcategory = currentFilters.subcategory.filter(id => id !== subcategoryId)
    } else {
        subcategoryItem.classList.add('selected')
        currentFilters.subcategory.push(subcategoryId)
    }
    
    updateSelectedTags()
}

// Şehirleri yükle
async function loadCitiesFilter() {
    try {
        const { data, error } = await supabase
            .from('cities')
            .select('id, name')
            .order('name')
        
        if (error) throw error
        
        citiesCache = data
        
        renderCities(data)
        
        // Arama dinleyicisi
        const locationSearch = document.getElementById('locationSearch')
        if (locationSearch) {
            locationSearch.addEventListener('input', (e) => {
                const query = e.target.value.toLowerCase()
                const filtered = data.filter(city => 
                    city.name.toLowerCase().includes(query)
                )
                renderCities(filtered)
            })
        }
        
        console.log('✅ Şehirler yüklendi:', data.length)
    } catch (error) {
        console.error('❌ Şehir yükleme hatası:', error)
    }
}

// Şehirleri render et
function renderCities(cities) {
    const cityList = document.getElementById('cityList')
    if (!cityList) return
    
    cityList.innerHTML = cities.slice(0, 10).map(city => `
        <div class="city-item ${currentFilters.city === city.id ? 'selected' : ''}" 
             data-id="${city.id}" 
             onclick="selectCity(${city.id}, '${city.name}')">
            <span class="city-icon">🏛️</span>
            <span class="city-name">${city.name}</span>
        </div>
    `).join('')
}

// Şehir seçimi
function selectCity(cityId, cityName) {
    const cityItem = document.querySelector(`.city-item[data-id="${cityId}"]`)
    const wasSelected = cityItem?.classList.contains('selected')
    
    // Önceki seçimi temizle
    document.querySelectorAll('.city-item').forEach(item => {
        item.classList.remove('selected')
    })
    
    if (wasSelected) {
        currentFilters.city = null
        currentFilters.cityName = ''
        updateFilterValue('location', 'Belirlenmedi')
    } else {
        cityItem?.classList.add('selected')
        currentFilters.city = cityId
        currentFilters.cityName = cityName
        updateFilterValue('location', cityName)
    }
    
    updateSelectedTags()
}

// Yakınızdaki konumu kullan
function useNearbyLocation() {
    if (!navigator.geolocation) {
        alert('Tarayıcınız konum özelliğini desteklemiyor.')
        return
    }
    
    navigator.geolocation.getCurrentPosition(
        (position) => {
            console.log('📍 Konum alındı:', position.coords)
            updateFilterValue('location', 'Yakınızda')
            // TODO: Koordinatlara göre en yakın şehri bul
            alert('Yakınızdaki ilanlar gösteriliyor...')
        },
        (error) => {
            console.error('❌ Konum hatası:', error)
            alert('Konum alınamadı. Lütfen konum iznini kontrol edin.')
        }
    )
}

// ⚡ OPTİMİZE: Fiyat histogramı - sadece fiyat alanını çek
async function createPriceHistogramOptimized() {
    const histogram = document.getElementById('priceHistogram')
    if (!histogram) return
    
    try {
        // Sadece fiyatları çek (minimum veri)
        const { data, error } = await supabase
            .from('listings')
            .select('price')
            .in('status', ['active', 'pending'])
            .not('price', 'is', null)
            .gt('price', 0)
            .limit(500) // Performans için limit
        
        if (error) throw error
        if (!data || data.length === 0) return
        
        const prices = data.map(l => l.price)
        const maxPrice = Math.max(...prices)
        const buckets = 20
        const bucketSize = maxPrice / buckets
        const distribution = new Array(buckets).fill(0)
        
        prices.forEach(price => {
            const bucketIndex = Math.min(Math.floor(price / bucketSize), buckets - 1)
            distribution[bucketIndex]++
        })
        
        const maxCount = Math.max(...distribution)
        
        histogram.innerHTML = distribution.map((count, i) => {
            const height = maxCount > 0 ? (count / maxCount) * 100 : 0
            return `<div class="histogram-bar" style="height: ${Math.max(height, 5)}%"></div>`
        }).join('')
        
        // Max fiyatı slider'a ayarla
        const maxSlider = document.getElementById('maxPriceSlider')
        const minSlider = document.getElementById('minPriceSlider')
        if (maxSlider) {
            maxSlider.max = maxPrice
            maxSlider.value = maxPrice
        }
        if (minSlider) {
            minSlider.max = maxPrice
        }
        
        // Input placeholder'ı güncelle
        const maxInput = document.getElementById('maxPriceInput')
        if (maxInput) {
            maxInput.placeholder = formatPrice(maxPrice)
        }
        
    } catch (error) {
        console.error('❌ Histogram hatası:', error)
    }
}

// Eski fonksiyon için alias
async function createPriceHistogram() {
    return createPriceHistogramOptimized()
}

// Fiyat slider kurulumu
function setupPriceSlider() {
    const minSlider = document.getElementById('minPriceSlider')
    const maxSlider = document.getElementById('maxPriceSlider')
    const minInput = document.getElementById('minPriceInput')
    const maxInput = document.getElementById('maxPriceInput')
    
    if (!minSlider || !maxSlider) return
    
    const updateSliderTrack = () => {
        const min = parseInt(minSlider.value)
        const max = parseInt(maxSlider.value)
        const total = parseInt(maxSlider.max)
        
        const minPercent = (min / total) * 100
        const maxPercent = (max / total) * 100
        
        const track = document.getElementById('sliderTrack')
        if (track) {
            track.style.background = `linear-gradient(to right, 
                #e2e8f0 ${minPercent}%, 
                var(--secondary-color) ${minPercent}%, 
                var(--secondary-color) ${maxPercent}%, 
                #e2e8f0 ${maxPercent}%)`
        }
        
        // Histogram bar'larını güncelle
        updateHistogramBars(min, max, total)
    }
    
    minSlider.addEventListener('input', () => {
        const min = parseInt(minSlider.value)
        const max = parseInt(maxSlider.value)
        
        if (min > max) {
            minSlider.value = max
        }
        
        if (minInput) {
            minInput.value = min > 0 ? formatNumber(min) : ''
        }
        
        currentFilters.minPrice = min > 0 ? min : null
        updateSliderTrack()
        updatePriceValue()
    })
    
    maxSlider.addEventListener('input', () => {
        const min = parseInt(minSlider.value)
        const max = parseInt(maxSlider.value)
        
        if (max < min) {
            maxSlider.value = min
        }
        
        if (maxInput) {
            maxInput.value = formatNumber(max)
        }
        
        currentFilters.maxPrice = max
        updateSliderTrack()
        updatePriceValue()
    })
    
    // Input değişikliklerini dinle
    if (minInput) {
        minInput.addEventListener('change', () => {
            const value = parseNumber(minInput.value)
            minSlider.value = value
            currentFilters.minPrice = value > 0 ? value : null
            updateSliderTrack()
            updatePriceValue()
        })
    }
    
    if (maxInput) {
        maxInput.addEventListener('change', () => {
            const value = parseNumber(maxInput.value)
            maxSlider.value = value
            currentFilters.maxPrice = value
            updateSliderTrack()
            updatePriceValue()
        })
    }
    
    updateSliderTrack()
}

// Histogram bar'larını güncelle
function updateHistogramBars(min, max, total) {
    const bars = document.querySelectorAll('.histogram-bar')
    const buckets = bars.length
    const bucketSize = total / buckets
    
    bars.forEach((bar, i) => {
        const bucketMin = i * bucketSize
        const bucketMax = (i + 1) * bucketSize
        
        if (bucketMax < min || bucketMin > max) {
            bar.classList.add('inactive')
        } else {
            bar.classList.remove('inactive')
        }
    })
}

// Fiyat değerini güncelle
function updatePriceValue() {
    const min = currentFilters.minPrice
    const max = currentFilters.maxPrice
    
    if (min || max) {
        const minStr = min ? formatPrice(min) : 'En düşük'
        const maxStr = max ? formatPrice(max) : 'En yüksek'
        updateFilterValue('price', `${minStr} - ${maxStr}`)
    } else {
        updateFilterValue('price', 'Belirlenmedi')
    }
}

// Filtre değerini güncelle
function updateFilterValue(filter, value) {
    const valueEl = document.getElementById(`${filter}Value`)
    if (valueEl) {
        valueEl.textContent = value
        valueEl.classList.toggle('has-value', value !== 'Belirlenmedi')
    }
}

// Seçili etiketleri güncelle
function updateSelectedTags() {
    const container = document.getElementById('selectedFilters')
    if (!container) return
    
    const tags = []
    
    // Şehir etiketi
    if (currentFilters.cityName) {
        tags.push(`
            <span class="filter-tag">
                ${currentFilters.cityName}
                <span class="remove-tag" onclick="removeFilter('city')">×</span>
            </span>
        `)
    }
    
    // Kategori etiketleri
    currentFilters.category.forEach(catId => {
        const cat = categoriesCache.find(c => c.id === catId)
        if (cat) {
            tags.push(`
                <span class="filter-tag">
                    ${cat.name}
                    <span class="remove-tag" onclick="removeFilter('category', ${catId})">×</span>
                </span>
            `)
        }
    })
    
    container.innerHTML = tags.join('')
    container.style.display = tags.length > 0 ? 'flex' : 'none'
}

// Filtreyi kaldır
function removeFilter(type, id = null) {
    if (type === 'city') {
        currentFilters.city = null
        currentFilters.cityName = ''
        updateFilterValue('location', 'Belirlenmedi')
        document.querySelectorAll('.city-item').forEach(item => {
            item.classList.remove('selected')
        })
    } else if (type === 'category') {
        currentFilters.category = currentFilters.category.filter(c => c !== id)
        currentFilters.subcategory = []
        updateFilterValue('sector', 'Belirlenmedi')
        document.querySelectorAll('.category-item').forEach(item => {
            item.classList.remove('selected')
        })
        document.querySelectorAll('.subcategory-list').forEach(list => {
            list.style.display = 'none'
        })
    }
    
    updateSelectedTags()
}

// Filtre butonları kurulumu
function setupFilterButtons() {
    const applyBtn = document.getElementById('applyFiltersBtn')
    const clearBtn = document.getElementById('clearFiltersBtn')
    
    if (applyBtn) {
        applyBtn.addEventListener('click', () => {
            // Gelişmiş filtreleri topla
            collectAdvancedFilters()
            loadListings()
            
            // Accordion'ları kapat
            document.querySelectorAll('.filter-accordion').forEach(acc => {
                acc.classList.remove('active')
            })
        })
    }
    
    if (clearBtn) {
        clearBtn.addEventListener('click', clearAllFilters)
    }
}

// Gelişmiş filtreleri topla
function collectAdvancedFilters() {
    // Özellik checkbox'ları
    const features = []
    document.querySelectorAll('input[name="feature"]:checked').forEach(cb => {
        features.push(cb.value)
    })
    currentFilters.features = features
    
    // Metrekare
    const minArea = document.getElementById('minArea')
    const maxArea = document.getElementById('maxArea')
    currentFilters.minArea = minArea?.value ? parseInt(minArea.value) : null
    currentFilters.maxArea = maxArea?.value ? parseInt(maxArea.value) : null
    
    // Gelişmiş değeri güncelle
    if (features.length > 0 || currentFilters.minArea || currentFilters.maxArea) {
        updateFilterValue('advanced', `${features.length} filtre aktif`)
    } else {
        updateFilterValue('advanced', 'Belirlenmedi')
    }
}

// Arama dinleyicileri
function setupSearchListeners() {
    // Kategori arama
    const categorySearch = document.getElementById('categorySearch')
    if (categorySearch) {
        categorySearch.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase()
            const filtered = categoriesCache.filter(cat => 
                cat.name.toLowerCase().includes(query)
            )
            renderCategories(filtered)
        })
    }
    
    // Ana arama
    const searchBtn = document.querySelector('.btn-search-compact')
    const searchInput = document.querySelector('.search-bar-compact input')
    
    if (searchBtn && searchInput) {
        searchBtn.addEventListener('click', () => {
            currentFilters.search = searchInput.value.trim()
            currentFilters.page = 1
            loadListings()
        })
        
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                currentFilters.search = searchInput.value.trim()
                currentFilters.page = 1
                loadListings()
            }
        })
    }
    
    // Sıralama
    const sortSelect = document.querySelector('.sort-select')
    if (sortSelect) {
        sortSelect.addEventListener('change', (e) => {
            currentFilters.sort = e.target.value
            currentFilters.page = 1
            loadListings()
        })
    }
}

// URL parametrelerini oku (senkron - hızlı)
function parseURLParams() {
    const params = new URLSearchParams(window.location.search)
    
    const categoryId = params.get('category')
    if (categoryId) {
        currentFilters.category = [parseInt(categoryId)]
    }
    
    const cityId = params.get('city')
    if (cityId) {
        currentFilters.city = parseInt(cityId)
    }
    
    const search = params.get('search')
    if (search) {
        currentFilters.search = search
    }

    const minP = params.get('min')
    if (minP != null && minP !== '') {
        const n = parseInt(minP, 10)
        if (!Number.isNaN(n) && n >= 0) currentFilters.minPrice = n
    }
    const maxP = params.get('max')
    if (maxP != null && maxP !== '') {
        const n = parseInt(maxP, 10)
        if (!Number.isNaN(n) && n >= 0) currentFilters.maxPrice = n
    }
}

// Filtreleri UI'a uygula (senkron - hızlı)
function applyFiltersToUI() {
    // Arama inputunu doldur
    if (currentFilters.search) {
        const searchInput = document.querySelector('.search-bar-compact input')
        if (searchInput) {
            searchInput.value = currentFilters.search
        }
    }
    if (currentFilters.minPrice != null) {
        const minPriceInput = document.getElementById('minPriceInput')
        if (minPriceInput) minPriceInput.value = currentFilters.minPrice
    }
    if (currentFilters.maxPrice != null) {
        const maxPriceInput = document.getElementById('maxPriceInput')
        if (maxPriceInput) maxPriceInput.value = currentFilters.maxPrice
    }
}

// Tüm filtreleri temizle
function clearAllFilters() {
    currentFilters = {
        search: '',
        category: [],
        subcategory: [],
        city: null,
        cityName: '',
        minPrice: null,
        maxPrice: null,
        minArea: null,
        maxArea: null,
        features: [],
        sort: 'newest',
        page: 1
    }
    
    // UI'ı temizle
    document.querySelectorAll('.category-item').forEach(item => item.classList.remove('selected'))
    document.querySelectorAll('.subcategory-list').forEach(list => list.style.display = 'none')
    document.querySelectorAll('.city-item').forEach(item => item.classList.remove('selected'))
    document.querySelectorAll('input[name="feature"]').forEach(cb => cb.checked = false)
    
    const minArea = document.getElementById('minArea')
    const maxArea = document.getElementById('maxArea')
    if (minArea) minArea.value = ''
    if (maxArea) maxArea.value = ''
    
    const minPriceInput = document.getElementById('minPriceInput')
    const maxPriceInput = document.getElementById('maxPriceInput')
    if (minPriceInput) minPriceInput.value = ''
    if (maxPriceInput) maxPriceInput.value = ''
    
    const minSlider = document.getElementById('minPriceSlider')
    const maxSlider = document.getElementById('maxPriceSlider')
    if (minSlider) minSlider.value = 0
    if (maxSlider) maxSlider.value = maxSlider.max
    
    const searchInput = document.querySelector('.search-bar-compact input')
    if (searchInput) searchInput.value = ''
    
    const sortSelect = document.querySelector('.sort-select')
    if (sortSelect) sortSelect.value = 'newest'
    
    // Değerleri güncelle
    updateFilterValue('location', 'Belirlenmedi')
    updateFilterValue('sector', 'Belirlenmedi')
    updateFilterValue('price', 'Belirlenmedi')
    updateFilterValue('advanced', 'Belirlenmedi')
    
    updateSelectedTags()
    setupPriceSlider()
    loadListings()
    
    console.log('🗑️ Tüm filtreler temizlendi')
}

// ⚡ OPTİMİZE: İlanları hızlı yükle
async function loadListings() {
    const grid = document.getElementById('listingsGrid')
    
    grid.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 3rem;">
            <div class="loading-spinner"></div>
            <p style="font-size: 1.2rem; color: #64748b; margin-top: 1rem;">⏳ İlanlar yükleniyor...</p>
        </div>
    `
    
    try {
        // ⚡ Sadece gerekli alanları çek (performans için)
        let query = supabase
            .from('listings')
            .select(`
                id, title, price, area_sqm, monthly_rent, establishment_year, created_at,
                category:categories!category_id(name),
                city:cities(name),
                district:districts(name),
                images:listing_images(image_url, is_primary)
            `, { count: 'exact' })
            .in('status', ['active', 'pending'])
        
        // Filtreler
        if (currentFilters.category.length > 0) {
            query = query.in('category_id', currentFilters.category)
        }
        
        if (currentFilters.subcategory.length > 0) {
            query = query.in('subcategory_id', currentFilters.subcategory)
        }
        
        if (currentFilters.city) {
            query = query.eq('city_id', currentFilters.city)
        }
        
        if (currentFilters.minPrice) {
            query = query.gte('price', currentFilters.minPrice)
        }
        if (currentFilters.maxPrice) {
            query = query.lte('price', currentFilters.maxPrice)
        }
        
        if (currentFilters.minArea) {
            query = query.gte('area_sqm', currentFilters.minArea)
        }
        if (currentFilters.maxArea) {
            query = query.lte('area_sqm', currentFilters.maxArea)
        }
        
        if (currentFilters.search) {
            query = query.or(`title.ilike.%${currentFilters.search}%,description.ilike.%${currentFilters.search}%`)
        }
        
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
        
        grid.innerHTML = data.map(listing => createListingCard(listing)).join('')
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
                    ❤
                </button>
            </div>
            <div class="listing-content">
                <h3>${listing.title}</h3>
                <div class="listing-location">
                    ${listing.district?.name || ''}, ${listing.city?.name || ''}
                </div>
                <div class="listing-details">
                    <span>${listing.area_sqm || 0} m²</span>
                    <span>Kira: ${formatPrice(listing.monthly_rent)}</span>
                    <span>${listing.establishment_year || '-'}</span>
                </div>
                <div class="listing-footer">
                    <span class="listing-price">${formatPrice(listing.price)}</span>
                    <span class="listing-date">${formatDate(listing.created_at)}</span>
                </div>
            </div>
        </a>
    `
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

// Yardımcı fonksiyonlar
function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')
}

function parseNumber(str) {
    return parseInt(str.replace(/\./g, '')) || 0
}

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

console.log('✅ Listings.js (Modern) yüklendi!')
