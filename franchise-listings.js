// Franchise Listings Page JavaScript

// Global filters state
let franchiseFilters = {
    sector: null,
    sectorName: '',
    minInvestment: null,
    maxInvestment: null,
    search: '',
    page: 1
}

// Cache
let sectorsCache = []

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
    console.log('🏢 Franchise sayfası yükleniyor...')
    
    // Setup accordions
    setupAccordions()
    
    // Load sectors
    await loadSectors()
    
    // Load franchises
    await loadFranchises()
    
    // Setup search
    setupSearch()
    
    // Setup investment filters
    setupInvestmentFilters()
})

// Accordion setup
function setupAccordions() {
    document.querySelectorAll('.accordion-header').forEach(header => {
        header.addEventListener('click', () => {
            const accordion = header.closest('.filter-accordion')
            accordion.classList.toggle('active')
        })
    })
}

// Load sectors with counts
async function loadSectors() {
    try {
        const { data: categories, error } = await supabase
            .from('categories')
            .select('id, name, icon')
            .is('parent_id', null)
            .order('name')
        
        if (error) throw error
        
        // Önce kategorileri hemen göster
        sectorsCache = categories.map(cat => ({ ...cat, count: '...' }))
        renderSectors(sectorsCache)
        
        // Franchise sayılarını tek sorguda çek
        const { data: franchises } = await supabase
            .from('franchises')
            .select('sector_id')
            .in('status', ['active', 'pending'])
        
        // Sayıları hesapla
        const counts = {}
        franchises?.forEach(f => {
            counts[f.sector_id] = (counts[f.sector_id] || 0) + 1
        })
        
        // Kategorileri güncelle
        sectorsCache = categories.map(cat => ({ 
            ...cat, 
            count: counts[cat.id] || 0 
        }))
        
        renderSectors(sectorsCache)
        
        // Setup sector search
        const sectorSearch = document.getElementById('sectorSearch')
        if (sectorSearch) {
            sectorSearch.addEventListener('input', (e) => {
                const query = e.target.value.toLowerCase()
                const filtered = sectorsCache.filter(s => 
                    s.name.toLowerCase().includes(query)
                )
                renderSectors(filtered)
            })
        }
        
        console.log('✅ Sektörler yüklendi:', sectorsCache.length)
    } catch (error) {
        console.error('❌ Sektör yükleme hatası:', error)
    }
}

// Render sectors
function renderSectors(sectors) {
    const sectorList = document.getElementById('sectorList')
    if (!sectorList) return
    
    if (sectors.length === 0) {
        sectorList.innerHTML = '<p style="color: #94a3b8; padding: 1rem; text-align: center;">Franchise bulunamadı</p>'
        return
    }
    
    sectorList.innerHTML = sectors.map(sector => `
        <div class="sector-item ${franchiseFilters.sector === sector.id ? 'selected' : ''}" 
             data-id="${sector.id}" 
             onclick="selectSector(${sector.id}, '${sector.name}')">
            <span class="sector-icon">${sector.icon || '📁'}</span>
            <span class="sector-name">${sector.name}</span>
            <span class="sector-count">${sector.count}</span>
        </div>
    `).join('')
}

// Select sector
function selectSector(sectorId, sectorName) {
    const wasSelected = franchiseFilters.sector === sectorId
    
    // Toggle selection
    if (wasSelected) {
        franchiseFilters.sector = null
        franchiseFilters.sectorName = ''
        document.getElementById('sectorValue').textContent = 'Belirlenmedi'
    } else {
        franchiseFilters.sector = sectorId
        franchiseFilters.sectorName = sectorName
        document.getElementById('sectorValue').textContent = sectorName
    }
    
    // Update UI
    document.querySelectorAll('.sector-item').forEach(item => {
        item.classList.remove('selected')
    })
    
    if (!wasSelected) {
        document.querySelector(`.sector-item[data-id="${sectorId}"]`)?.classList.add('selected')
    }
}

