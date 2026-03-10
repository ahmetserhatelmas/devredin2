-- ============================================
-- EMLAK (KONUT) TABLOSU
-- Supabase SQL Editor'de çalıştırın
-- ============================================

CREATE TABLE IF NOT EXISTS emlak_listings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,

    -- Temel Bilgiler
    title VARCHAR(255) NOT NULL,
    description TEXT,

    -- Tür: kiralık / satılık
    listing_type VARCHAR(20) NOT NULL CHECK (listing_type IN ('kiralik', 'satilik')),

    -- Fiyat
    price DECIMAL(15,2) NOT NULL,          -- Kira bedeli veya satış fiyatı

    -- Konum
    city_id INTEGER REFERENCES cities(id) ON DELETE SET NULL,
    district_id INTEGER REFERENCES districts(id) ON DELETE SET NULL,
    address TEXT,
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),

    -- Konut Detayları
    property_type VARCHAR(50) DEFAULT 'daire'
        CHECK (property_type IN ('daire','mustakil','villa','rezidans','stüdyo','dubleks','tripleks','çatı_dubleks','ara_kat_dubleks')),
    room_count VARCHAR(20),                -- "1+1", "2+1", "3+1", "4+1", "5+1", "6+1+"
    floor_number INTEGER,                  -- Bulunduğu kat
    total_floors INTEGER,                  -- Bina kat sayısı
    area_gross INTEGER,                    -- Brüt m²
    area_net INTEGER,                      -- Net m²
    building_age VARCHAR(30),              -- "0-5", "5-10", "10-15", "15-20", "20+"
    bathroom_count INTEGER DEFAULT 1,
    balcony BOOLEAN DEFAULT FALSE,
    deposit DECIMAL(15,2),                 -- Depozito (kiralıklar için)
    dues DECIMAL(10,2),                    -- Aidat (aylık)

    -- Isıtma & Özellikler
    heating_type VARCHAR(50),              -- "kombi", "merkezi", "yerden", "klima", "soba", "yok"
    floor_type VARCHAR(50),                -- "parke", "seramik", "laminat", "mermer", "halı"
    kitchen_type VARCHAR(50),              -- "açık_amerikan", "kapalı", "amerikan"
    facing VARCHAR(50),                    -- "kuzey", "güney", "doğu", "batı", "güneydoğu"

    -- Ekstra Özellikler (boolean flags)
    has_elevator BOOLEAN DEFAULT FALSE,
    has_parking BOOLEAN DEFAULT FALSE,
    is_furnished BOOLEAN DEFAULT FALSE,
    is_in_complex BOOLEAN DEFAULT FALSE,
    allows_pets BOOLEAN DEFAULT FALSE,
    is_exchangeable BOOLEAN DEFAULT FALSE, -- Takas

    -- Tapu & Yasal
    deed_type VARCHAR(50),                 -- "kat_mülkiyeti", "kat_irtifakı", "hisseli", "arsa"
    from_owner BOOLEAN DEFAULT TRUE,       -- Sahibinden mi?

    -- İletişim
    contact_name VARCHAR(255),
    contact_phone VARCHAR(20),
    contact_email VARCHAR(255),
    show_phone BOOLEAN DEFAULT TRUE,

    -- Medya
    cover_image TEXT,

    -- Durum
    status VARCHAR(20) DEFAULT 'pending'
        CHECK (status IN ('pending','active','inactive','sold','rented')),
    is_featured BOOLEAN DEFAULT FALSE,
    view_count INTEGER DEFAULT 0,
    favorite_count INTEGER DEFAULT 0,

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    published_at TIMESTAMP WITH TIME ZONE
);

