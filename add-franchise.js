// Franchise Form JavaScript

let currentStep = 1;
const totalSteps = 7;
let galleryImages = [];

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
    console.log('🏢 Franchise form yükleniyor...')
    
    // Check if user is logged in
    const cachedUser = getCachedUser()
    if (!cachedUser) {
        const user = await getCurrentUser()
        if (!user) {
            alert('⚠️ Franchise ilanı vermek için giriş yapmalısınız!')
            window.location.href = 'login.html'
            return
        }
    }
    
    // Fill contact info from cache
    const cachedProfile = getCachedProfile()
    if (cachedProfile) {
        const contactName = document.querySelector('input[name="contact_name"]')
        const contactPhone = document.querySelector('input[name="contact_phone"]')
        if (contactName) contactName.value = cachedProfile.full_name || ''
        if (contactPhone) contactPhone.value = cachedProfile.phone || ''
    }
    
    const user = await getCurrentUser()
    if (user) {
        const contactEmail = document.querySelector('input[name="contact_email"]')
        if (contactEmail) contactEmail.value = user.email || ''
    }
    
    // Load sectors
    await loadSectors()
    
    // Load cities
    await loadCities()
    
    // Setup file uploads
    setupFileUploads()
    
    // Setup gallery upload
    setupGalleryUpload()
    
    // Add initial FAQ item
    addFaqItem()
    
    // Setup form submission
    setupFormSubmission()
})

// Load sectors (categories)
async function loadSectors() {
    try {
        const { data, error } = await supabase
            .from('categories')
            .select('id, name, icon')
            .is('parent_id', null)
            .order('name')
        
        if (error) throw error
        
        const sectorSelect = document.getElementById('sectorSelect')
        if (sectorSelect && data) {
            sectorSelect.innerHTML = '<option value="">Sektör seçin</option>' +
                data.map(cat => `<option value="${cat.id}">${cat.icon || ''} ${cat.name}</option>`).join('')
        }
        
        console.log('✅ Sektörler yüklendi')
    } catch (error) {
        console.error('❌ Sektör yükleme hatası:', error)
    }
}

// Load cities
async function loadCities() {
    try {
        const { data, error } = await supabase
            .from('cities')
            .select('id, name')
            .order('name')
        
        if (error) throw error
        
        const citySelect = document.getElementById('hqCitySelect')
        if (citySelect && data) {
            citySelect.innerHTML = '<option value="">Şehir seçin</option>' +
                data.map(city => `<option value="${city.id}">${city.name}</option>`).join('')
        }
        
        console.log('✅ Şehirler yüklendi')
    } catch (error) {
        console.error('❌ Şehir yükleme hatası:', error)
    }
}

// Step Navigation
function goToStep(step) {
    if (step < 1 || step > totalSteps) return
    
    // Validate current step before moving forward
    if (step > currentStep && !validateStep(currentStep)) {
        return
    }
    
    // Hide all steps
    document.querySelectorAll('.form-step').forEach(s => s.classList.remove('active'))
    
    // Show target step
    document.getElementById(`step${step}`).classList.add('active')
    
    // Update step progress
    updateStepProgress(step)
    
    currentStep = step
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' })
    
    // Generate preview on last step
    if (step === totalSteps) {
        generatePreview()
    }
}

function nextStep() {
    if (currentStep < totalSteps) {
        goToStep(currentStep + 1)
    }
}

function prevStep() {
    if (currentStep > 1) {
        goToStep(currentStep - 1)
    }
}

function updateStepProgress(activeStep) {
    document.querySelectorAll('.step-item').forEach((item, index) => {
        const stepNum = index + 1
        item.classList.remove('active', 'completed')
        
        if (stepNum < activeStep) {
            item.classList.add('completed')
        } else if (stepNum === activeStep) {
            item.classList.add('active')
        }
    })
}

function validateStep(step) {
    // Step 7 özet sayfası - doğrulama gerekmez
    if (step === 7) return true
    
    const stepEl = document.getElementById(`step${step}`)
    if (!stepEl) return true
    
    const requiredFields = stepEl.querySelectorAll('[required]')
    let isValid = true
    
    requiredFields.forEach(field => {
        if (!field.value) {
            field.style.borderColor = '#ef4444'
            isValid = false
        } else {
            field.style.borderColor = '#e2e8f0'
        }
    })
    
    if (!isValid) {
        alert('⚠️ Lütfen zorunlu alanları doldurun!')
    }
    
    return isValid
}

