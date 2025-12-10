// ============================================
// SUPABASE CONFIGURATION
// ============================================

import { createClient } from '@supabase/supabase-js'

// Supabase credentials - .env dosyasından alın
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://higrbnrjpwjnypzeodpm.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhpZ3JibnJqcHdqbnlwemVvZHBtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUyNzg5NjUsImV4cCI6MjA4MDg1NDk2NX0.Zg9wGmcwmc3P1PsDMwQtApycxK6unjsdl-u6_msC5Jg'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// ============================================
// USER FUNCTIONS (Kullanıcı İşlemleri)
// ============================================

// Kullanıcı kaydı
export async function signUp(email, password, fullName) {
    try {
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email,
            password,
        })

        if (authError) throw authError

        // Create user profile
        const { data, error } = await supabase
            .from('users')
            .insert([
                {
                    id: authData.user.id,
                    email,
                    full_name: fullName,
                }
            ])
            .select()

        return { data, error }
    } catch (error) {
        console.error('Sign up error:', error)
        return { data: null, error }
    }
}

// Kullanıcı girişi
export async function signIn(email, password) {
    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        })

        return { data, error }
    } catch (error) {
        console.error('Sign in error:', error)
        return { data: null, error }
    }
}

// Çıkış
export async function signOut() {
    const { error } = await supabase.auth.signOut()
    return { error }
}

// Mevcut kullanıcıyı al
export async function getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser()
    return user
}

// Kullanıcı profilini güncelle
export async function updateUserProfile(userId, updates) {
    const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', userId)
        .select()

    return { data, error }
}

// ============================================
// LISTING FUNCTIONS (İlan İşlemleri)
// ============================================

// Tüm aktif ilanları getir
export async function getActiveListings(limit = 20, offset = 0) {
    const { data, error, count } = await supabase
        .from('listings')
        .select(`
            *,
            category:categories!category_id(name, slug),
            city:cities(name),
            district:districts(name),
            images:listing_images(image_url, is_primary),
            user:users(full_name, phone)
        `, { count: 'exact' })
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1)

    return { data, error, count }
}

// Öne çıkan ilanları getir
export async function getFeaturedListings(limit = 6) {
    const { data, error } = await supabase
        .from('listings')
        .select(`
            *,
            category:categories!category_id(name, slug),
            city:cities(name),
            district:districts(name),
            images:listing_images(image_url, is_primary)
        `)
        .eq('status', 'active')
        .eq('is_featured', true)
        .order('created_at', { ascending: false })
        .limit(limit)

    return { data, error }
}

// İlan detayını getir
export async function getListingById(id) {
    const { data, error } = await supabase
        .from('listings')
        .select(`
            *,
            category:categories!category_id(name, slug),
            city:cities(name),
            district:districts(name),
            images:listing_images(*),
            user:users(full_name, phone, email)
        `)
        .eq('id', id)
        .single()

    // View count artır
    if (data) {
        await incrementViewCount(id)
    }

    return { data, error }
}

// İlan slug'a göre getir
export async function getListingBySlug(slug) {
    const { data, error } = await supabase
        .from('listings')
        .select(`
            *,
            category:categories!category_id(name, slug),
            city:cities(name),
            district:districts(name),
            images:listing_images(*),
            user:users(full_name, phone, email)
        `)
        .eq('slug', slug)
        .single()

    return { data, error }
}

// İlan oluştur
export async function createListing(listingData) {
    const user = await getCurrentUser()
    if (!user) {
        return { data: null, error: { message: 'User not authenticated' } }
    }

    // Slug oluştur
    const slug = generateSlug(listingData.title)

    const { data, error } = await supabase
        .from('listings')
        .insert([
            {
                ...listingData,
                user_id: user.id,
                slug,
                status: 'pending' // Admin onayı gerekli
            }
        ])
        .select()

    return { data, error }
}

// İlan güncelle
export async function updateListing(listingId, updates) {
    const user = await getCurrentUser()
    if (!user) {
        return { data: null, error: { message: 'User not authenticated' } }
    }

    const { data, error } = await supabase
        .from('listings')
        .update(updates)
        .eq('id', listingId)
        .eq('user_id', user.id)
        .select()

    return { data, error }
}