// Setup investment filters
function setupInvestmentFilters() {
    document.querySelectorAll('input[name="investment"]').forEach(radio => {
        radio.addEventListener('change', (e) => {
            const value = e.target.value
            const investmentValue = document.getElementById('investmentValue')
            
            if (value === '5000000+') {
                franchiseFilters.minInvestment = 5000000
                franchiseFilters.maxInvestment = null
                investmentValue.textContent = '₺5.000.000+'
            } else {
                const [min, max] = value.split('-').map(Number)
                franchiseFilters.minInvestment = min
                franchiseFilters.maxInvestment = max
                investmentValue.textContent = `₺${min.toLocaleString('tr-TR')} - ₺${max.toLocaleString('tr-TR')}`
            }
        })
    })
}

// Setup search
function setupSearch() {
    const searchInput = document.getElementById('searchInput')
    if (searchInput) {
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                searchFranchises()
            }
        })
    }
}

// Search franchises
function searchFranchises() {
    const searchInput = document.getElementById('searchInput')
    franchiseFilters.search = searchInput?.value.trim() || ''
    franchiseFilters.page = 1
    loadFranchises()
}

// Apply filters
function applyFilters() {
    franchiseFilters.page = 1
    loadFranchises()
}

// Clear filters
function clearFilters() {
    franchiseFilters = {
        sector: null,
        sectorName: '',
        minInvestment: null,
        maxInvestment: null,
        search: '',
        page: 1
    }
    
    // Reset UI
    document.getElementById('sectorValue').textContent = 'Belirlenmedi'
    document.getElementById('investmentValue').textContent = 'Belirlenmedi'
    document.querySelectorAll('.sector-item').forEach(item => item.classList.remove('selected'))
    document.querySelectorAll('input[name="investment"]').forEach(radio => radio.checked = false)
    document.getElementById('searchInput').value = ''
    
    loadFranchises()
}

// Load franchises
async function loadFranchises() {
    const grid = document.getElementById('franchiseGrid')
    
    grid.innerHTML = `
        <div class="loading-state">
            <div class="loading-spinner"></div>
            <p>⏳ Franchise'lar yükleniyor...</p>
        </div>
    `
    
    try {
        // Yeni franchises tablosundan çek
        let query = supabase
            .from('franchises')
            .select(`
                id, brand_name, slug, description, logo_url,
                min_investment, max_investment,
                sector:categories!sector_id(id, name, icon),
                city:cities!hq_city_id(name),
                created_at
            `, { count: 'exact' })
            .in('status', ['active', 'pending'])
        
        // Apply filters
        if (franchiseFilters.sector) {
            query = query.eq('sector_id', franchiseFilters.sector)
        }
        
        if (franchiseFilters.minInvestment) {
            query = query.gte('min_investment', franchiseFilters.minInvestment)
        }
        
        if (franchiseFilters.maxInvestment) {
            query = query.lte('min_investment', franchiseFilters.maxInvestment)
        }
        
        if (franchiseFilters.search) {
            query = query.or(`brand_name.ilike.%${franchiseFilters.search}%,description.ilike.%${franchiseFilters.search}%`)
        }
        
        // Sort and paginate
        query = query.order('created_at', { ascending: false })
        
        const perPage = 12
        const from = (franchiseFilters.page - 1) * perPage
        query = query.range(from, from + perPage - 1)
        
        const { data, error, count } = await query
        
        if (error) throw error
        
        // Update count
        document.getElementById('totalCount').textContent = count || 0
        
        if (!data || data.length === 0) {
            grid.innerHTML = `
                <div class="loading-state">
                    <h3 style="color: #1e293b; margin-bottom: 0.5rem;">🔍 Franchise Bulunamadı</h3>
                    <p>Filtrelerinizi değiştirmeyi deneyin</p>
                    <button onclick="clearFilters()" class="btn-apply" style="margin-top: 1rem; padding: 0.7rem 1.5rem;">Filtreleri Temizle</button>
                </div>
            `
            document.getElementById('pagination').innerHTML = ''
            return
        }
        
        // Render franchises
        grid.innerHTML = data.map(franchise => createFranchiseCard(franchise)).join('')
        
        // Update pagination
        updatePagination(count, perPage)
        
        console.log(`✅ ${data.length} franchise yüklendi (Toplam: ${count})`)
        
    } catch (error) {
        console.error('❌ Franchise yükleme hatası:', error)
        grid.innerHTML = `
            <div class="loading-state">
                <h3 style="color: #ef4444;">❌ Hata Oluştu</h3>
                <p>${error.message}</p>
                <button onclick="loadFranchises()" class="btn-apply" style="margin-top: 1rem; padding: 0.7rem 1.5rem;">Tekrar Dene</button>
            </div>
        `
    }
}