-- Görseller tablosu
CREATE TABLE IF NOT EXISTS emlak_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    listing_id UUID REFERENCES emlak_listings(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    is_cover BOOLEAN DEFAULT FALSE,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- İndeksler
CREATE INDEX IF NOT EXISTS idx_emlak_status ON emlak_listings(status);
CREATE INDEX IF NOT EXISTS idx_emlak_type ON emlak_listings(listing_type);
CREATE INDEX IF NOT EXISTS idx_emlak_city ON emlak_listings(city_id);
CREATE INDEX IF NOT EXISTS idx_emlak_price ON emlak_listings(price);
CREATE INDEX IF NOT EXISTS idx_emlak_rooms ON emlak_listings(room_count);
CREATE INDEX IF NOT EXISTS idx_emlak_created ON emlak_listings(created_at DESC);

-- RLS
ALTER TABLE emlak_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE emlak_images ENABLE ROW LEVEL SECURITY;

-- Herkes aktif ilanları görebilir
DROP POLICY IF EXISTS "emlak_select_public" ON emlak_listings;
CREATE POLICY "emlak_select_public" ON emlak_listings
FOR SELECT USING (
    status = 'active' OR
    auth.uid() = user_id OR
    auth.jwt() ->> 'email' IN (
        'ahmetserhatelmas@hotmail.com',
        'ahmetserhatelmas@hotmaail.com',
        'ahmetserhatelmas@gmail.com'
    )
);

-- Giriş yapmış kullanıcılar ilan ekleyebilir
DROP POLICY IF EXISTS "emlak_insert_auth" ON emlak_listings;
CREATE POLICY "emlak_insert_auth" ON emlak_listings
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Kullanıcılar kendi ilanlarını güncelleyebilir
DROP POLICY IF EXISTS "emlak_update_own" ON emlak_listings;
CREATE POLICY "emlak_update_own" ON emlak_listings
FOR UPDATE USING (
    auth.uid() = user_id OR
    auth.jwt() ->> 'email' IN (
        'ahmetserhatelmas@hotmail.com',
        'ahmetserhatelmas@hotmaail.com',
        'ahmetserhatelmas@gmail.com'
    )
);

-- Kullanıcılar kendi ilanlarını silebilir
DROP POLICY IF EXISTS "emlak_delete_own" ON emlak_listings;
CREATE POLICY "emlak_delete_own" ON emlak_listings
FOR DELETE USING (
    auth.uid() = user_id OR
    auth.jwt() ->> 'email' IN (
        'ahmetserhatelmas@hotmail.com',
        'ahmetserhatelmas@hotmaail.com',
        'ahmetserhatelmas@gmail.com'
    )
);

-- Görseller için politikalar
DROP POLICY IF EXISTS "emlak_images_select" ON emlak_images;
CREATE POLICY "emlak_images_select" ON emlak_images
FOR SELECT USING (true);

DROP POLICY IF EXISTS "emlak_images_insert" ON emlak_images;
CREATE POLICY "emlak_images_insert" ON emlak_images
FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM emlak_listings WHERE id = listing_id AND user_id = auth.uid())
);

DROP POLICY IF EXISTS "emlak_images_delete" ON emlak_images;
CREATE POLICY "emlak_images_delete" ON emlak_images
FOR DELETE USING (
    EXISTS (SELECT 1 FROM emlak_listings WHERE id = listing_id AND user_id = auth.uid())
);

-- Supabase Storage: Mevcut "listing-images" bucket'ı kullanılır (zaten public).
-- emlak fotoğrafları "emlak/" prefix'iyle o bucket'a yüklenir.

-- ============================================
-- KONUM METİN KOLONLARI (ALTER TABLE)
-- Tablo oluşturduktan sonra çalıştırın
-- ============================================
ALTER TABLE emlak_listings ADD COLUMN IF NOT EXISTS city_name TEXT;
ALTER TABLE emlak_listings ADD COLUMN IF NOT EXISTS district_name TEXT;
ALTER TABLE emlak_listings ADD COLUMN IF NOT EXISTS neighborhood_name TEXT;

CREATE INDEX IF NOT EXISTS idx_emlak_city_name ON emlak_listings(city_name);
CREATE INDEX IF NOT EXISTS idx_emlak_district_name ON emlak_listings(district_name);

-- ============================================
-- EMLAK-IMAGES STORAGE BUCKET POLİTİKALARI
-- Supabase SQL Editor'de çalıştırın
-- ============================================

-- Herkes görselleri görebilir (SELECT)
DROP POLICY IF EXISTS "emlak_images_public_read" ON storage.objects;
CREATE POLICY "emlak_images_public_read"
ON storage.objects FOR SELECT
USING (bucket_id = 'emlak-images');

-- Giriş yapmış kullanıcılar yükleyebilir (INSERT)
DROP POLICY IF EXISTS "emlak_images_auth_upload" ON storage.objects;
CREATE POLICY "emlak_images_auth_upload"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'emlak-images'
    AND auth.role() = 'authenticated'
);

-- Kullanıcılar kendi yüklediklerini güncelleyebilir (UPDATE)
DROP POLICY IF EXISTS "emlak_images_owner_update" ON storage.objects;
CREATE POLICY "emlak_images_owner_update"
ON storage.objects FOR UPDATE
USING (
    bucket_id = 'emlak-images'
    AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Kullanıcılar kendi yüklediklerini silebilir (DELETE)
DROP POLICY IF EXISTS "emlak_images_owner_delete" ON storage.objects;
CREATE POLICY "emlak_images_owner_delete"
ON storage.objects FOR DELETE
USING (
    bucket_id = 'emlak-images'
    AND auth.uid()::text = (storage.foldername(name))[1]
);
