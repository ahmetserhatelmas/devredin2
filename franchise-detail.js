// Franchise Detail Page JavaScript - Professional Design

let currentFranchise = null;

// Initialize
function initFranchiseDetail() {
    console.log('🏢 Franchise detay sayfası yükleniyor...')
    
    const urlParams = new URLSearchParams(window.location.search)
    const franchiseId = urlParams.get('id')
    
    if (!franchiseId) {
        showError('Franchise ID bulunamadı!')
        return
    }
    
    console.log('🔍 Franchise ID:', franchiseId)
    loadFranchiseDetail(franchiseId)
}

// Page ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initFranchiseDetail)
} else {
    initFranchiseDetail()
}

// Load franchise detail
async function loadFranchiseDetail(franchiseId) {
    try {
        const { data, error } = await supabase
            .from('franchises')
            .select(`
                *,
                sector:categories!sector_id(name, icon),
                city:cities!hq_city_id(name)
            `)
            .eq('id', franchiseId)
            .single()
        
        if (error) throw error
        if (!data) {
            showError('Franchise bulunamadı!')
            return
        }
        
        currentFranchise = data
        console.log('✅ Franchise yüklendi:', data)
        
        // Increment view count
        incrementViewCount(franchiseId)
        
        // Render
        renderFranchiseDetail(data)
        
    } catch (error) {
        console.error('❌ Franchise yükleme hatası:', error)
        showError('Franchise yüklenirken hata oluştu: ' + error.message)
    }
}

// Increment view count
async function incrementViewCount(franchiseId) {
    try {
        await supabase.rpc('increment_franchise_view_count', { franchise_id: franchiseId })
    } catch (error) {
        console.log('View count hatası:', error)
    }
}

