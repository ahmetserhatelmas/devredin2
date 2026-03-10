-- ============================================
-- DEVREDIN PLATFORM - TAM GÜVENLİK (RLS) POLİTİKALARI
-- Supabase SQL Editor'de TÜMÜNÜ çalıştırın
-- ============================================
-- Admin e-postaları merkezi tanım
-- ============================================

-- ============================================
-- 1. USERS TABLOSU
-- ============================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users_select" ON users;
CREATE POLICY "users_select" ON users
FOR SELECT USING (
    auth.uid() = id OR
    auth.jwt() ->> 'email' IN (
        'ahmetserhatelmas@gmail.com',
        'ahmetserhatelmas@hotmail.com',
        'ahmetserhatelmas@hotmaail.com'
    )
);

DROP POLICY IF EXISTS "users_insert" ON users;
CREATE POLICY "users_insert" ON users
FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "users_update" ON users;
CREATE POLICY "users_update" ON users
FOR UPDATE USING (
    auth.uid() = id OR
    auth.jwt() ->> 'email' IN (
        'ahmetserhatelmas@gmail.com',
        'ahmetserhatelmas@hotmail.com',
        'ahmetserhatelmas@hotmaail.com'
    )
);

DROP POLICY IF EXISTS "users_delete" ON users;
CREATE POLICY "users_delete" ON users
FOR DELETE USING (
    auth.jwt() ->> 'email' IN (
        'ahmetserhatelmas@gmail.com',
        'ahmetserhatelmas@hotmail.com',
        'ahmetserhatelmas@hotmaail.com'
    )
);

-- ============================================
-- 2. PROFILES TABLOSU
-- ============================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_select" ON profiles;
CREATE POLICY "profiles_select" ON profiles
FOR SELECT USING (
    auth.uid() = id OR
    auth.jwt() ->> 'email' IN (
        'ahmetserhatelmas@gmail.com',
        'ahmetserhatelmas@hotmail.com',
        'ahmetserhatelmas@hotmaail.com'
    )
);

DROP POLICY IF EXISTS "profiles_insert" ON profiles;
CREATE POLICY "profiles_insert" ON profiles
FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_update" ON profiles;
CREATE POLICY "profiles_update" ON profiles
FOR UPDATE USING (auth.uid() = id);

-- ============================================
-- 3. CATEGORIES TABLOSU (Sadece okuma - salt referans verisi)
-- ============================================
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "categories_select_public" ON categories;
CREATE POLICY "categories_select_public" ON categories
FOR SELECT USING (is_active = true OR
    auth.jwt() ->> 'email' IN (
        'ahmetserhatelmas@gmail.com',
        'ahmetserhatelmas@hotmail.com',
        'ahmetserhatelmas@hotmaail.com'
    )
);

DROP POLICY IF EXISTS "categories_admin_all" ON categories;
CREATE POLICY "categories_admin_all" ON categories
FOR ALL USING (
    auth.jwt() ->> 'email' IN (
        'ahmetserhatelmas@gmail.com',
        'ahmetserhatelmas@hotmail.com',
        'ahmetserhatelmas@hotmaail.com'
    )
);

-- ============================================
-- 4. CITIES TABLOSU (Salt okuma)
-- ============================================
ALTER TABLE cities ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "cities_select_public" ON cities;
CREATE POLICY "cities_select_public" ON cities
FOR SELECT USING (true);

DROP POLICY IF EXISTS "cities_admin_all" ON cities;
CREATE POLICY "cities_admin_all" ON cities
FOR ALL USING (
    auth.jwt() ->> 'email' IN (
        'ahmetserhatelmas@gmail.com',
        'ahmetserhatelmas@hotmail.com',
        'ahmetserhatelmas@hotmaail.com'
    )
);

-- ============================================
-- 5. DISTRICTS TABLOSU (Salt okuma)
-- ============================================
ALTER TABLE districts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "districts_select_public" ON districts;
CREATE POLICY "districts_select_public" ON districts
FOR SELECT USING (true);

DROP POLICY IF EXISTS "districts_admin_all" ON districts;
CREATE POLICY "districts_admin_all" ON districts
FOR ALL USING (
    auth.jwt() ->> 'email' IN (
        'ahmetserhatelmas@gmail.com',
        'ahmetserhatelmas@hotmail.com',
        'ahmetserhatelmas@hotmaail.com'
    )
);