// Create franchise card
function createFranchiseCard(franchise) {
    // Investment range
    let investmentText = 'Belirtilmedi'
    if (franchise.min_investment && franchise.max_investment) {
        investmentText = `${formatPrice(franchise.min_investment)} - ${formatPrice(franchise.max_investment)}`
    } else if (franchise.min_investment) {
        investmentText = formatPrice(franchise.min_investment)
    }
    
    return `
        <a href="franchise-detail.html?id=${franchise.id}" class="franchise-card">
            <div class="franchise-logo">
                ${franchise.logo_url ? 
                    `<img src="${franchise.logo_url}" alt="${franchise.brand_name}">` : 
                    '<span class="no-logo">🏢</span>'
                }
            </div>
            <div class="franchise-info">
                <h3 class="franchise-name">${franchise.brand_name}</h3>
                <div class="franchise-category">
                    <span class="cat-icon">${franchise.sector?.icon || '📁'}</span>
                    <span>${franchise.sector?.name || 'Kategori'}</span>
                </div>
                ${franchise.city ? `<div class="franchise-location">📍 ${franchise.city.name}</div>` : ''}
                <div class="franchise-investment">
                    <div class="investment-label">Yatırım Tutarı</div>
                    <div class="investment-amount">${investmentText}</div>
                </div>
            </div>
        </a>
    `
}

// Update pagination
function updatePagination(totalCount, perPage) {
    const totalPages = Math.ceil(totalCount / perPage)
    const paginationContainer = document.getElementById('pagination')
    
    if (!paginationContainer) return
    
    if (totalPages <= 1) {
        paginationContainer.innerHTML = ''
        return
    }
    
    let html = `
        <button class="page-btn" onclick="goToPage(${franchiseFilters.page - 1})" ${franchiseFilters.page === 1 ? 'disabled' : ''}>
            ← Önceki
        </button>
    `
    
    for (let i = 1; i <= Math.min(5, totalPages); i++) {
        html += `
            <button class="page-btn ${i === franchiseFilters.page ? 'active' : ''}" onclick="goToPage(${i})">
                ${i}
            </button>
        `
    }
    
    if (totalPages > 5) {
        html += `<button class="page-btn" disabled>...</button>`
        html += `
            <button class="page-btn ${totalPages === franchiseFilters.page ? 'active' : ''}" onclick="goToPage(${totalPages})">
                ${totalPages}
            </button>
        `
    }
    
    html += `
        <button class="page-btn" onclick="goToPage(${franchiseFilters.page + 1})" ${franchiseFilters.page === totalPages ? 'disabled' : ''}>
            Sonraki →
        </button>
    `
    
    paginationContainer.innerHTML = html
}

// Go to page
function goToPage(page) {
    if (page < 1) return
    franchiseFilters.page = page
    loadFranchises()
    window.scrollTo({ top: 0, behavior: 'smooth' })
}

console.log('✅ Franchise listings JS yüklendi!')