// Step items click navigation
document.querySelectorAll('.step-item').forEach((item, index) => {
    item.addEventListener('click', () => {
        const targetStep = index + 1
        if (targetStep <= currentStep + 1) {
            goToStep(targetStep)
        }
    })
})

// File Uploads
function setupFileUploads() {
    console.log('🔧 Dosya yükleme ayarlanıyor...')
    
    // Logo upload
    const logoUpload = document.getElementById('logoUpload')
    if (logoUpload) {
        console.log('✅ Logo input bulundu')
        logoUpload.addEventListener('change', (e) => {
            console.log('🖼️ Logo dosyası seçildi')
            previewFile(e.target.files[0], 'logoPreview')
        })
    } else {
        console.log('❌ Logo input bulunamadı!')
    }
    
    // Investor document upload
    const investorDoc = document.getElementById('investorDoc')
    if (investorDoc) {
        investorDoc.addEventListener('change', (e) => {
            showDocumentSelected(e.target, 'investorDoc')
        })
    }
    
    // Brochure document upload
    const brochureDoc = document.getElementById('brochureDoc')
    if (brochureDoc) {
        brochureDoc.addEventListener('change', (e) => {
            showDocumentSelected(e.target, 'brochureDoc')
        })
    }
    
    // Thumbnail upload
    const thumbnailUpload = document.getElementById('thumbnailUpload')
    if (thumbnailUpload) {
        thumbnailUpload.addEventListener('change', (e) => {
            previewFile(e.target.files[0], 'thumbnailPreview')
        })
    }
}

function previewFile(file, previewId) {
    if (!file) {
        console.log('❌ Dosya seçilmedi')
        return
    }
    
    console.log('📷 Dosya seçildi:', file.name, '(' + (file.size / 1024 / 1024).toFixed(2) + ' MB)')
    
    const reader = new FileReader()
    reader.onload = (e) => {
        const preview = document.getElementById(previewId)
        if (preview) {
            preview.innerHTML = `<img src="${e.target.result}" alt="Preview" style="max-width: 200px; max-height: 200px; border-radius: 8px; border: 2px solid #10b981;">`
            console.log('✅ Önizleme gösterildi:', previewId)
        } else {
            console.log('❌ Preview elementi bulunamadı:', previewId)
        }
    }
    reader.onerror = (e) => {
        console.error('❌ Dosya okuma hatası:', e)
    }
    reader.readAsDataURL(file)
}

// Show document selected feedback
function showDocumentSelected(input, inputId) {
    if (!input.files || input.files.length === 0) return
    
    const file = input.files[0]
    const label = document.querySelector(`label[for="${inputId}"]`)
    
    if (label) {
        const fileName = file.name
        const fileSize = (file.size / 1024 / 1024).toFixed(2) + ' MB'
        
        label.innerHTML = `
            <span class="doc-icon" style="color: #10b981;">✅</span>
            <span style="font-weight: 600; color: #10b981;">${fileName}</span>
            <span class="doc-hint" style="color: #6b7280;">${fileSize} - Dosya seçildi</span>
        `
        label.style.borderColor = '#10b981'
        label.style.backgroundColor = '#f0fdf4'
    }
}

// Gallery Upload
function setupGalleryUpload() {
    const dropZone = document.getElementById('galleryDropZone')
    const fileInput = document.getElementById('galleryUpload')
    
    if (!dropZone || !fileInput) return
    
    dropZone.addEventListener('click', () => fileInput.click())
    
    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault()
        dropZone.style.borderColor = 'var(--secondary-color)'
    })
    
    dropZone.addEventListener('dragleave', () => {
        dropZone.style.borderColor = '#e2e8f0'
    })
    
    dropZone.addEventListener('drop', (e) => {
        e.preventDefault()
        dropZone.style.borderColor = '#e2e8f0'
        handleGalleryFiles(e.dataTransfer.files)
    })
    
    fileInput.addEventListener('change', (e) => {
        handleGalleryFiles(e.target.files)
    })
}

function handleGalleryFiles(files) {
    Array.from(files).forEach(file => {
        if (galleryImages.length >= 20) {
            alert('Maksimum 20 görsel yükleyebilirsiniz!')
            return
        }
        
        if (file.size > 4 * 1024 * 1024) {
            alert(`${file.name} dosyası 4MB'dan büyük!`)
            return
        }
        
        const reader = new FileReader()
        reader.onload = (e) => {
            galleryImages.push({ file, preview: e.target.result })
            renderGalleryPreviews()
        }
        reader.readAsDataURL(file)
    })
}

