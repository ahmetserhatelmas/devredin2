// ============================================
// FRONTEND - BACKEND ENTEGRASYONU
// ============================================

// Bu dosyayı HTML dosyalarınıza dahil edin
// <script src="backend/api.js"></script>

// ============================================
// CONFIGURATION (js/runtime-config.js — .env + npm run build)
// ============================================

function readDevretinEnv() {
    var e = (typeof window !== 'undefined' && window.__DEVRETIN_ENV__) || {}
    return {
        url: String(e.SUPABASE_URL || '').trim(),
        anonKey: String(e.SUPABASE_ANON_KEY || '').trim()
    }
}

const SUPABASE_CONFIG = readDevretinEnv()

if (!SUPABASE_CONFIG.url || !SUPABASE_CONFIG.anonKey) {
    console.error(
        '[Devret Link] SUPABASE_URL / SUPABASE_ANON_KEY yok. ' +
            'Kökte .env oluştur (.env.example) → npm run build → js/runtime-config.js. Vercel: Environment Variables.'
    )
}

// Initialize Supabase (boşsa istekler hata verir — build şart)
supabase = window.supabase.createClient(
    SUPABASE_CONFIG.url || 'https://invalid.local',
    SUPABASE_CONFIG.anonKey || 'invalid'
)

// Diğer sayfalar (login vb.) için — doğrudan fetch ile şifre sıfırlama kullanılır
window.__DEVRETIN_SUPABASE__ = {
    url: SUPABASE_CONFIG.url,
    anonKey: SUPABASE_CONFIG.anonKey
}

/**
 * Auth e-posta linkleri (şifre sıfırlama, kayıt doğrulama) için site kökü.
 * SITE_URL runtime-config’ta (Vercel env) → canlıda https://devretlink.com
 * Boşsa window.location.origin (localhost geliştirme).
 */
function getDevretinSiteOrigin() {
    var e = (typeof window !== 'undefined' && window.__DEVRETIN_ENV__) || {}
    var site = String(e.SITE_URL || '').trim().replace(/\/$/, '')
    if (site) return site
    if (typeof window !== 'undefined' && window.location && window.location.origin) {
        return String(window.location.origin).replace(/\/$/, '')
    }
    return ''
}
window.getDevretinSiteOrigin = getDevretinSiteOrigin

// ============================================
// AUTH FUNCTIONS - Session Management
// ============================================

// Session cache key
const USER_CACHE_KEY = 'devret link_user_cache'
const PROFILE_CACHE_KEY = 'devret link_profile_cache'

// Cached user data for instant display
let cachedUser = null
let cachedProfile = null

// Initialize cached data from localStorage
function initCachedData() {
    try {
        const userCache = localStorage.getItem(USER_CACHE_KEY)
        const profileCache = localStorage.getItem(PROFILE_CACHE_KEY)
        
        if (userCache) cachedUser = JSON.parse(userCache)
        if (profileCache) cachedProfile = JSON.parse(profileCache)
    } catch (e) {
        console.warn('Cache read error:', e)
    }
}

// Save user data to cache
function saveToCache(user, profile) {
    try {
        if (user) {
            localStorage.setItem(USER_CACHE_KEY, JSON.stringify(user))
            cachedUser = user
        }
        if (profile) {
            localStorage.setItem(PROFILE_CACHE_KEY, JSON.stringify(profile))
            cachedProfile = profile
        }
    } catch (e) {
        console.warn('Cache save error:', e)
    }
}

// Clear cache on logout
function clearCache() {
    localStorage.removeItem(USER_CACHE_KEY)
    localStorage.removeItem(PROFILE_CACHE_KEY)
    cachedUser = null
    cachedProfile = null
}

// Get cached user (instant, no API call)
function getCachedUser() {
    return cachedUser
}

// Get cached profile (instant, no API call)
function getCachedProfile() {
    return cachedProfile
}

