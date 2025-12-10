-- ============================================
-- DEVREDIN PLATFORM - SUPABASE DATABASE SCHEMA
-- ============================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- ============================================
-- 1. USERS TABLE (Kullanıcılar)
-- ============================================
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    avatar_url TEXT,
    user_type VARCHAR(20) DEFAULT 'buyer' CHECK (user_type IN ('buyer', 'seller', 'both', 'admin')),
    email_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 2. CATEGORIES TABLE (Kategoriler)
-- ============================================
CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    icon VARCHAR(50),
    description TEXT,
    parent_id INTEGER REFERENCES categories(id) ON DELETE CASCADE,
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 3. CITIES TABLE (Şehirler)
-- ============================================
CREATE TABLE IF NOT EXISTS cities (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    is_active BOOLEAN DEFAULT TRUE
);

-- ============================================
-- 4. DISTRICTS TABLE (İlçeler)
-- ============================================
CREATE TABLE IF NOT EXISTS districts (
    id SERIAL PRIMARY KEY,
    city_id INTEGER REFERENCES cities(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) NOT NULL,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    is_active BOOLEAN DEFAULT TRUE,
    UNIQUE(city_id, slug)
);

-- ============================================
-- 5. LISTINGS TABLE (İlanlar)
-- ============================================
CREATE TABLE IF NOT EXISTS listings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
    
    -- Basic Info
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT NOT NULL,
    
    -- Location
    city_id INTEGER REFERENCES cities(id) ON DELETE SET NULL,
    district_id INTEGER REFERENCES districts(id) ON DELETE SET NULL,
    address TEXT,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    
    -- Business Details
    sector VARCHAR(100),
    area_sqm INTEGER, -- Metrekare
    establishment_year INTEGER,
    employee_count INTEGER,
    is_franchise BOOLEAN DEFAULT FALSE,
    franchise_name VARCHAR(255),
    
    -- Financial Info
    price DECIMAL(15, 2) NOT NULL, -- Devir bedeli
    monthly_rent DECIMAL(15, 2), -- Aylık kira
    monthly_revenue DECIMAL(15, 2), -- Aylık ciro
    monthly_profit DECIMAL(15, 2), -- Aylık kar
    inventory_value DECIMAL(15, 2), -- Envanter değeri
    equipment_value DECIMAL(15, 2), -- Demirbaş değeri
    
    -- Contract Info
    lease_end_date DATE,
    transfer_reason VARCHAR(100),
    includes_training BOOLEAN DEFAULT FALSE,
    
    -- Contact Info
    contact_name VARCHAR(255) NOT NULL,
    contact_phone VARCHAR(20) NOT NULL,
    contact_email VARCHAR(255),
    show_phone BOOLEAN DEFAULT TRUE,
    
    -- Status
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'sold', 'inactive', 'rejected')),
    is_featured BOOLEAN DEFAULT FALSE,
    featured_until TIMESTAMP WITH TIME ZONE,
    
    -- Stats
    view_count INTEGER DEFAULT 0,
    favorite_count INTEGER DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    published_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE
);

-- ============================================
-- 6. LISTING IMAGES TABLE (İlan Görselleri)
-- ============================================
CREATE TABLE IF NOT EXISTS listing_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    listing_id UUID REFERENCES listings(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    thumbnail_url TEXT,
    display_order INTEGER DEFAULT 0,
    is_primary BOOLEAN DEFAULT FALSE,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 7. FAVORITES TABLE (Favoriler)
-- ============================================
CREATE TABLE IF NOT EXISTS favorites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    listing_id UUID REFERENCES listings(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, listing_id)
);