function renderGalleryPreviews() {
    const previewGrid = document.getElementById('galleryPreviewGrid')
    if (!previewGrid) return
    
    previewGrid.innerHTML = galleryImages.map((img, index) => `
        <div class="preview-item">
            <img src="${img.preview}" alt="Preview">
            <button type="button" class="remove-btn" onclick="removeGalleryImage(${index})">✕</button>
        </div>
    `).join('')
}

function removeGalleryImage(index) {
    galleryImages.splice(index, 1)
    renderGalleryPreviews()
}

// FAQ Management
let faqCount = 0

function addFaqItem() {
    faqCount++
    const container = document.getElementById('faqContainer')
    if (!container) return
    
    const faqItem = document.createElement('div')
    faqItem.className = 'faq-item'
    faqItem.id = `faq-${faqCount}`
    faqItem.innerHTML = `
        <div class="form-group">
            <label>Soru ${faqCount}</label>
            <input type="text" name="faq_question_${faqCount}" placeholder="Soruyu girin...">
        </div>
        <div class="form-group">
            <label>Cevap</label>
            <textarea name="faq_answer_${faqCount}" rows="3" placeholder="Cevabı girin..."></textarea>
        </div>
        <button type="button" class="btn btn-prev" onclick="removeFaqItem(${faqCount})" style="padding: 0.5rem 1rem; font-size: 0.85rem;">Sil</button>
    `
    
    container.appendChild(faqItem)
}

function removeFaqItem(id) {
    const item = document.getElementById(`faq-${id}`)
    if (item && faqCount > 1) {
        item.remove()
    }
}

// Generate Preview
function generatePreview() {
    const form = document.getElementById('franchiseForm')
    const formData = new FormData(form)
    
    const previewSummary = document.getElementById('previewSummary')
    if (!previewSummary) return
    
    const brandName = formData.get('brand_name') || 'Belirtilmedi'
    const sector = document.getElementById('sectorSelect')?.selectedOptions[0]?.text || 'Belirtilmedi'
    const minInvestment = formData.get('min_investment') || '0'
    const maxInvestment = formData.get('max_investment') || '0'
    
    previewSummary.innerHTML = `
        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 1.5rem;">
            <div style="padding: 1rem; background: #f8fafc; border-radius: 8px;">
                <h4 style="color: var(--secondary-color); margin-bottom: 0.5rem;">Marka</h4>
                <p style="font-size: 1.2rem; font-weight: 600;">${brandName}</p>
            </div>
            <div style="padding: 1rem; background: #f8fafc; border-radius: 8px;">
                <h4 style="color: var(--secondary-color); margin-bottom: 0.5rem;">Sektör</h4>
                <p style="font-size: 1.2rem; font-weight: 600;">${sector}</p>
            </div>
            <div style="padding: 1rem; background: #f8fafc; border-radius: 8px;">
                <h4 style="color: var(--secondary-color); margin-bottom: 0.5rem;">Yatırım Aralığı</h4>
                <p style="font-size: 1.2rem; font-weight: 600;">₺${parseInt(minInvestment).toLocaleString('tr-TR')} - ₺${parseInt(maxInvestment).toLocaleString('tr-TR')}</p>
            </div>
            <div style="padding: 1rem; background: #f8fafc; border-radius: 8px;">
                <h4 style="color: var(--secondary-color); margin-bottom: 0.5rem;">İletişim</h4>
                <p style="font-size: 1rem;">${formData.get('contact_name') || 'Belirtilmedi'}</p>
                <p style="font-size: 0.9rem; color: #64748b;">${formData.get('contact_email') || ''}</p>
            </div>
        </div>
    `
}

function showPreview() {
    alert('Önizleme özelliği yakında eklenecek!')
}

