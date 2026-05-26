-- Devret Link — categories tablosu + listings FK + RLS
-- Supabase SQL Editor → New query → Run (tek seferde)
--
-- Hata: relation "categories" does not exist
--       → Bu script önce categories tablosunu oluşturur, sonra FK ekler.

-- ============================================================
-- 0) categories tablosu (yoksa oluştur)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    icon VARCHAR(50),
    description TEXT,
    parent_id INTEGER REFERENCES public.categories(id) ON DELETE CASCADE,
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_categories_parent_id ON public.categories(parent_id);
CREATE INDEX IF NOT EXISTS idx_categories_slug ON public.categories(slug);

-- Ana sektörler (site ile uyumlu slug'lar)
INSERT INTO public.categories (name, slug, icon, description, display_order, parent_id) VALUES
    ('Yeme - İçme', 'yeme-icme', '🍽️', 'Restoran, cafe, bar vb.', 1, NULL),
    ('Mağaza & Perakende', 'magaza', '🏬', 'Mağaza ve perakende', 2, NULL),
    ('Gıda Perakendesi', 'gida', '🛒', 'Gıda satış yerleri', 3, NULL),
    ('Hizmet', 'hizmet', '⚙️', 'Hizmet işletmeleri', 4, NULL),
    ('Üretim & Atölye', 'uretim', '🏭', 'Üretim ve atölye', 5, NULL),
    ('Otomotiv', 'otomotiv', '🚗', 'Otomotiv işletmeleri', 6, NULL),
    ('Eğlence & Hobi', 'eglence', '🎮', 'Eğlence ve hobi', 7, NULL),
    ('E-Ticaret', 'e-ticaret', '🌐', 'Online işletmeler', 8, NULL),
    ('Diğer', 'diger', '📦', 'Diğer sektörler', 9, NULL)
ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    icon = EXCLUDED.icon,
    description = EXCLUDED.description,
    display_order = EXCLUDED.display_order,
    is_active = TRUE;

-- Eski schema.sql slug'ları ile uyum (magaza-perakende, gida-perakende, uretim-atolye)
INSERT INTO public.categories (name, slug, icon, display_order, parent_id) VALUES
    ('Mağaza & Perakende', 'magaza-perakende', '🏬', 2, NULL),
    ('Gıda & Perakende', 'gida-perakende', '🛒', 3, NULL),
    ('Üretim & Atölye', 'uretim-atolye', '🏭', 5, NULL)
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- 1) listings sütunları
-- ============================================================
ALTER TABLE public.listings ADD COLUMN IF NOT EXISTS category_id INTEGER;
ALTER TABLE public.listings ADD COLUMN IF NOT EXISTS subcategory_id INTEGER;
ALTER TABLE public.listings ADD COLUMN IF NOT EXISTS city TEXT;
ALTER TABLE public.listings ADD COLUMN IF NOT EXISTS district TEXT;

-- Geçersiz category_id → NULL (FK eklemeden önce)
UPDATE public.listings l
SET category_id = NULL
WHERE category_id IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM public.categories c WHERE c.id = l.category_id);

UPDATE public.listings l
SET subcategory_id = NULL
WHERE subcategory_id IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM public.categories c WHERE c.id = l.subcategory_id);

-- ============================================================
-- 2) Foreign key'ler (PostgREST embed için)
-- ============================================================
ALTER TABLE public.listings DROP CONSTRAINT IF EXISTS listings_category_id_fkey;
ALTER TABLE public.listings
    ADD CONSTRAINT listings_category_id_fkey
    FOREIGN KEY (category_id) REFERENCES public.categories(id) ON DELETE SET NULL;

ALTER TABLE public.listings DROP CONSTRAINT IF EXISTS listings_subcategory_id_fkey;
ALTER TABLE public.listings
    ADD CONSTRAINT listings_subcategory_id_fkey
    FOREIGN KEY (subcategory_id) REFERENCES public.categories(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_listings_category_id ON public.listings(category_id);

-- ============================================================
-- 3) Kategoriler — herkes okuyabilsin
-- ============================================================
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "categories_select_public" ON public.categories;
CREATE POLICY "categories_select_public" ON public.categories
    FOR SELECT
    USING (COALESCE(is_active, true) = true);

-- ============================================================
-- 4) PostgREST şema önbelleği
-- ============================================================
NOTIFY pgrst, 'reload schema';

-- Kontrol (Results'ta ana kategorileri görmelisiniz):
SELECT id, name, slug, parent_id FROM public.categories WHERE parent_id IS NULL ORDER BY display_order;