-- ============================================
-- 8. MESSAGES TABLE (Mesajlar)
-- ============================================
CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    listing_id UUID REFERENCES listings(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES users(id) ON DELETE CASCADE,
    receiver_id UUID REFERENCES users(id) ON DELETE CASCADE,
    subject VARCHAR(255),
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    parent_message_id UUID REFERENCES messages(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 9. LISTING VIEWS TABLE (İlan Görüntülenmeleri)
-- ============================================
CREATE TABLE IF NOT EXISTS listing_views (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    listing_id UUID REFERENCES listings(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    ip_address INET,
    user_agent TEXT,
    viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 10. CONTACT REQUESTS TABLE (İletişim Talepleri)
-- ============================================
CREATE TABLE IF NOT EXISTS contact_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    listing_id UUID REFERENCES listings(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    message TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'closed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- INDEXES (Performans için)
-- ============================================

-- Listings indexes
CREATE INDEX idx_listings_user_id ON listings(user_id);
CREATE INDEX idx_listings_category_id ON listings(category_id);
CREATE INDEX idx_listings_city_id ON listings(city_id);
CREATE INDEX idx_listings_district_id ON listings(district_id);
CREATE INDEX idx_listings_status ON listings(status);
CREATE INDEX idx_listings_price ON listings(price);
CREATE INDEX idx_listings_created_at ON listings(created_at);
CREATE INDEX idx_listings_is_featured ON listings(is_featured);

-- Full text search index
CREATE INDEX idx_listings_search ON listings USING gin(to_tsvector('turkish', title || ' ' || description));

-- Favorites indexes
CREATE INDEX idx_favorites_user_id ON favorites(user_id);
CREATE INDEX idx_favorites_listing_id ON favorites(listing_id);

-- Messages indexes
CREATE INDEX idx_messages_sender_id ON messages(sender_id);
CREATE INDEX idx_messages_receiver_id ON messages(receiver_id);
CREATE INDEX idx_messages_listing_id ON messages(listing_id);

-- Listing views indexes
CREATE INDEX idx_listing_views_listing_id ON listing_views(listing_id);
CREATE INDEX idx_listing_views_viewed_at ON listing_views(viewed_at);

-- ============================================
-- TRIGGERS (Otomatik güncelleme)
-- ============================================

-- Updated_at trigger fonksiyonu
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Users tablosu için trigger
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Listings tablosu için trigger
CREATE TRIGGER update_listings_updated_at 
    BEFORE UPDATE ON listings 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Favorite count trigger
CREATE OR REPLACE FUNCTION update_favorite_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE listings SET favorite_count = favorite_count + 1 WHERE id = NEW.listing_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE listings SET favorite_count = favorite_count - 1 WHERE id = OLD.listing_id;
    END IF;
    RETURN NULL;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_listing_favorite_count
    AFTER INSERT OR DELETE ON favorites
    FOR EACH ROW
    EXECUTE FUNCTION update_favorite_count();

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE listing_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE listing_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_requests ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view their own profile"
    ON users FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
    ON users FOR UPDATE
    USING (auth.uid() = id);

-- Listings policies
CREATE POLICY "Anyone can view active listings"
    ON listings FOR SELECT
    USING (status = 'active' OR user_id = auth.uid());

CREATE POLICY "Users can create listings"
    ON listings FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own listings"
    ON listings FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own listings"
    ON listings FOR DELETE
    USING (auth.uid() = user_id);

-- Listing images policies
CREATE POLICY "Anyone can view listing images"
    ON listing_images FOR SELECT
    USING (true);

CREATE POLICY "Users can manage images for their listings"
    ON listing_images FOR ALL
    USING (EXISTS (
        SELECT 1 FROM listings 
        WHERE listings.id = listing_images.listing_id 
        AND listings.user_id = auth.uid()
    ));

-- Favorites policies
CREATE POLICY "Users can view their own favorites"
    ON favorites FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can add favorites"
    ON favorites FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove their favorites"
    ON favorites FOR DELETE
    USING (auth.uid() = user_id);

-- Messages policies
CREATE POLICY "Users can view their messages"
    ON messages FOR SELECT
    USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Users can send messages"
    ON messages FOR INSERT
    WITH CHECK (auth.uid() = sender_id);

-- ============================================
-- FUNCTIONS (Helper functions)
-- ============================================

-- Function to get listing stats
CREATE OR REPLACE FUNCTION get_listing_stats()
RETURNS TABLE(
    total_listings BIGINT,
    total_value NUMERIC,
    average_value NUMERIC,
    active_listings BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*)::BIGINT,
        SUM(price),
        AVG(price),
        COUNT(*) FILTER (WHERE status = 'active')::BIGINT
    FROM listings;
END;
$$ LANGUAGE plpgsql;

-- Function to search listings
CREATE OR REPLACE FUNCTION search_listings(
    search_query TEXT,
    category_filter INTEGER DEFAULT NULL,
    city_filter INTEGER DEFAULT NULL,
    min_price DECIMAL DEFAULT NULL,
    max_price DECIMAL DEFAULT NULL,
    min_area INTEGER DEFAULT NULL,
    max_area INTEGER DEFAULT NULL
)
RETURNS SETOF listings AS $$
BEGIN
    RETURN QUERY
    SELECT l.* FROM listings l
    WHERE 
        l.status = 'active'
        AND (search_query IS NULL OR 
             to_tsvector('turkish', l.title || ' ' || l.description) @@ plainto_tsquery('turkish', search_query))
        AND (category_filter IS NULL OR l.category_id = category_filter)
        AND (city_filter IS NULL OR l.city_id = city_filter)
        AND (min_price IS NULL OR l.price >= min_price)
        AND (max_price IS NULL OR l.price <= max_price)
        AND (min_area IS NULL OR l.area_sqm >= min_area)
        AND (max_area IS NULL OR l.area_sqm <= max_area)
    ORDER BY l.created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- INITIAL DATA (Başlangıç verileri)
-- ============================================

-- Insert categories
INSERT INTO categories (name, slug, icon, description, display_order) VALUES
('Yeme - İçme', 'yeme-icme', '🍽️', 'Restoran, cafe, bar vb.', 1),
('Restoran', 'restoran', '🍴', 'Restoranlar', 2),
('Cafe', 'cafe', '☕', 'Cafeler', 3),
('Büfe', 'bufe', '🏪', 'Büfeler', 4),
('Bar', 'bar', '🍺', 'Barlar', 5),
('Mağaza & Perakende', 'magaza-perakende', '🏬', 'Mağazalar', 6),
('Gıda & Perakende', 'gida-perakende', '🛒', 'Gıda satış yerleri', 7),
('Hizmet', 'hizmet', '⚙️', 'Hizmet işletmeleri', 8),
('Üretim & Atölye', 'uretim-atolye', '🏭', 'Üretim tesisleri', 9),
('Eğitim', 'egitim', '📚', 'Eğitim kurumları', 10)
ON CONFLICT (slug) DO NOTHING;

-- Insert major cities
INSERT INTO cities (name, slug, latitude, longitude) VALUES
('İstanbul', 'istanbul', 41.0082, 28.9784),
('Ankara', 'ankara', 39.9334, 32.8597),
('İzmir', 'izmir', 38.4192, 27.1287),
('Bursa', 'bursa', 40.1826, 29.0665),
('Antalya', 'antalya', 36.8969, 30.7133),
('Adana', 'adana', 37.0000, 35.3213),
('Konya', 'konya', 37.8746, 32.4932),
('Gaziantep', 'gaziantep', 37.0662, 37.3833)
ON CONFLICT (slug) DO NOTHING;

-- Insert Istanbul districts
INSERT INTO districts (city_id, name, slug, latitude, longitude) 
SELECT id, 'Şişli', 'sisli', 41.0602, 28.9870 FROM cities WHERE slug = 'istanbul'
UNION ALL
SELECT id, 'Kadıköy', 'kadikoy', 40.9807, 29.0783 FROM cities WHERE slug = 'istanbul'
UNION ALL
SELECT id, 'Beşiktaş', 'besiktas', 41.0422, 29.0077 FROM cities WHERE slug = 'istanbul'
UNION ALL
SELECT id, 'Üsküdar', 'uskudar', 41.0214, 29.0069 FROM cities WHERE slug = 'istanbul'
UNION ALL
SELECT id, 'Beyoğlu', 'beyoglu', 41.0391, 28.9784 FROM cities WHERE slug = 'istanbul'
UNION ALL
SELECT id, 'Fatih', 'fatih', 41.0192, 28.9497 FROM cities WHERE slug = 'istanbul'
UNION ALL
SELECT id, 'Bakırköy', 'bakirkoy', 40.9799, 28.8738 FROM cities WHERE slug = 'istanbul'
UNION ALL
SELECT id, 'Maltepe', 'maltepe', 40.9339, 29.1270 FROM cities WHERE slug = 'istanbul'
ON CONFLICT (city_id, slug) DO NOTHING;

-- ============================================
-- STORAGE BUCKETS (Supabase Storage)
-- ============================================

-- Create storage buckets (run this from Supabase Dashboard or via API)
-- insert into storage.buckets (id, name, public) values ('listing-images', 'listing-images', true);
-- insert into storage.buckets (id, name, public) values ('user-avatars', 'user-avatars', true);

-- Storage policies will be added via Supabase Dashboard

COMMIT;