// Kullanıcı girişi
async function loginUser(email, password) {
    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        })

        if (error) throw error

        // Cache user data
        saveToCache(data.user, null)
        
        // Fetch and cache profile
        const profile = await fetchUserProfile(data.user.id)
        if (profile) {
            saveToCache(data.user, profile)
        }

        // Navbar (js/auth.js) anında güncellensin — yönlendirmeden önce
        var uName = data.user.email ? data.user.email.split('@')[0] : 'Kullanıcı'
        var inits = uName.slice(0, 2).toUpperCase()
        if (profile && profile.full_name) {
            uName = profile.full_name
            inits = uName.split(' ').map(function (n) { return n[0] }).join('').toUpperCase().slice(0, 2)
        }
        try {
            localStorage.setItem('devredin_user', JSON.stringify({ initials: inits, name: uName }))
        } catch (e) {}

        console.log('Login successful:', data)
        return { success: true, data }
    } catch (error) {
        console.error('Login error:', error.message)
        const msg = (error.message || '').toLowerCase()
        const code = error.code || error.name || ''
        if (
            msg.includes('email not confirmed') ||
            msg.includes('not confirmed') ||
            code === 'email_not_confirmed'
        ) {
            return {
                success: false,
                code: 'EMAIL_NOT_CONFIRMED',
                error:
                    'E-posta adresiniz henüz doğrulanmadı. Kayıt olduğunuz adrese gelen 6 haneli kodu girin veya e-postadaki doğrulama bağlantısına tıklayın.'
            }
        }
        return { success: false, error: error.message }
    }
}

// Kayıt sonrası yönlendirme (e-posta doğrulama linki + Supabase şablonundaki {{ .Token }} OTP)
function getSignupEmailRedirectUrl() {
    if (typeof window === 'undefined') return undefined
    return getDevretinSiteOrigin() + '/login.html?verified=true'
}

// Kullanıcı kaydı — e-posta onayı açıksa session gelmez; kullanıcı OTP veya link ile doğrular
async function registerUser(email, password, fullName, phone) {
    try {
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email,
            password,
            options: {
                emailRedirectTo: getSignupEmailRedirectUrl(),
                data: {
                    full_name: fullName,
                    phone: phone
                }
            }
        })

        if (authError) throw authError

        const u = authData.user
        const emailConfirmed = !!(u && u.email_confirmed_at)
        // E-posta doğrulanmadıysa kayıt “tamamlanmış” sayılmaz (Supabase panelde Confirm email açık olmalı)
        const needsEmailVerification = !!(u && !emailConfirmed)

        if (u) {
            try {
                await supabase.from('users').upsert({
                    id: u.id,
                    email: email,
                    full_name: fullName,
                    phone: phone || null
                })
            } catch (upsertErr) {
                console.warn('users upsert (kayıt):', upsertErr)
            }
        }

        // Confirm email kapalıyken Supabase bazen yine session verir — yine de doğrulama akışına sokmak için kapat
        if (needsEmailVerification && authData.session) {
            try {
                await supabase.auth.signOut()
            } catch (so) {
                console.warn('signOut after signup:', so)
            }
            clearCache()
        } else if (!needsEmailVerification && authData.session) {
            saveToCache(authData.user, { full_name: fullName, phone })
        } else {
            clearCache()
        }

        if (needsEmailVerification && !emailConfirmed) {
            console.log(
                '✅ Kayıt oluşturuldu — e-posta doğrulaması bekleniyor. Supabase’de Authentication → Providers → Email → Confirm email açık olmalı; aksi halde posta gitmez.'
            )
        }

        console.log('✅ Registration successful:', authData, 'needsEmailVerification:', needsEmailVerification)
        return { success: true, data: authData, needsEmailVerification }
    } catch (error) {
        console.error('❌ Registration error:', error.message)
        return { success: false, error: error.message }
    }
}

/** Kayıt doğrulama: e-postadaki 6 haneli kod (Supabase şablonunda {{ .Token }}) */
async function verifySignupWithOtp(email, token) {
    try {
        const clean = String(token || '').replace(/\s/g, '')
        if (!clean) throw new Error('Lütfen doğrulama kodunu girin.')

        const { data, error } = await supabase.auth.verifyOtp({
            email: String(email || '').trim(),
            token: clean,
            type: 'signup'
        })

        if (error) throw error

        if (data.user) {
            saveToCache(data.user, null)
            const profile = await fetchUserProfile(data.user.id)
            if (profile) saveToCache(data.user, profile)
        }

        console.log('✅ E-posta doğrulandı (OTP)')
        return { success: true, data }
    } catch (error) {
        console.error('❌ OTP doğrulama:', error.message)
        return { success: false, error: error.message }
    }
}