-- ============================================
-- 6. LISTINGS TABLOSU (İşletme İlanları)
-- ============================================
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "listings_select_policy" ON listings;
CREATE POLICY "listings_select_policy" ON listings
FOR SELECT USING (
    status = 'active' OR
    auth.uid() = user_id OR
    auth.jwt() ->> 'email' IN (
        'ahmetserhatelmas@gmail.com',
        'ahmetserhatelmas@hotmail.com',
        'ahmetserhatelmas@hotmaail.com'
    )
);

DROP POLICY IF EXISTS "listings_insert_policy" ON listings;
CREATE POLICY "listings_insert_policy" ON listings
FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "listings_update_policy" ON listings;
CREATE POLICY "listings_update_policy" ON listings
FOR UPDATE USING (
    auth.uid() = user_id OR
    auth.jwt() ->> 'email' IN (
        'ahmetserhatelmas@gmail.com',
        'ahmetserhatelmas@hotmail.com',
        'ahmetserhatelmas@hotmaail.com'
    )
);

DROP POLICY IF EXISTS "listings_delete_policy" ON listings;
CREATE POLICY "listings_delete_policy" ON listings
FOR DELETE USING (
    auth.uid() = user_id OR
    auth.jwt() ->> 'email' IN (
        'ahmetserhatelmas@gmail.com',
        'ahmetserhatelmas@hotmail.com',
        'ahmetserhatelmas@hotmaail.com'
    )
);

-- ============================================
-- 7. LISTING_IMAGES TABLOSU
-- ============================================
ALTER TABLE listing_images ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "listing_images_select" ON listing_images;
CREATE POLICY "listing_images_select" ON listing_images
FOR SELECT USING (true);

DROP POLICY IF EXISTS "listing_images_insert" ON listing_images;
CREATE POLICY "listing_images_insert" ON listing_images
FOR INSERT WITH CHECK (
    EXISTS (
        SELECT 1 FROM listings
        WHERE id = listing_id AND user_id = auth.uid()
    )
);

DROP POLICY IF EXISTS "listing_images_delete" ON listing_images;
CREATE POLICY "listing_images_delete" ON listing_images
FOR DELETE USING (
    EXISTS (
        SELECT 1 FROM listings
        WHERE id = listing_id AND (
            user_id = auth.uid() OR
            auth.jwt() ->> 'email' IN (
                'ahmetserhatelmas@gmail.com',
                'ahmetserhatelmas@hotmail.com',
                'ahmetserhatelmas@hotmaail.com'
            )
        )
    )
);

-- ============================================
-- 8. FRANCHISES TABLOSU
-- ============================================
ALTER TABLE franchises ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "franchises_select" ON franchises;
CREATE POLICY "franchises_select" ON franchises
FOR SELECT USING (
    status = 'active' OR
    auth.uid() = user_id OR
    auth.jwt() ->> 'email' IN (
        'ahmetserhatelmas@gmail.com',
        'ahmetserhatelmas@hotmail.com',
        'ahmetserhatelmas@hotmaail.com'
    )
);

DROP POLICY IF EXISTS "franchises_insert" ON franchises;
CREATE POLICY "franchises_insert" ON franchises
FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "franchises_update" ON franchises;
CREATE POLICY "franchises_update" ON franchises
FOR UPDATE USING (
    auth.uid() = user_id OR
    auth.jwt() ->> 'email' IN (
        'ahmetserhatelmas@gmail.com',
        'ahmetserhatelmas@hotmail.com',
        'ahmetserhatelmas@hotmaail.com'
    )
);

DROP POLICY IF EXISTS "franchises_delete" ON franchises;
CREATE POLICY "franchises_delete" ON franchises
FOR DELETE USING (
    auth.uid() = user_id OR
    auth.jwt() ->> 'email' IN (
        'ahmetserhatelmas@gmail.com',
        'ahmetserhatelmas@hotmail.com',
        'ahmetserhatelmas@hotmaail.com'
    )
);

-- ============================================
-- 9. FRANCHISE_INQUIRIES TABLOSU
-- ============================================
ALTER TABLE franchise_inquiries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "franchise_inquiries_select" ON franchise_inquiries;
CREATE POLICY "franchise_inquiries_select" ON franchise_inquiries
FOR SELECT USING (
    auth.uid() = user_id OR
    auth.jwt() ->> 'email' IN (
        'ahmetserhatelmas@gmail.com',
        'ahmetserhatelmas@hotmail.com',
        'ahmetserhatelmas@hotmaail.com'
    )
);