// İlan sil
export async function deleteListing(listingId) {
    const user = await getCurrentUser()
    if (!user) {
        return { error: { message: 'User not authenticated' } }
    }

    const { error } = await supabase
        .from('listings')
        .delete()
        .eq('id', listingId)
        .eq('user_id', user.id)

    return { error }
}

// İlan ara (filtrelerle)
export async function searchListings(filters = {}) {
    let query = supabase
        .from('listings')
        .select(`
            *,
            category:categories!category_id(name, slug),
            city:cities(name),
            district:districts(name),
            images:listing_images(image_url, is_primary)
        `, { count: 'exact' })
        .eq('status', 'active')

    // Search query
    if (filters.search) {
        query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`)
    }

    // Category filter
    if (filters.categoryId) {
        query = query.eq('category_id', filters.categoryId)
    }

    // City filter
    if (filters.cityId) {
        query = query.eq('city_id', filters.cityId)
    }

    // District filter
    if (filters.districtId) {
        query = query.eq('district_id', filters.districtId)
    }

    // Price range
    if (filters.minPrice) {
        query = query.gte('price', filters.minPrice)
    }
    if (filters.maxPrice) {
        query = query.lte('price', filters.maxPrice)
    }

    // Area range
    if (filters.minArea) {
        query = query.gte('area_sqm', filters.minArea)
    }
    if (filters.maxArea) {
        query = query.lte('area_sqm', filters.maxArea)
    }

    // Franchise filter
    if (filters.isFranchise !== undefined) {
        query = query.eq('is_franchise', filters.isFranchise)
    }

    // Sorting
    const sortBy = filters.sortBy || 'created_at'
    const sortOrder = filters.sortOrder || 'desc'
    query = query.order(sortBy, { ascending: sortOrder === 'asc' })

    // Pagination
    const limit = filters.limit || 20
    const offset = filters.offset || 0
    query = query.range(offset, offset + limit - 1)

    const { data, error, count } = await query

    return { data, error, count }
}

// View count artır
async function incrementViewCount(listingId) {
    const { error } = await supabase.rpc('increment_view_count', {
        listing_id: listingId
    })

    // RPC yoksa manuel artır
    if (error) {
        await supabase
            .from('listings')
            .update({ view_count: supabase.raw('view_count + 1') })
            .eq('id', listingId)
    }
}

// ============================================
// IMAGE FUNCTIONS (Görsel İşlemleri)
// ============================================

// Görsel yükle
export async function uploadListingImage(listingId, file) {
    const user = await getCurrentUser()
    if (!user) {
        return { data: null, error: { message: 'User not authenticated' } }
    }

    const fileExt = file.name.split('.').pop()
    const fileName = `${listingId}/${Date.now()}.${fileExt}`

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
        .from('listing-images')
        .upload(fileName, file)

    if (uploadError) {
        return { data: null, error: uploadError }
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
        .from('listing-images')
        .getPublicUrl(fileName)

    // Save to database
    const { data, error } = await supabase
        .from('listing_images')
        .insert([
            {
                listing_id: listingId,
                image_url: publicUrl,
                display_order: 0
            }
        ])
        .select()

    return { data, error }
}

// Görselleri getir
export async function getListingImages(listingId) {
    const { data, error } = await supabase
        .from('listing_images')
        .select('*')
        .eq('listing_id', listingId)
        .order('display_order')

    return { data, error }
}

// Görsel sil
export async function deleteListingImage(imageId) {
    const { error } = await supabase
        .from('listing_images')
        .delete()
        .eq('id', imageId)

    return { error }
}

// ============================================
// FAVORITE FUNCTIONS (Favori İşlemleri)
// ============================================

// Favorilere ekle
export async function addToFavorites(listingId) {
    const user = await getCurrentUser()
    if (!user) {
        return { data: null, error: { message: 'User not authenticated' } }
    }

    const { data, error } = await supabase
        .from('favorites')
        .insert([
            {
                user_id: user.id,
                listing_id: listingId
            }
        ])
        .select()

    return { data, error }
}

// Favorilerden çıkar
export async function removeFromFavorites(listingId) {
    const user = await getCurrentUser()
    if (!user) {
        return { error: { message: 'User not authenticated' } }
    }

    const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('user_id', user.id)
        .eq('listing_id', listingId)

    return { error }
}

// Kullanıcının favori ilanlarını getir
export async function getUserFavorites() {
    const user = await getCurrentUser()
    if (!user) {
        return { data: [], error: { message: 'User not authenticated' } }
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

    return { data, error }
}

// İlan favoride mi kontrol et
export async function isListingFavorited(listingId) {
    const user = await getCurrentUser()
    if (!user) return false

    const { data } = await supabase
        .from('favorites')
        .select('id')
        .eq('user_id', user.id)
        .eq('listing_id', listingId)
        .single()

    return !!data
}

// ============================================
// CATEGORY FUNCTIONS (Kategori İşlemleri)
// ============================================

// Tüm kategorileri getir
export async function getAllCategories() {
    const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('display_order')

    return { data, error }
}

// Kategori ile ilan sayısı
export async function getCategoriesWithCount() {
    const { data, error } = await supabase
        .from('categories')
        .select(`
            *,
            listings:listings(count)
        `)
        .eq('is_active', true)
        .order('display_order')

    return { data, error }
}

// ============================================
// LOCATION FUNCTIONS (Konum İşlemleri)
// ============================================

// Tüm şehirleri getir
export async function getAllCities() {
    const { data, error } = await supabase
        .from('cities')
        .select('*')
        .eq('is_active', true)
        .order('name')

    return { data, error }
}

// Şehre göre ilçeleri getir
export async function getDistrictsByCity(cityId) {
    const { data, error } = await supabase
        .from('districts')
        .select('*')
        .eq('city_id', cityId)
        .eq('is_active', true)
        .order('name')

    return { data, error }
}

// ============================================
// MESSAGE FUNCTIONS (Mesaj İşlemleri)
// ============================================

// Mesaj gönder
export async function sendMessage(receiverId, listingId, subject, message) {
    const user = await getCurrentUser()
    if (!user) {
        return { data: null, error: { message: 'User not authenticated' } }
    }

    const { data, error } = await supabase
        .from('messages')
        .insert([
            {
                sender_id: user.id,
                receiver_id: receiverId,
                listing_id: listingId,
                subject,
                message
            }
        ])
        .select()

    return { data, error }
}

// Kullanıcının mesajlarını getir
export async function getUserMessages() {
    const user = await getCurrentUser()
    if (!user) {
        return { data: [], error: { message: 'User not authenticated' } }
    }

    const { data, error } = await supabase
        .from('messages')
        .select(`
            *,
            sender:users!sender_id(full_name, email),
            receiver:users!receiver_id(full_name, email),
            listing:listings(title, slug)
        `)
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .order('created_at', { ascending: false })

    return { data, error }
}

// Mesajı okundu olarak işaretle
export async function markMessageAsRead(messageId) {
    const { error } = await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('id', messageId)

    return { error }
}

// ============================================
// CONTACT FUNCTIONS (İletişim İşlemleri)
// ============================================

// İletişim formu gönder
export async function submitContactForm(formData) {
    const { data, error } = await supabase
        .from('contact_requests')
        .insert([formData])
        .select()

    return { data, error }
}

// ============================================
// STATISTICS FUNCTIONS (İstatistik İşlemleri)
// ============================================

// Platform istatistikleri
export async function getPlatformStats() {
    const { data, error } = await supabase.rpc('get_listing_stats')

    return { data, error }
}

// En popüler kategoriler
export async function getTopCategories(limit = 5) {
    const { data, error } = await supabase
        .from('categories')
        .select(`
            *,
            listings:listings(count)
        `)
        .eq('is_active', true)
        .order('listings(count)', { ascending: false })
        .limit(limit)

    return { data, error }
}

// En çok görüntülenen ilanlar
export async function getMostViewedListings(limit = 10) {
    const { data, error } = await supabase
        .from('listings')
        .select(`
            *,
            category:categories!category_id(name),
            city:cities(name),
            images:listing_images(image_url, is_primary)
        `)
        .eq('status', 'active')
        .order('view_count', { ascending: false })
        .limit(limit)

    return { data, error }
}

// ============================================
// UTILITY FUNCTIONS (Yardımcı Fonksiyonlar)
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
export function formatPrice(price) {
    return new Intl.NumberFormat('tr-TR', {
        style: 'currency',
        currency: 'TRY',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(price)
}

// Tarih formatla
export function formatDate(date) {
    return new Intl.DateTimeFormat('tr-TR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    }).format(new Date(date))
}

export default supabase