/** Kayıt doğrulama e-postasını tekrar gönder */
async function resendSignupVerificationEmail(email) {
    try {
        const { error } = await supabase.auth.resend({
            type: 'signup',
            email: String(email || '').trim(),
            options: {
                emailRedirectTo: getSignupEmailRedirectUrl()
            }
        })
        if (error) throw error
        return { success: true }
    } catch (error) {
        console.error('❌ Doğrulama e-postası tekrar:', error.message)
        return { success: false, error: error.message }
    }
}

/**
 * Şifre sıfırlama — doğrudan GoTrue /recover.
 * Supabase SMTP (Outlook) takılınca sunucu yanıt vermez; tarayıcıda istek "pending" kalır.
 * Promise.race ile süre dolunca arayüz mutlaka kurtulur (AbortController tek başına her zaman yetmez).
 */
async function sendPasswordResetEmail(email, redirectTo) {
    const target = redirectTo || (typeof window !== 'undefined'
        ? getDevretinSiteOrigin() + '/reset-password.html'
        : '')
    const base = SUPABASE_CONFIG.url.replace(/\/$/, '')
    const url = base + '/auth/v1/recover?redirect_to=' + encodeURIComponent(target)

    const ctrl = new AbortController()
    const timeoutMs = 15000
    var timeoutId

    var timeoutPromise = new Promise(function (_, reject) {
        timeoutId = setTimeout(function () {
            try { ctrl.abort() } catch (e) {}
            reject({ __passwordResetTimeout: true })
        }, timeoutMs)
    })

    var fetchPromise = (async function () {
        var res = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'apikey': SUPABASE_CONFIG.anonKey,
                'Authorization': 'Bearer ' + SUPABASE_CONFIG.anonKey
            },
            body: JSON.stringify({ email: (email || '').trim() }),
            signal: ctrl.signal
        })
        var text = await res.text()
        return { res: res, text: text }
    })()

    try {
        var out = await Promise.race([fetchPromise, timeoutPromise])
        clearTimeout(timeoutId)

        var res = out.res
        var text = out.text
        var body = {}
        try {
            body = text ? JSON.parse(text) : {}
        } catch (e) { /* metin JSON değilse */ }

        if (!res.ok) {
            var errMsg = body.error_description || body.msg || body.message || body.error || text || ('HTTP ' + res.status)
            console.error('❌ Şifre sıfırlama API:', res.status, body)
            return { success: false, error: String(errMsg) }
        }

        console.log('✅ Şifre sıfırlama isteği gönderildi:', email)
        return { success: true }
    } catch (err) {
        if (timeoutId) clearTimeout(timeoutId)
        if (err && err.__passwordResetTimeout === true) {
            return {
                success: false,
                error: 'Sunucu ' + (timeoutMs / 1000) + ' sn içinde yanıt vermedi. Çoğunlukla Supabase → Authentication → Email (SMTP) Outlook bağlantısında takılma olur. Port 587 + uygulama şifresi deneyin; veya geçici olarak "Custom SMTP" kapatıp varsayılan göndericiyle test edin.'
            }
        }
        if (err && err.name === 'AbortError') {
            return {
                success: false,
                error: 'İstek iptal edildi (zaman aşımı). SMTP / Outlook ayarlarını Supabase panelinde kontrol edin.'
            }
        }
        console.error('❌ Şifre sıfırlama ağı:', err)
        return { success: false, error: (err && err.message) ? err.message : String(err) }
    }
}

// Şifre sıfırlama e-postası gönder (fetch tabanlı)
async function resetPassword(email) {
    const r = await sendPasswordResetEmail(email)
    return r
}

// Yeni şifre belirle
async function updatePassword(newPassword) {
    try {
        const { error } = await supabase.auth.updateUser({
            password: newPassword
        })
        
        if (error) throw error
        
        console.log('✅ Şifre başarıyla güncellendi')
        return { success: true }
    } catch (error) {
        console.error('❌ Şifre güncelleme hatası:', error.message)
        return { success: false, error: error.message }
    }
}

// Çıkış yap
async function logoutUser() {
    clearCache()
    const { error } = await supabase.auth.signOut()
    if (!error) {
        window.location.href = 'index.html'
    }
}

// Mevcut kullanıcıyı al
async function getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser()
    
    // Update cache if user exists
    if (user) {
        saveToCache(user, cachedProfile)
    } else {
        clearCache()
    }
    
    return user
}