DROP POLICY IF EXISTS "franchise_inquiries_insert" ON franchise_inquiries;
CREATE POLICY "franchise_inquiries_insert" ON franchise_inquiries
FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "franchise_inquiries_update" ON franchise_inquiries;
CREATE POLICY "franchise_inquiries_update" ON franchise_inquiries
FOR UPDATE USING (
    auth.jwt() ->> 'email' IN (
        'ahmetserhatelmas@gmail.com',
        'ahmetserhatelmas@hotmail.com',
        'ahmetserhatelmas@hotmaail.com'
    )
);

-- ============================================
-- 10. FAVORITES TABLOSU
-- ============================================
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "favorites_select" ON favorites;
CREATE POLICY "favorites_select" ON favorites
FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "favorites_insert" ON favorites;
CREATE POLICY "favorites_insert" ON favorites
FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "favorites_delete" ON favorites;
CREATE POLICY "favorites_delete" ON favorites
FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- 11. OFFERS TABLOSU (Teklifler)
-- ============================================
ALTER TABLE offers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "offers_select" ON offers;
CREATE POLICY "offers_select" ON offers
FOR SELECT USING (
    auth.uid() = sender_id OR
    auth.uid() = receiver_id OR
    auth.jwt() ->> 'email' IN (
        'ahmetserhatelmas@gmail.com',
        'ahmetserhatelmas@hotmail.com',
        'ahmetserhatelmas@hotmaail.com'
    )
);

DROP POLICY IF EXISTS "offers_insert" ON offers;
CREATE POLICY "offers_insert" ON offers
FOR INSERT WITH CHECK (auth.uid() = sender_id);

DROP POLICY IF EXISTS "offers_update" ON offers;
CREATE POLICY "offers_update" ON offers
FOR UPDATE USING (
    auth.uid() = sender_id OR
    auth.uid() = receiver_id OR
    auth.jwt() ->> 'email' IN (
        'ahmetserhatelmas@gmail.com',
        'ahmetserhatelmas@hotmail.com',
        'ahmetserhatelmas@hotmaail.com'
    )
);

DROP POLICY IF EXISTS "offers_delete" ON offers;
CREATE POLICY "offers_delete" ON offers
FOR DELETE USING (
    auth.uid() = sender_id OR
    auth.jwt() ->> 'email' IN (
        'ahmetserhatelmas@gmail.com',
        'ahmetserhatelmas@hotmail.com',
        'ahmetserhatelmas@hotmaail.com'
    )
);

-- ============================================
-- 12. MESSAGES TABLOSU
-- ============================================
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "messages_select" ON messages;
CREATE POLICY "messages_select" ON messages
FOR SELECT USING (
    auth.uid() = sender_id OR
    auth.uid() = receiver_id OR
    auth.jwt() ->> 'email' IN (
        'ahmetserhatelmas@gmail.com',
        'ahmetserhatelmas@hotmail.com',
        'ahmetserhatelmas@hotmaail.com'
    )
);

DROP POLICY IF EXISTS "messages_insert" ON messages;
CREATE POLICY "messages_insert" ON messages
FOR INSERT WITH CHECK (auth.uid() = sender_id);

DROP POLICY IF EXISTS "messages_update" ON messages;
CREATE POLICY "messages_update" ON messages
FOR UPDATE USING (
    auth.uid() = sender_id OR
    auth.uid() = receiver_id
);

-- ============================================
-- 13. CONTACT_MESSAGES TABLOSU
-- ============================================
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "contact_messages_insert" ON contact_messages;
CREATE POLICY "contact_messages_insert" ON contact_messages
FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "contact_messages_select" ON contact_messages;
CREATE POLICY "contact_messages_select" ON contact_messages
FOR SELECT USING (
    auth.jwt() ->> 'email' IN (
        'ahmetserhatelmas@gmail.com',
        'ahmetserhatelmas@hotmail.com',
        'ahmetserhatelmas@hotmaail.com'
    )
);

