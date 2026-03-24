-- Admin için tüm ilanları görme ve güncelleme izni
-- Bu SQL'i Supabase SQL Editor'de çalıştırın

-- SELECT Policy
DROP POLICY IF EXISTS "listings_select_policy" ON listings;
CREATE POLICY "listings_select_policy" ON listings
FOR SELECT
USING (
  auth.uid() = user_id OR 
  status = 'active' OR
  auth.jwt() ->> 'email' IN (
    'admin@admin.com',
    'admin@devretlink.com',
    'admin@devretlinkplatform.com',
    'admin@devredin.com',
    'admin@devredinplatform.com',
    'ahmetserhatelmas@hotmail.com',
    'ahmetserhatelmas@hotmaail.com',
    'ahmetserhatelmas@gmail.com',
    'devretlink@hotmail.com'
  )
);

-- UPDATE Policy (Admin için)
DROP POLICY IF EXISTS "listings_update_policy" ON listings;
CREATE POLICY "listings_update_policy" ON listings
FOR UPDATE
USING (
  auth.uid() = user_id OR
  auth.jwt() ->> 'email' IN (
    'admin@admin.com',
    'admin@devretlink.com',
    'admin@devretlinkplatform.com',
    'admin@devredin.com',
    'admin@devredinplatform.com',
    'ahmetserhatelmas@hotmail.com',
    'ahmetserhatelmas@hotmaail.com',
    'ahmetserhatelmas@gmail.com',
    'devretlink@hotmail.com'
  )
);

-- DELETE Policy (Admin için)
DROP POLICY IF EXISTS "listings_delete_policy" ON listings;
CREATE POLICY "listings_delete_policy" ON listings
FOR DELETE
USING (
  auth.uid() = user_id OR
  auth.jwt() ->> 'email' IN (
    'admin@admin.com',
    'admin@devretlink.com',
    'admin@devretlinkplatform.com',
    'admin@devredin.com',
    'admin@devredinplatform.com',
    'ahmetserhatelmas@hotmail.com',
    'ahmetserhatelmas@hotmaail.com',
    'ahmetserhatelmas@gmail.com',
    'devretlink@hotmail.com'
  )
);

-- ============================================
-- BLOG_POSTS RLS POLICIES (Blog Yazıları için Admin İzinleri)
-- ============================================

-- Enable RLS on blog_posts if not already enabled
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;

-- SELECT Policy (Herkes yayınlanmış yazıları görebilir, admin her şeyi görebilir)
DROP POLICY IF EXISTS "blog_posts_select_policy" ON blog_posts;
CREATE POLICY "blog_posts_select_policy" ON blog_posts
FOR SELECT
USING (
  -- Herkes yayınlanmış yazıları görebilir
  status = 'published' OR 
  -- Admin her şeyi görebilir
  auth.jwt() ->> 'email' IN (
    'admin@devretlink.com',
    'admin@devretlinkplatform.com',
    'ahmetserhatelmas@hotmail.com',
    'ahmetserhatelmas@hotmaail.com',
    'ahmetserhatelmas@gmail.com',
    'devretlink@hotmail.com'
  ) OR
  -- Yazarlar kendi yazılarını görebilir
  (author_id IS NOT NULL AND auth.uid() = author_id)
);

-- INSERT Policy (Admin ve yazarlar yazı ekleyebilir)
DROP POLICY IF EXISTS "blog_posts_insert_policy" ON blog_posts;
CREATE POLICY "blog_posts_insert_policy" ON blog_posts
FOR INSERT
WITH CHECK (
  -- Admin her zaman ekleyebilir
  auth.jwt() ->> 'email' IN (
    'admin@devretlink.com',
    'admin@devretlinkplatform.com',
    'ahmetserhatelmas@hotmail.com',
    'ahmetserhatelmas@hotmaail.com',
    'ahmetserhatelmas@gmail.com',
    'devretlink@hotmail.com'
  ) OR
  -- Yazarlar kendi yazılarını ekleyebilir
  (author_id IS NOT NULL AND auth.uid() = author_id)
);

-- UPDATE Policy (Admin ve yazarlar yazı güncelleyebilir)
DROP POLICY IF EXISTS "blog_posts_update_policy" ON blog_posts;
CREATE POLICY "blog_posts_update_policy" ON blog_posts
FOR UPDATE
USING (
  -- Admin her zaman güncelleyebilir
  auth.jwt() ->> 'email' IN (
    'admin@devretlink.com',
    'admin@devretlinkplatform.com',
    'ahmetserhatelmas@hotmail.com',
    'ahmetserhatelmas@hotmaail.com',
    'ahmetserhatelmas@gmail.com',
    'devretlink@hotmail.com'
  ) OR
  -- Yazarlar kendi yazılarını güncelleyebilir (author_id null ise sadece admin güncelleyebilir)
  (author_id IS NOT NULL AND auth.uid() = author_id)
);

-- DELETE Policy (Admin ve yazarlar yazı silebilir)
DROP POLICY IF EXISTS "blog_posts_delete_policy" ON blog_posts;
CREATE POLICY "blog_posts_delete_policy" ON blog_posts
FOR DELETE
USING (
  -- Admin her zaman silebilir
  auth.jwt() ->> 'email' IN (
    'admin@devretlink.com',
    'admin@devretlinkplatform.com',
    'ahmetserhatelmas@hotmail.com',
    'ahmetserhatelmas@hotmaail.com',
    'ahmetserhatelmas@gmail.com',
    'devretlink@hotmail.com'
  ) OR
  -- Yazarlar kendi yazılarını silebilir (author_id null ise sadece admin silebilir)
  (author_id IS NOT NULL AND auth.uid() = author_id)
);