// Fetch user profile from database
async function fetchUserProfile(userId) {
    try {
        const { data, error } = await supabase
            .from('users')
            .select('full_name, phone, email, avatar_url')
            .eq('id', userId)
            .single()
        
        if (error) throw error
        return data
    } catch (error) {
        console.warn('Profile fetch error:', error)
        return null
    }
}

// ============================================
// UNIFIED NAVBAR MANAGEMENT
// ============================================

// Initialize navbar with cached data first, then verify
async function initializeNavbar() {
    const navLoading = document.getElementById('navLoading')
    const loggedOut = document.getElementById('loggedOutButtons')
    const loggedIn = document.getElementById('loggedInButtons')
    const userName = document.getElementById('userName')
    
    if (!navLoading && !loggedOut && !loggedIn) return
    
    // STEP 1: Show cached data immediately (no flicker)
    initCachedData()
    
    if (cachedUser && cachedProfile) {
        // Show logged in state immediately
        if (navLoading) navLoading.style.display = 'none'
        if (loggedOut) loggedOut.style.display = 'none'
        if (loggedIn) loggedIn.style.display = 'flex'
        
        if (userName && cachedProfile.full_name) {
            const firstName = cachedProfile.full_name.split(' ')[0]
            userName.textContent = `👤 ${firstName}`
        }
        
        console.log('📌 Navbar: Using cached user data')
    }
    
    // STEP 2: Verify with API in background
    const user = await getCurrentUser()
    
    if (navLoading) navLoading.style.display = 'none'
    
    if (user) {
        if (loggedOut) loggedOut.style.display = 'none'
        if (loggedIn) loggedIn.style.display = 'flex'
        
        // Fetch fresh profile if not cached or different user
        if (!cachedProfile || cachedUser?.id !== user.id) {
            const profile = await fetchUserProfile(user.id)
            if (profile) {
                saveToCache(user, profile)
                if (userName && profile.full_name) {
                    const firstName = profile.full_name.split(' ')[0]
                    userName.textContent = `👤 ${firstName}`
                }
            }
        }
    } else {
        // Not logged in
        if (loggedOut) loggedOut.style.display = 'flex'
        if (loggedIn) loggedIn.style.display = 'none'
        clearCache()
    }
}

// Handle logout with smooth transition
async function handleLogout() {
    if (confirm('Çıkış yapmak istediğinize emin misiniz?')) {
        // Clear cache first for instant UI update
        clearCache()
        
        // Update UI immediately
        const loggedOut = document.getElementById('loggedOutButtons')
        const loggedIn = document.getElementById('loggedInButtons')
        if (loggedOut) loggedOut.style.display = 'flex'
        if (loggedIn) loggedIn.style.display = 'none'
        
        // Then do actual logout
        await supabase.auth.signOut()
        window.location.href = 'index.html'
    }
}

// initializeNavbar is available to call manually from pages that need it
// Most pages use checkAuth() from auth.js instead

// Initialize cache on script load
initCachedData()

// ============================================
// LISTING FUNCTIONS
// ============================================

