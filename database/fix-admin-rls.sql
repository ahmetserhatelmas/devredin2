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
    'admin@devredin.com',
    'admin@devredinplatform.com',
    'ahmetserhatelmas@hotmail.com',
    'ahmetserhatelmas@hotmaail.com',
    'ahmetserhatelmas@gmail.com'
  )
);

-- UPDATE Policy (Admin için)
DROP POLICY IF EXISTS "listings_update_policy" ON listings;
CREATE POLICY "listings_update_policy" ON listings
FOR UPDATE
USING (
  auth.uid() = user_id OR
  auth.jwt() ->> 'email' IN (
    'admin@devredin.com',
    'admin@devredinplatform.com',
    'ahmetserhatelmas@hotmail.com',
    'ahmetserhatelmas@hotmaail.com',
    'ahmetserhatelmas@gmail.com'
  )
);

-- DELETE Policy (Admin için)
DROP POLICY IF EXISTS "listings_delete_policy" ON listings;
CREATE POLICY "listings_delete_policy" ON listings
FOR DELETE
USING (
  auth.uid() = user_id OR
  auth.jwt() ->> 'email' IN (
    'admin@devredin.com',
    'admin@devredinplatform.com',
    'ahmetserhatelmas@hotmail.com',
    'ahmetserhatelmas@hotmaail.com',
    'ahmetserhatelmas@gmail.com'
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
    'ahmetserhatelmas@gmail.com'
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
    'ahmetserhatelmas@gmail.com'
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
    'ahmetserhatelmas@gmail.com'
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
    'ahmetserhatelmas@gmail.com'
  ) OR
  -- Yazarlar kendi yazılarını silebilir (author_id null ise sadece admin silebilir)
  (author_id IS NOT NULL AND auth.uid() = author_id)
);