// Render franchise detail
function renderFranchiseDetail(franchise) {
    document.title = `${franchise.brand_name} - Franchise - DevredinPlatform`
    
    // Remove skeletons
    document.body.classList.add('loaded')
    
    // Hero Section
    const brandLogoLarge = document.getElementById('brandLogoLarge')
    if (brandLogoLarge) {
        if (franchise.logo_url) {
            brandLogoLarge.innerHTML = `<img src="${franchise.logo_url}" alt="${franchise.brand_name}">`
        } else {
            brandLogoLarge.innerHTML = '<span class="no-logo">🏢</span>'
        }
    }
    
    setText('brandTitle', franchise.brand_name)
    
    const brandCategory = document.getElementById('brandCategory')
    if (brandCategory && franchise.sector) {
        brandCategory.innerHTML = `${franchise.sector.icon || '📁'} ${franchise.sector.name}`
    }
    
    // Quick Stats
    const investmentRange = franchise.min_investment && franchise.max_investment ?
        `${formatPrice(franchise.min_investment)} - ${formatPrice(franchise.max_investment)}` :
        franchise.min_investment ? formatPrice(franchise.min_investment) : 'Belirtilmemiş'
    setText('statInvestment', investmentRange)
    setText('statLocations', franchise.total_locations || '0')
    setText('statFranchisees', franchise.total_franchisees || '0')
    setText('statRoi', franchise.roi_months ? `${franchise.roi_months} ay` : '-')
    
    // Info Bar
    setText('infoFounded', franchise.founded_year || '-')
    setText('infoHQ', franchise.city ? `${franchise.city.name}, ${franchise.hq_country || 'Türkiye'}` : '-')
    
    if (franchise.website) {
        document.getElementById('infoWebsiteItem').style.display = 'flex'
        const websiteLink = document.getElementById('infoWebsite')
        websiteLink.href = franchise.website
        websiteLink.textContent = 'Web Sitesi'
    }
    
    // About
    setText('aboutContent', franchise.description || 'Açıklama bulunmuyor.')
    
    // Company Info
    setText('companyBrand', franchise.brand_name)
    setText('companyYear', franchise.founded_year || '-')
    setText('companyHQ', franchise.city ? `${franchise.city.name}, ${franchise.hq_country || 'Türkiye'}` : '-')
    setText('companySector', franchise.sector ? franchise.sector.name : '-')
    
    // Social Media
    const socialLinks = []
    if (franchise.instagram) socialLinks.push({ label: 'Instagram', url: franchise.instagram })
    if (franchise.facebook) socialLinks.push({ label: 'Facebook', url: franchise.facebook })
    if (franchise.linkedin) socialLinks.push({ label: 'LinkedIn', url: franchise.linkedin })
    if (franchise.youtube) socialLinks.push({ label: 'YouTube', url: franchise.youtube })
    if (franchise.twitter) socialLinks.push({ label: 'Twitter', url: franchise.twitter })
    
    if (socialLinks.length > 0) {
        document.getElementById('socialSection').style.display = 'block'
        const socialLinksList = document.getElementById('socialLinksList')
        socialLinksList.innerHTML = socialLinks.map(s =>
            `<a href="${s.url}" target="_blank" class="social-link-item">
                <span>${s.label}</span>
            </a>`
        ).join('')
    }
    
    // Contact
    setText('contactPersonName', franchise.contact_name || 'İlan Sahibi')
    setText('contactPersonRole', 'İlan Sahibi')
    
    // Franchise Contact
    if (franchise.contact_name || franchise.contact_position || franchise.contact_email || franchise.contact_phone) {
        setText('franchiseContactName', franchise.contact_name || '-')
        setText('franchiseContactPosition', franchise.contact_position || 'Franchise Danışmanı')
        setText('franchiseContactEmail', franchise.contact_email || '-')
        setText('franchiseContactPhone', franchise.contact_phone || '-')
    }
    
    // Contact Buttons
    const phone = franchise.contact_phone || ''
    const cleanPhone = phone.replace(/\D/g, '')
    
    const whatsappBtn = document.getElementById('whatsappContactBtn')
    if (whatsappBtn && cleanPhone) {
        whatsappBtn.onclick = () => {
            const message = `Merhaba, ${franchise.brand_name} franchise'ı hakkında bilgi almak istiyorum.`
            window.open(`https://wa.me/90${cleanPhone}?text=${encodeURIComponent(message)}`, '_blank')
        }
    }
    
    const phoneBtn = document.getElementById('phoneContactBtn')
    if (phoneBtn && cleanPhone) {
        phoneBtn.onclick = () => {
            window.location.href = `tel:+90${cleanPhone}`
        }
    }
    
    setText('phoneNumber', phone || '-')
    
    // Investment
    setText('finMinInvestment', franchise.min_investment ? formatPrice(franchise.min_investment) : '-')
    setText('finMaxInvestment', franchise.max_investment ? formatPrice(franchise.max_investment) : '-')
    setText('finRevenueShare', franchise.revenue_share ? `%${franchise.revenue_share}` : '-')
    setText('finRoi', franchise.roi_months ? `${franchise.roi_months} ay` : '-')
    setText('finRevenue', franchise.avg_monthly_revenue ? formatPrice(franchise.avg_monthly_revenue) : '-')
    setText('finProfit', franchise.avg_monthly_profit ? formatPrice(franchise.avg_monthly_profit) : '-')
    
    // Calculate margin if possible
    if (franchise.avg_monthly_profit && franchise.avg_monthly_revenue) {
        const margin = ((franchise.avg_monthly_profit / franchise.avg_monthly_revenue) * 100).toFixed(0)
        setText('finMargin', `%${margin} - %50`)
    } else {
        setText('finMargin', '-')
    }
    
    // Network
    setText('netLocations', franchise.total_locations || '7')
    setText('netFranchisees', franchise.total_franchisees || '5')
    
    const netRegions = document.getElementById('netRegions')
    if (netRegions) {
        if (franchise.regions && franchise.regions.length > 0) {
            netRegions.innerHTML = franchise.regions.map(r =>
                `<span class="region-badge">${r}</span>`
            ).join('')
        } else {
            netRegions.innerHTML = `
                <span class="region-badge">Ege</span>
                <span class="region-badge">Marmara</span>
                <span class="region-badge">Karadeniz</span>
                <span class="region-badge">Akdeniz</span>
                <span class="region-badge">İç Anadolu</span>
                <span class="region-badge">Güneydoğu Anadolu</span>
                <span class="region-badge">Doğu Anadolu</span>
            `
        }
    }
    
    // Operations
    setText('opMinSqm', franchise.min_sqm ? `${franchise.min_sqm} m²` : '100 m²')
    setText('opVentilation', 'Gerekli Değil')
    setText('opMinStaff', franchise.min_staff ? `${franchise.min_staff}` : '4')
    setText('opPartTime', 'Evet')
    setText('opRemote', 'Hayır')
    
    // Requirements
    setText('reqCapital', franchise.min_capital ? formatPrice(franchise.min_capital) : '-')
    setText('reqExperience', franchise.experience_required || 'Hayır')
    
    // Training
    setText('trainProgram', franchise.ongoing_training ? 'Var' : '-')
    
    // Support Services
    const oneTimeServices = document.getElementById('oneTimeServices')
    const ongoingServices = document.getElementById('ongoingServices')
    const supportAreas = document.getElementById('supportAreas')
    
    if (franchise.one_time_services && franchise.one_time_services.length > 0) {
        oneTimeServices.innerHTML = franchise.one_time_services.map(s =>
            `<span class="support-tag">${s}</span>`
        ).join('')
    } else {
        oneTimeServices.innerHTML = '<span class="support-tag">Kurulum</span><span class="support-tag">Açılış</span><span class="support-tag">Mimari Proje</span>'
    }
    
    if (franchise.ongoing_services && franchise.ongoing_services.length > 0) {
        ongoingServices.innerHTML = franchise.ongoing_services.map(s =>
            `<span class="support-tag">${s}</span>`
        ).join('')
    } else {
        ongoingServices.innerHTML = '<span class="support-tag">Lojistik</span><span class="support-tag">Yazılım</span><span class="support-tag">Pazarlama</span><span class="support-tag">Reklam</span>'
    }
    
    if (franchise.support_areas && franchise.support_areas.length > 0) {
        supportAreas.innerHTML = franchise.support_areas.map(s =>
            `<span class="support-tag">${s}</span>`
        ).join('')
    } else {
        supportAreas.innerHTML = '<span class="support-tag">Personel</span><span class="support-tag">Operasyonel</span>'
    }
}

// Helper: Set text
function setText(id, value) {
    const el = document.getElementById(id)
    if (el) {
        el.innerHTML = ''
        el.textContent = value
    }
}

// Show error
function showError(message) {
    const container = document.querySelector('.franchise-detail-page .container')
    if (container) {
        container.innerHTML = `
            <div style="text-align: center; padding: 4rem;">
                <h2 style="color: #ef4444; margin-bottom: 1rem;">❌ ${message}</h2>
                <a href="franchise.html" class="btn btn-primary">Franchise Listesine Dön</a>
            </div>
        `
    }
}

console.log('✅ Franchise detail JS yüklendi')