DROP POLICY IF EXISTS "contact_messages_update" ON contact_messages;
CREATE POLICY "contact_messages_update" ON contact_messages
FOR UPDATE USING (
    auth.jwt() ->> 'email' IN (
        'ahmetserhatelmas@gmail.com',
        'ahmetserhatelmas@hotmail.com',
        'ahmetserhatelmas@hotmaail.com'
    )
);

-- ============================================
-- 14. CONTACT_REQUESTS TABLOSU
-- ============================================
ALTER TABLE contact_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "contact_requests_insert" ON contact_requests;
CREATE POLICY "contact_requests_insert" ON contact_requests
FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "contact_requests_select" ON contact_requests;
CREATE POLICY "contact_requests_select" ON contact_requests
FOR SELECT USING (
    auth.jwt() ->> 'email' IN (
        'ahmetserhatelmas@gmail.com',
        'ahmetserhatelmas@hotmail.com',
        'ahmetserhatelmas@hotmaail.com'
    )
);

-- ============================================
-- 15. BLOG_POSTS TABLOSU
-- ============================================
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "blog_posts_select_policy" ON blog_posts;
CREATE POLICY "blog_posts_select_policy" ON blog_posts
FOR SELECT USING (
    status = 'published' OR
    auth.uid() = author_id OR
    auth.jwt() ->> 'email' IN (
        'ahmetserhatelmas@gmail.com',
        'ahmetserhatelmas@hotmail.com',
        'ahmetserhatelmas@hotmaail.com'
    )
);

DROP POLICY IF EXISTS "blog_posts_insert_policy" ON blog_posts;
CREATE POLICY "blog_posts_insert_policy" ON blog_posts
FOR INSERT WITH CHECK (
    auth.jwt() ->> 'email' IN (
        'ahmetserhatelmas@gmail.com',
        'ahmetserhatelmas@hotmail.com',
        'ahmetserhatelmas@hotmaail.com'
    ) OR auth.uid() = author_id
);

DROP POLICY IF EXISTS "blog_posts_update_policy" ON blog_posts;
CREATE POLICY "blog_posts_update_policy" ON blog_posts
FOR UPDATE USING (
    auth.uid() = author_id OR
    auth.jwt() ->> 'email' IN (
        'ahmetserhatelmas@gmail.com',
        'ahmetserhatelmas@hotmail.com',
        'ahmetserhatelmas@hotmaail.com'
    )
);

DROP POLICY IF EXISTS "blog_posts_delete_policy" ON blog_posts;
CREATE POLICY "blog_posts_delete_policy" ON blog_posts
FOR DELETE USING (
    auth.uid() = author_id OR
    auth.jwt() ->> 'email' IN (
        'ahmetserhatelmas@gmail.com',
        'ahmetserhatelmas@hotmail.com',
        'ahmetserhatelmas@hotmaail.com'
    )
);

-- ============================================
-- 16. LISTING_VIEWS TABLOSU
-- ============================================
ALTER TABLE listing_views ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "listing_views_select" ON listing_views;
CREATE POLICY "listing_views_select" ON listing_views
FOR SELECT USING (
    auth.jwt() ->> 'email' IN (
        'ahmetserhatelmas@gmail.com',
        'ahmetserhatelmas@hotmail.com',
        'ahmetserhatelmas@hotmaail.com'
    )
);

DROP POLICY IF EXISTS "listing_views_insert" ON listing_views;
CREATE POLICY "listing_views_insert" ON listing_views
FOR INSERT WITH CHECK (true);

-- ============================================
-- 17. EMLAK_LISTINGS TABLOSU
-- ============================================
ALTER TABLE emlak_listings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "emlak_select_public" ON emlak_listings;
CREATE POLICY "emlak_select_public" ON emlak_listings
FOR SELECT USING (
    status = 'active' OR
    auth.uid() = user_id OR
    auth.jwt() ->> 'email' IN (
        'ahmetserhatelmas@gmail.com',
        'ahmetserhatelmas@hotmail.com',
        'ahmetserhatelmas@hotmaail.com'
    )
);

DROP POLICY IF EXISTS "emlak_insert_auth" ON emlak_listings;
CREATE POLICY "emlak_insert_auth" ON emlak_listings
FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "emlak_update_own" ON emlak_listings;
CREATE POLICY "emlak_update_own" ON emlak_listings
FOR UPDATE USING (
    auth.uid() = user_id OR
    auth.jwt() ->> 'email' IN (
        'ahmetserhatelmas@gmail.com',
        'ahmetserhatelmas@hotmail.com',
        'ahmetserhatelmas@hotmaail.com'
    )
);