-- ============================================
-- EMLAK_LISTINGS + EMLAK_IMAGES (Admin paneli silme / tüm durumları görme)
-- admin@admin.com vb. JWT e-postası RLS'te yoksa DELETE 0 satır siler, uyarı yine "başarılı" görünürdü.
-- ============================================

DROP POLICY IF EXISTS "emlak_select_public" ON emlak_listings;
CREATE POLICY "emlak_select_public" ON emlak_listings
FOR SELECT USING (
    status = 'active' OR
    auth.uid() = user_id OR
    auth.jwt() ->> 'email' IN (
        'admin@admin.com',
        'admin@devretlink.com',
        'admin@devretlinkplatform.com',
        'admin@devredin.com',
        'admin@devredinplatform.com',
        'ahmetserhatelmas@hotmail.com',
        'ahmetserhatelmas@hotmaail.com',
        'ahmetserhatelmas@gmail.com',
        'devretlink@hotmail.com'
    )
);

DROP POLICY IF EXISTS "emlak_update_own" ON emlak_listings;
CREATE POLICY "emlak_update_own" ON emlak_listings
FOR UPDATE USING (
    auth.uid() = user_id OR
    auth.jwt() ->> 'email' IN (
        'admin@admin.com',
        'admin@devretlink.com',
        'admin@devretlinkplatform.com',
        'admin@devredin.com',
        'admin@devredinplatform.com',
        'ahmetserhatelmas@hotmail.com',
        'ahmetserhatelmas@hotmaail.com',
        'ahmetserhatelmas@gmail.com',
        'devretlink@hotmail.com'
    )
);

DROP POLICY IF EXISTS "emlak_delete_own" ON emlak_listings;
CREATE POLICY "emlak_delete_own" ON emlak_listings
FOR DELETE USING (
    auth.uid() = user_id OR
    auth.jwt() ->> 'email' IN (
        'admin@admin.com',
        'admin@devretlink.com',
        'admin@devretlinkplatform.com',
        'admin@devredin.com',
        'admin@devredinplatform.com',
        'ahmetserhatelmas@hotmail.com',
        'ahmetserhatelmas@hotmaail.com',
        'ahmetserhatelmas@gmail.com',
        'devretlink@hotmail.com'
    )
);

DROP POLICY IF EXISTS "emlak_images_delete" ON emlak_images;
CREATE POLICY "emlak_images_delete" ON emlak_images
FOR DELETE USING (
    EXISTS (
        SELECT 1 FROM emlak_listings el
        WHERE el.id = listing_id AND (
            el.user_id = auth.uid() OR
            auth.jwt() ->> 'email' IN (
                'admin@admin.com',
                'admin@devretlink.com',
                'admin@devretlinkplatform.com',
                'admin@devredin.com',
                'admin@devredinplatform.com',
                'ahmetserhatelmas@hotmail.com',
                'ahmetserhatelmas@hotmaail.com',
                'ahmetserhatelmas@gmail.com',
                'devretlink@hotmail.com'
            )
        )
    )
);

-- ============================================
-- LISTING_IMAGES (ilan silinirken satır silme / cascade RLS)
-- ============================================

DROP POLICY IF EXISTS "listing_images_delete" ON listing_images;
CREATE POLICY "listing_images_delete" ON listing_images
FOR DELETE USING (
    EXISTS (
        SELECT 1 FROM listings
        WHERE id = listing_id AND (
            user_id = auth.uid() OR
            auth.jwt() ->> 'email' IN (
                'admin@admin.com',
                'admin@devretlink.com',
                'admin@devretlinkplatform.com',
                'admin@devredin.com',
                'admin@devredinplatform.com',
                'ahmetserhatelmas@gmail.com',
                'ahmetserhatelmas@hotmail.com',
                'ahmetserhatelmas@hotmaail.com',
                'devretlink@hotmail.com'
            )
        )
    )
);

-- ============================================
-- FRANCHISES (admin panel silme / güncelleme)
-- ============================================

DROP POLICY IF EXISTS "franchises_select" ON franchises;
CREATE POLICY "franchises_select" ON franchises
FOR SELECT USING (
    status = 'active' OR
    auth.uid() = user_id OR
    auth.jwt() ->> 'email' IN (
        'admin@admin.com',
        'admin@devretlink.com',
        'admin@devretlinkplatform.com',
        'admin@devredin.com',
        'admin@devredinplatform.com',
        'ahmetserhatelmas@gmail.com',
        'ahmetserhatelmas@hotmail.com',
        'ahmetserhatelmas@hotmaail.com',
        'devretlink@hotmail.com'
    )
);

DROP POLICY IF EXISTS "franchises_update" ON franchises;
CREATE POLICY "franchises_update" ON franchises
FOR UPDATE USING (
    auth.uid() = user_id OR
    auth.jwt() ->> 'email' IN (
        'admin@admin.com',
        'admin@devretlink.com',
        'admin@devretlinkplatform.com',
        'admin@devredin.com',
        'admin@devredinplatform.com',
        'ahmetserhatelmas@gmail.com',
        'ahmetserhatelmas@hotmail.com',
        'ahmetserhatelmas@hotmaail.com',
        'devretlink@hotmail.com'
    )
);

DROP POLICY IF EXISTS "franchises_delete" ON franchises;
CREATE POLICY "franchises_delete" ON franchises
FOR DELETE USING (
    auth.uid() = user_id OR
    auth.jwt() ->> 'email' IN (
        'admin@admin.com',
        'admin@devretlink.com',
        'admin@devretlinkplatform.com',
        'admin@devredin.com',
        'admin@devredinplatform.com',
        'ahmetserhatelmas@gmail.com',
        'ahmetserhatelmas@hotmail.com',
        'ahmetserhatelmas@hotmaail.com',
        'devretlink@hotmail.com'
    )
);