// Form Submission
function setupFormSubmission() {
    const form = document.getElementById('franchiseForm')
    if (!form) return
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault()
        e.stopPropagation()
        
        console.log('🚀 Form submit event triggered!')
        
        // Son adımdaki zorunlu alanları kontrol et
        const isValid = validateStep(7)
        console.log('✅ Validation result:', isValid)
        
        if (!isValid) {
            console.log('❌ Validation failed, stopping submission')
            return
        }
        
        console.log('📝 Franchise formu gönderiliyor...')
        
        // Submit butonunu devre dışı bırak
        const submitBtn = form.querySelector('button[type="submit"]')
        if (submitBtn) {
            submitBtn.disabled = true
            submitBtn.innerHTML = '⏳ Gönderiliyor...'
        }
        
        const formData = new FormData(form)
        
        // Collect regions
        const regions = []
        document.querySelectorAll('input[name="regions"]:checked').forEach(cb => {
            regions.push(cb.value)
        })
        
        // Collect services
        const oneTimeServices = []
        document.querySelectorAll('input[name="one_time_services"]:checked').forEach(cb => {
            oneTimeServices.push(cb.value)
        })
        
        const ongoingServices = []
        document.querySelectorAll('input[name="ongoing_services"]:checked').forEach(cb => {
            ongoingServices.push(cb.value)
        })
        
        const supportAreas = []
        document.querySelectorAll('input[name="support_areas"]:checked').forEach(cb => {
            supportAreas.push(cb.value)
        })
        
        // Prepare franchise data
        const franchiseData = {
            brand_name: formData.get('brand_name'),
            parent_company: formData.get('parent_company'),
            founded_year: parseInt(formData.get('founded_year')) || null,
            sector_id: parseInt(formData.get('sector')) || null,
            hq_country: formData.get('hq_country'),
            hq_city_id: parseInt(formData.get('hq_city')) || null,
            website: formData.get('website'),
            description: formData.get('description'),
            
            // Investment
            min_investment: parseFloat(formData.get('min_investment')) || 0,
            max_investment: parseFloat(formData.get('max_investment')) || 0,
            currency: formData.get('currency'),
            setup_cost_per_sqm: parseFloat(formData.get('setup_cost_per_sqm')) || null,
            profit_share: parseFloat(formData.get('profit_share')) || null,
            revenue_share: parseFloat(formData.get('revenue_share')) || null,
            roi_months: parseInt(formData.get('roi_months')) || null,
            avg_monthly_revenue: parseFloat(formData.get('avg_monthly_revenue')) || null,
            avg_monthly_profit: parseFloat(formData.get('avg_monthly_profit')) || null,
            
            // Operations
            total_locations: parseInt(formData.get('total_locations')) || 0,
            total_franchisees: parseInt(formData.get('total_franchisees')) || 0,
            regions: regions,
            min_sqm: parseInt(formData.get('min_sqm')) || null,
            min_staff: parseInt(formData.get('min_staff')) || null,
            max_staff: parseInt(formData.get('max_staff')) || null,
            
            // Partner requirements
            min_capital: parseFloat(formData.get('min_capital')) || 0,
            experience_required: formData.get('experience_required'),
            ideal_candidate: formData.get('ideal_candidate'),
            
            // Support
            initial_training_months: parseInt(formData.get('initial_training_months')) || null,
            ongoing_training: formData.get('ongoing_training') === 'yes',
            one_time_services: oneTimeServices,
            ongoing_services: ongoingServices,
            support_areas: supportAreas,
            
            // Social
            facebook: formData.get('facebook'),
            instagram: formData.get('instagram'),
            linkedin: formData.get('linkedin'),
            youtube: formData.get('youtube'),
            twitter: formData.get('twitter'),
            
            // Contact
            contact_name: formData.get('contact_name'),
            contact_position: formData.get('contact_position'),
            contact_phone: formData.get('contact_phone'),
            contact_email: formData.get('contact_email'),
            
            // Additional
            additional_info: formData.get('additional_info'),
            
            // Status
            status: 'pending',
            is_franchise: true
        }
        
        console.log('📊 Franchise verisi:', franchiseData)
        
        try {
            // For now, we'll use the listings table with is_franchise = true
            // In production, you might want a separate franchises table
            
            const user = await getCurrentUser()
            if (!user) {
                alert('⚠️ Oturum süresi dolmuş. Lütfen tekrar giriş yapın.')
                // Butonu tekrar aktif et
                const submitBtn = form.querySelector('button[type="submit"]')
                if (submitBtn) {
                    submitBtn.disabled = false
                    submitBtn.innerHTML = 'Franchise İlanını Başlat'
                }
                window.location.href = 'login.html'
                return
            }
            
            // Generate slug
            const slug = franchiseData.brand_name
                .toLowerCase()
                .replace(/[çÇ]/g, 'c')
                .replace(/[ğĞ]/g, 'g')
                .replace(/[ıİ]/g, 'i')
                .replace(/[öÖ]/g, 'o')
                .replace(/[şŞ]/g, 's')
                .replace(/[üÜ]/g, 'u')
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/^-+|-+$/g, '')
            
            // Franchise tablosuna kaydet
            const franchiseRecord = {
                user_id: user.id,
                
                // Temel Bilgiler
                brand_name: franchiseData.brand_name,
                slug: slug + '-' + Date.now(),
                parent_company: franchiseData.parent_company || null,
                founded_year: franchiseData.founded_year,
                sector_id: franchiseData.sector_id,
                hq_country: franchiseData.hq_country || 'Türkiye',
                hq_city_id: franchiseData.hq_city_id,
                website: franchiseData.website || null,
                description: franchiseData.description || null,
                
                // Yatırım Bilgileri
                min_investment: franchiseData.min_investment || 0,
                max_investment: franchiseData.max_investment || 0,
                currency: franchiseData.currency || 'TRY',
                setup_cost_per_sqm: franchiseData.setup_cost_per_sqm,
                profit_share: franchiseData.profit_share,
                revenue_share: franchiseData.revenue_share,
                roi_months: franchiseData.roi_months,
                avg_monthly_revenue: franchiseData.avg_monthly_revenue,
                avg_monthly_profit: franchiseData.avg_monthly_profit,
                
                // Operasyon Bilgileri
                total_locations: franchiseData.total_locations || 0,
                total_franchisees: franchiseData.total_franchisees || 0,
                regions: franchiseData.regions || [],
                min_sqm: franchiseData.min_sqm,
                min_staff: franchiseData.min_staff,
                max_staff: franchiseData.max_staff,
                
                // Ortak Gereksinimleri
                min_capital: franchiseData.min_capital,
                experience_required: franchiseData.experience_required || null,
                ideal_candidate: franchiseData.ideal_candidate || null,
                
                // Eğitim & Destek
                initial_training_months: franchiseData.initial_training_months,
                ongoing_training: franchiseData.ongoing_training || false,
                one_time_services: oneTimeServices || [],
                ongoing_services: ongoingServices || [],
                support_areas: supportAreas || [],
                
                // Sosyal Medya
                facebook: franchiseData.facebook || null,
                instagram: franchiseData.instagram || null,
                linkedin: franchiseData.linkedin || null,
                youtube: franchiseData.youtube || null,
                twitter: franchiseData.twitter || null,
                
                // İletişim
                contact_name: franchiseData.contact_name,
                contact_position: franchiseData.contact_position || null,
                contact_phone: franchiseData.contact_phone,
                contact_email: franchiseData.contact_email,
                
                // Ek Bilgiler
                additional_info: franchiseData.additional_info || null,
                
                // Durum
                status: 'pending'
            }
            
            // Generate a unique ID for file uploads first
            const tempId = crypto.randomUUID()
            
            // Upload files FIRST before inserting franchise
            let logoUrl = null
            let brochureUrl = null
            const galleryUrls = []
            
            try {
                // 1. Upload logo
                const logoInput = document.getElementById('logoUpload')
                if (logoInput && logoInput.files && logoInput.files.length > 0) {
                    const logoFile = logoInput.files[0]
                    const logoExt = logoFile.name.split('.').pop()
                    const logoPath = `${tempId}/logo-${Date.now()}.${logoExt}`
                    
                    console.log('📤 Logo yükleniyor:', logoPath)
                    const { data: logoData, error: logoError } = await supabase.storage
                        .from('franchise-images')
                        .upload(logoPath, logoFile, {
                            cacheControl: '3600',
                            upsert: false
                        })
                    
                    if (logoError) {
                        console.error('❌ Logo yükleme hatası:', logoError)
                    } else {
                        const { data: { publicUrl } } = supabase.storage
                            .from('franchise-images')
                            .getPublicUrl(logoPath)
                        logoUrl = publicUrl
                        console.log('✅ Logo yüklendi:', logoUrl)
                    }
                }
                
                // 2. Upload brochure PDF
                const brochureInput = document.getElementById('brochureDoc')
                if (brochureInput && brochureInput.files && brochureInput.files.length > 0) {
                    const brochureFile = brochureInput.files[0]
                    const brochureExt = brochureFile.name.split('.').pop()
                    const brochurePath = `${tempId}/brochure-${Date.now()}.${brochureExt}`
                    
                    console.log('📤 Broşür yükleniyor:', brochurePath)
                    const { data: brochureData, error: brochureError } = await supabase.storage
                        .from('franchise-documents')
                        .upload(brochurePath, brochureFile, {
                            cacheControl: '3600',
                            upsert: false
                        })
                    
                    if (brochureError) {
                        console.error('❌ Broşür yükleme hatası:', brochureError)
                    } else {
                        const { data: { publicUrl } } = supabase.storage
                            .from('franchise-documents')
                            .getPublicUrl(brochurePath)
                        brochureUrl = publicUrl
                        console.log('✅ Broşür yüklendi:', brochureUrl)
                    }
                }
                
                // 3. Upload investor presentation PDF
                const investorInput = document.getElementById('investorDoc')
                if (investorInput && investorInput.files && investorInput.files.length > 0) {
                    const investorFile = investorInput.files[0]
                    const investorExt = investorFile.name.split('.').pop()
                    const investorPath = `${tempId}/investor-${Date.now()}.${investorExt}`
                    
                    console.log('📤 Yatırımcı sunumu yükleniyor:', investorPath)
                    const { data: investorData, error: investorError } = await supabase.storage
                        .from('franchise-documents')
                        .upload(investorPath, investorFile, {
                            cacheControl: '3600',
                            upsert: false
                        })
                    
                    if (investorError) {
                        console.error('❌ Yatırımcı sunumu yükleme hatası:', investorError)
                    } else {
                        const { data: { publicUrl } } = supabase.storage
                            .from('franchise-documents')
                            .getPublicUrl(investorPath)
                        // Store in brochureUrl if no brochure (or add separate field)
                        if (!brochureUrl) brochureUrl = publicUrl
                        console.log('✅ Yatırımcı sunumu yüklendi:', publicUrl)
                    }
                }
                
                // 4. Upload gallery images
                if (galleryImages && galleryImages.length > 0) {
                    console.log('📤 Galeri resimleri yükleniyor:', galleryImages.length, 'adet')
                    
                    for (let i = 0; i < galleryImages.length; i++) {
                        const fileObj = galleryImages[i]
                        const file = fileObj.file
                        const ext = file.name.split('.').pop()
                        const path = `${tempId}/gallery-${Date.now()}-${i}.${ext}`
                        
                        const { data: imgData, error: imgError } = await supabase.storage
                            .from('franchise-images')
                            .upload(path, file, {
                                cacheControl: '3600',
                                upsert: false
                            })
                        
                        if (imgError) {
                            console.error('❌ Galeri resmi yükleme hatası:', imgError)
                        } else {
                            const { data: { publicUrl } } = supabase.storage
                                .from('franchise-images')
                                .getPublicUrl(path)
                            galleryUrls.push(publicUrl)
                            console.log('✅ Galeri resmi yüklendi:', publicUrl)
                        }
                    }
                }
            } catch (uploadError) {
                console.error('❌ Dosya yükleme hatası:', uploadError)
            }
            
            // Add file URLs to franchise record BEFORE insert
            if (logoUrl) franchiseRecord.logo_url = logoUrl
            if (brochureUrl) franchiseRecord.brochure_url = brochureUrl
            if (galleryUrls.length > 0) franchiseRecord.gallery_images = galleryUrls
            
            console.log('📤 Franchise verisi gönderiliyor:', franchiseRecord)
            
            // Insert the franchise record with ALL data including file URLs
            const { data, error } = await supabase
                .from('franchises')
                .insert([franchiseRecord])
                .select()
                .single()
            
            if (error) throw error
            
            console.log('✅ Franchise kaydedildi:', data)
            const franchiseId = data.id
            
            alert('✅ Franchise ilanınız başarıyla oluşturuldu!\n\nİlan No: ' + franchiseId.substring(0, 8) + '\n\nAdmin onayından sonra yayınlanacaktır.')
            window.location.href = 'franchise.html'
            
        } catch (error) {
            console.error('❌ Form gönderim hatası:', error)
            alert('❌ Bir hata oluştu: ' + error.message)
            
            // Butonu tekrar aktif et
            const submitBtn = form.querySelector('button[type="submit"]')
            if (submitBtn) {
                submitBtn.disabled = false
                submitBtn.innerHTML = 'Franchise İlanını Başlat'
            }
        }
    })
}

console.log('✅ Franchise form JS yüklendi!')

