-- PostgREST: listings <-> categories ilişkisi + kategori okuma (Supabase SQL Editor'da çalıştırın)
-- Hata: "Could not find a relationship between 'listings' and 'categories' in the schema cache"

-- 1) Sütunlar (yoksa ekle)
ALTER TABLE listings ADD COLUMN IF NOT EXISTS category_id INTEGER;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS subcategory_id INTEGER;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS city TEXT;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS district TEXT;

-- 2) Foreign key'ler (PostgREST embed için zorunlu)
ALTER TABLE listings DROP CONSTRAINT IF EXISTS listings_category_id_fkey;
ALTER TABLE listings
    ADD CONSTRAINT listings_category_id_fkey
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL;

ALTER TABLE listings DROP CONSTRAINT IF EXISTS listings_subcategory_id_fkey;
ALTER TABLE listings
    ADD CONSTRAINT listings_subcategory_id_fkey
    FOREIGN KEY (subcategory_id) REFERENCES categories(id) ON DELETE SET NULL;

-- 3) Kategoriler: anonim kullanıcılar okuyabilsin (is_active NULL olanlar dahil)
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "categories_select_public" ON categories;
CREATE POLICY "categories_select_public" ON categories
    FOR SELECT
    USING (COALESCE(is_active, true) = true);

-- 4) PostgREST şema önbelleğini yenile (Supabase)
NOTIFY pgrst, 'reload schema';