// İlanları yükle (ana sayfa ve listeler için)
async function loadListings(filters = {}) {
    try {
        let query = supabase
            .from('listings')
            .select(`
                *,
                category:categories!category_id(name, slug, icon),
                city:cities(name),
                district:districts(name),
                images:listing_images(image_url, thumbnail_url, is_primary)
            `)
            .eq('status', 'active')

        // Filtreleri uygula
        if (filters.categoryId) {
            query = query.eq('category_id', filters.categoryId)
        }

        if (filters.cityId) {
            query = query.eq('city_id', filters.cityId)
        }

        if (filters.search) {
            query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`)
        }

        if (filters.minPrice) {
            query = query.gte('price', filters.minPrice)
        }

        if (filters.maxPrice) {
            query = query.lte('price', filters.maxPrice)
        }

        // Sıralama
        const sortBy = filters.sortBy || 'created_at'
        const sortOrder = filters.sortOrder === 'asc' ? true : false
        query = query.order(sortBy, { ascending: sortOrder })

        // Sayfalama
        if (filters.limit) {
            const offset = (filters.page - 1) * filters.limit || 0
            query = query.range(offset, offset + filters.limit - 1)
        } else {
            query = query.limit(20)
        }

        const { data, error } = await query

        if (error) throw error

        return { success: true, data }
    } catch (error) {
        console.error('Error loading listings:', error)
        return { success: false, error: error.message }
    }
}

// İlan detayını yükle
async function loadListingDetail(listingId) {
    try {
        const { data, error } = await supabase
            .from('listings')
            .select(`
                *,
                category:categories!category_id(name, slug, icon),
                city:cities(name),
                district:districts(name),
                images:listing_images(*),
                user:users(full_name, phone, email)
            `)
            .eq('id', listingId)
            .single()

        if (error) throw error

        // View count artır
        await supabase.rpc('increment_view_count', { listing_id: listingId })

        return { success: true, data }
    } catch (error) {
        console.error('Error loading listing:', error)
        return { success: false, error: error.message }
    }
}

// Yeni ilan oluştur
async function createListing(formData) {
    try {
        const user = await getCurrentUser()
        if (!user) {
            throw new Error('Giriş yapmalısınız')
        }

        // Slug oluştur
        const slug = generateSlug(formData.title)

        const { data, error } = await supabase
            .from('listings')
            .insert([
                {
                    ...formData,
                    user_id: user.id,
                    slug,
                    status: 'pending' // Admin onayı bekliyor
                }
            ])
            .select()
            .single()

        if (error) throw error

        console.log('Listing created:', data)
        return { success: true, data }
    } catch (error) {
        console.error('Error creating listing:', error)
        return { success: false, error: error.message }
    }
}

// ============================================
// CATEGORY FUNCTIONS
// ============================================

// Kategorileri yükle
async function loadCategories() {
    try {
        const { data, error } = await supabase
            .from('categories')
            .select('*')
            .eq('is_active', true)
            .order('display_order')

        if (error) throw error

        return { success: true, data }
    } catch (error) {
        console.error('Error loading categories:', error)
        return { success: false, error: error.message }
    }
}

// Kategori ile ilan sayısını getir
async function loadCategoriesWithCount() {
    try {
        const { data: categories, error: catError } = await supabase
            .from('categories')
            .select('*')
            .eq('is_active', true)
            .order('display_order')

        if (catError) throw catError

        // Her kategori için ilan sayısını al
        const categoriesWithCount = await Promise.all(
            categories.map(async (cat) => {
                const { count } = await supabase
                    .from('listings')
                    .select('*', { count: 'exact', head: true })
                    .eq('category_id', cat.id)
                    .eq('status', 'active')

                return { ...cat, listing_count: count || 0 }
            })
        )

        return { success: true, data: categoriesWithCount }
    } catch (error) {
        console.error('Error loading categories with count:', error)
        return { success: false, error: error.message }
    }
}

// ============================================
// LOCATION FUNCTIONS
// ============================================

// Şehirleri yükle
async function loadCities() {
    try {
        const { data, error } = await supabase
            .from('cities')
            .select('*')
            .eq('is_active', true)
            .order('name')

        if (error) throw error

        return { success: true, data }
    } catch (error) {
        console.error('Error loading cities:', error)
        return { success: false, error: error.message }
    }
}

// İlçeleri yükle
async function loadDistricts(cityId) {
    try {
        const { data, error } = await supabase
            .from('districts')
            .select('*')
            .eq('city_id', cityId)
            .eq('is_active', true)
            .order('name')

        if (error) throw error

        return { success: true, data }
    } catch (error) {
        console.error('Error loading districts:', error)
        return { success: false, error: error.message }
    }
}

// ============================================
// FAVORITE FUNCTIONS
// ============================================

// Favorilere ekle/çıkar (toggle)
async function toggleFavorite(listingId) {
    try {
        const user = await getCurrentUser()
        if (!user) {
            alert('Favorilere eklemek için giriş yapmalısınız')
            window.location.href = 'login.html'
            return
        }

        // Önce favori var mı kontrol et
        const { data: existing } = await supabase
            .from('favorites')
            .select('id')
            .eq('user_id', user.id)
            .eq('listing_id', listingId)
            .single()

        if (existing) {
            // Favorilerden çıkar
            const { error } = await supabase
                .from('favorites')
                .delete()
                .eq('id', existing.id)

            if (error) throw error

            return { success: true, action: 'removed' }
        } else {
            // Favorilere ekle
            const { error } = await supabase
                .from('favorites')
                .insert([
                    {
                        user_id: user.id,
                        listing_id: listingId
                    }
                ])

            if (error) throw error

            return { success: true, action: 'added' }
        }
    } catch (error) {
        console.error('Error toggling favorite:', error)
        return { success: false, error: error.message }
    }
}

// Kullanıcının favori ilanlarını yükle
async function loadUserFavorites() {
    try {
        const user = await getCurrentUser()
        if (!user) {
            return { success: true, data: [] }
        }

        const { data, error } = await supabase
            .from('favorites')
            .select(`
                *,
                listing:listings(
                    *,
                    category:categories!category_id(name),
                    city:cities(name),
                    images:listing_images(image_url, is_primary)
                )
            `)
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })

        if (error) throw error

        return { success: true, data }
    } catch (error) {
        console.error('Error loading favorites:', error)
        return { success: false, error: error.message }
    }
}

// ============================================
// STATISTICS FUNCTIONS
// ============================================

// Platform istatistiklerini yükle
async function loadPlatformStats() {
    try {
        // Toplam ilan sayısı
        const { count: totalListings } = await supabase
            .from('listings')
            .select('*', { count: 'exact', head: true })

        // Aktif ilan sayısı
        const { count: activeListings } = await supabase
            .from('listings')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'active')

        // Toplam değer ve ortalama
        const { data: priceData } = await supabase
            .from('listings')
            .select('price')
            .eq('status', 'active')

        const totalValue = priceData.reduce((sum, item) => sum + (item.price || 0), 0)
        const averageValue = totalValue / (priceData.length || 1)

        return {
            success: true,
            data: {
                total_listings: totalListings || 0,
                active_listings: activeListings || 0,
                total_value: totalValue,
                average_value: averageValue
            }
        }
    } catch (error) {
        console.error('Error loading stats:', error)
        return { success: false, error: error.message }
    }
}

// ============================================
// IMAGE UPLOAD FUNCTIONS
// ============================================

// Görsel yükle
async function uploadListingImage(listingId, file) {
    try {
        const user = await getCurrentUser()
        if (!user) throw new Error('Giriş yapmalısınız')

        // Dosya adı oluştur
        const fileExt = file.name.split('.').pop()
        const fileName = `${user.id}/${listingId}/${Date.now()}.${fileExt}`

        // Storage'a yükle
        const { data: uploadData, error: uploadError } = await supabase.storage
            .from('listing-images')
            .upload(fileName, file)

        if (uploadError) throw uploadError

        // Public URL al
        const { data: { publicUrl } } = supabase.storage
            .from('listing-images')
            .getPublicUrl(fileName)

        // Database'e kaydet
        const { data, error } = await supabase
            .from('listing_images')
            .insert([
                {
                    listing_id: listingId,
                    image_url: publicUrl
                }
            ])
            .select()
            .single()

        if (error) throw error

        return { success: true, data }
    } catch (error) {
        console.error('Error uploading image:', error)
        return { success: false, error: error.message }
    }
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

// Slug oluştur
function generateSlug(text) {
    const turkishMap = {
        'ç': 'c', 'Ç': 'C',
        'ğ': 'g', 'Ğ': 'G',
        'ı': 'i', 'İ': 'I',
        'ö': 'o', 'Ö': 'O',
        'ş': 's', 'Ş': 'S',
        'ü': 'u', 'Ü': 'U'
    }

    return text
        .split('')
        .map(char => turkishMap[char] || char)
        .join('')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .substring(0, 200)
}

// Fiyat formatla
function formatPrice(price) {
    if (!price) return '₺0'
    return new Intl.NumberFormat('tr-TR', {
        style: 'currency',
        currency: 'TRY',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(price)
}

// Tarih formatla
function formatDate(dateString) {
    if (!dateString) return ''
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('tr-TR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    }).format(date)
}

// Göreceli tarih (2 gün önce, 1 hafta önce vb.)
function timeAgo(dateString) {
    const date = new Date(dateString)
    const now = new Date()
    const seconds = Math.floor((now - date) / 1000)

    const intervals = {
        yıl: 31536000,
        ay: 2592000,
        hafta: 604800,
        gün: 86400,
        saat: 3600,
        dakika: 60
    }

    for (let [name, value] of Object.entries(intervals)) {
        const interval = Math.floor(seconds / value)
        if (interval >= 1) {
            return `${interval} ${name} önce`
        }
    }

    return 'Az önce'
}

// ============================================
// CONSOLE LOG
// ============================================

console.log('✅ Backend API loaded successfully!')
console.log('📡 Supabase client initialized')