DROP POLICY IF EXISTS "emlak_delete_own" ON emlak_listings;
CREATE POLICY "emlak_delete_own" ON emlak_listings
FOR DELETE USING (
    auth.uid() = user_id OR
    auth.jwt() ->> 'email' IN (
        'ahmetserhatelmas@gmail.com',
        'ahmetserhatelmas@hotmail.com',
        'ahmetserhatelmas@hotmaail.com'
    )
);

-- ============================================
-- 18. EMLAK_IMAGES TABLOSU
-- ============================================
ALTER TABLE emlak_images ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "emlak_images_select" ON emlak_images;
CREATE POLICY "emlak_images_select" ON emlak_images
FOR SELECT USING (true);

DROP POLICY IF EXISTS "emlak_images_insert" ON emlak_images;
CREATE POLICY "emlak_images_insert" ON emlak_images
FOR INSERT WITH CHECK (
    EXISTS (
        SELECT 1 FROM emlak_listings
        WHERE id = listing_id AND user_id = auth.uid()
    )
);

DROP POLICY IF EXISTS "emlak_images_delete" ON emlak_images;
CREATE POLICY "emlak_images_delete" ON emlak_images
FOR DELETE USING (
    EXISTS (
        SELECT 1 FROM emlak_listings
        WHERE id = listing_id AND (
            user_id = auth.uid() OR
            auth.jwt() ->> 'email' IN (
                'ahmetserhatelmas@gmail.com',
                'ahmetserhatelmas@hotmail.com',
                'ahmetserhatelmas@hotmaail.com'
            )
        )
    )
);

-- ============================================
-- STORAGE POLİTİKALARI
-- ============================================

-- listing-images bucket
DROP POLICY IF EXISTS "listing_images_public_read" ON storage.objects;
CREATE POLICY "listing_images_public_read" ON storage.objects
FOR SELECT USING (bucket_id = 'listing-images');

DROP POLICY IF EXISTS "listing_images_auth_upload" ON storage.objects;
CREATE POLICY "listing_images_auth_upload" ON storage.objects
FOR INSERT WITH CHECK (
    bucket_id = 'listing-images' AND auth.role() = 'authenticated'
);

DROP POLICY IF EXISTS "listing_images_owner_delete" ON storage.objects;
CREATE POLICY "listing_images_owner_delete" ON storage.objects
FOR DELETE USING (
    bucket_id = 'listing-images' AND
    auth.uid()::text = (storage.foldername(name))[1]
);

-- franchise-images bucket
DROP POLICY IF EXISTS "franchise_images_public_read" ON storage.objects;
CREATE POLICY "franchise_images_public_read" ON storage.objects
FOR SELECT USING (bucket_id = 'franchise-images');

DROP POLICY IF EXISTS "franchise_images_auth_upload" ON storage.objects;
CREATE POLICY "franchise_images_auth_upload" ON storage.objects
FOR INSERT WITH CHECK (
    bucket_id = 'franchise-images' AND auth.role() = 'authenticated'
);

DROP POLICY IF EXISTS "franchise_images_owner_delete" ON storage.objects;
CREATE POLICY "franchise_images_owner_delete" ON storage.objects
FOR DELETE USING (
    bucket_id = 'franchise-images' AND
    auth.uid()::text = (storage.foldername(name))[1]
);

-- emlak-images bucket
DROP POLICY IF EXISTS "emlak_images_public_read" ON storage.objects;
CREATE POLICY "emlak_images_public_read" ON storage.objects
FOR SELECT USING (bucket_id = 'emlak-images');

DROP POLICY IF EXISTS "emlak_images_auth_upload" ON storage.objects;
CREATE POLICY "emlak_images_auth_upload" ON storage.objects
FOR INSERT WITH CHECK (
    bucket_id = 'emlak-images' AND auth.role() = 'authenticated'
);

DROP POLICY IF EXISTS "emlak_images_owner_delete" ON storage.objects;
CREATE POLICY "emlak_images_owner_delete" ON storage.objects
FOR DELETE USING (
    bucket_id = 'emlak-images' AND
    auth.uid()::text = (storage.foldername(name))[1]
);
