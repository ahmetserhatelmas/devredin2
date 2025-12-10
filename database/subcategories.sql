-- =====================================================
-- ALT KATEGORİLER (SEKTÖRLER) OLUŞTURMA
-- Bu SQL'i Supabase SQL Editor'de çalıştırın
-- =====================================================

-- 1. parent_id kolonu ekle (varsa hata vermez)
ALTER TABLE categories ADD COLUMN IF NOT EXISTS parent_id INTEGER REFERENCES categories(id);

-- 2. Listings tablosuna subcategory_id ekle
ALTER TABLE listings ADD COLUMN IF NOT EXISTS subcategory_id INTEGER REFERENCES categories(id);

-- 3. Mevcut ana kategorilerin ID'lerini bul
DO $$
DECLARE
    yeme_icme_id INTEGER;
    magaza_id INTEGER;
    gida_id INTEGER;
    hizmet_id INTEGER;
    uretim_id INTEGER;
BEGIN
    -- Ana kategori ID'lerini al
    SELECT id INTO yeme_icme_id FROM categories WHERE slug = 'yeme-icme' OR name ILIKE '%yeme%içme%' LIMIT 1;
    SELECT id INTO magaza_id FROM categories WHERE slug = 'magaza-perakende' OR name ILIKE '%mağaza%' OR name ILIKE '%perakende%' LIMIT 1;
    SELECT id INTO gida_id FROM categories WHERE slug = 'gida-perakende' OR name ILIKE '%gıda%' LIMIT 1;
    SELECT id INTO hizmet_id FROM categories WHERE slug = 'hizmet' OR name ILIKE '%hizmet%' LIMIT 1;
    SELECT id INTO uretim_id FROM categories WHERE slug = 'uretim-atolye' OR name ILIKE '%üretim%' OR name ILIKE '%atölye%' LIMIT 1;
    
    -- Yeme - İçme alt kategorileri
    IF yeme_icme_id IS NOT NULL THEN
        INSERT INTO categories (name, slug, icon, parent_id) VALUES
        ('Restoran & Lokanta', 'restoran-lokanta', '🍽️', yeme_icme_id),
        ('Kafe & Kahvehane', 'kafe-kahvehane', '☕', yeme_icme_id),
        ('Fast Food', 'fast-food', '🍔', yeme_icme_id),
        ('Büfe & Dönerci', 'bufe-donerci', '🌯', yeme_icme_id),
        ('Pastane & Fırın', 'pastane-firin', '🥐', yeme_icme_id),
        ('Bar & Pub', 'bar-pub', '🍺', yeme_icme_id)
        ON CONFLICT (slug) DO UPDATE SET parent_id = EXCLUDED.parent_id;
        
        RAISE NOTICE 'Yeme-İçme alt kategorileri eklendi (parent_id: %)', yeme_icme_id;
    END IF;
    
    -- Mağaza & Perakende alt kategorileri
    IF magaza_id IS NOT NULL THEN
        INSERT INTO categories (name, slug, icon, parent_id) VALUES
        ('Giyim Mağazası', 'giyim-magazasi', '👕', magaza_id),
        ('Elektronik', 'elektronik', '📱', magaza_id),
        ('Kozmetik & Parfümeri', 'kozmetik-parfumeri', '💄', magaza_id),
        ('Kırtasiye', 'kirtasiye', '📚', magaza_id),
        ('Oyuncak & Hobi', 'oyuncak-hobi', '🎮', magaza_id),
        ('Ev & Mobilya', 'ev-mobilya', '🛋️', magaza_id)
        ON CONFLICT (slug) DO UPDATE SET parent_id = EXCLUDED.parent_id;
        
        RAISE NOTICE 'Mağaza alt kategorileri eklendi (parent_id: %)', magaza_id;
    END IF;
    
    -- Gıda & Market alt kategorileri
    IF gida_id IS NOT NULL THEN
        INSERT INTO categories (name, slug, icon, parent_id) VALUES
        ('Market & Bakkal', 'market-bakkal', '🏪', gida_id),
        ('Kasap', 'kasap', '🥩', gida_id),
        ('Manav & Kuruyemiş', 'manav-kuruyemis', '🍎', gida_id),
        ('Şarküteri', 'sarkuteri', '🧀', gida_id),
        ('Su Bayii', 'su-bayii', '💧', gida_id)
        ON CONFLICT (slug) DO UPDATE SET parent_id = EXCLUDED.parent_id;
        
        RAISE NOTICE 'Gıda alt kategorileri eklendi (parent_id: %)', gida_id;
    END IF;
    
    -- Hizmet alt kategorileri
    IF hizmet_id IS NOT NULL THEN
        INSERT INTO categories (name, slug, icon, parent_id) VALUES
        ('Kuaför & Berber', 'kuafor-berber', '💇', hizmet_id),
        ('Güzellik Salonu', 'guzellik-salonu', '💅', hizmet_id),
        ('Oto Yıkama & Servis', 'oto-yikama-servis', '🚗', hizmet_id),
        ('Temizlik Hizmetleri', 'temizlik-hizmetleri', '🧹', hizmet_id),
        ('Kargo & Lojistik', 'kargo-lojistik', '📦', hizmet_id),
        ('Eğitim & Kurs', 'egitim-kurs', '📖', hizmet_id)
        ON CONFLICT (slug) DO UPDATE SET parent_id = EXCLUDED.parent_id;
        
        RAISE NOTICE 'Hizmet alt kategorileri eklendi (parent_id: %)', hizmet_id;
    END IF;
    
    -- Üretim & Atölye alt kategorileri
    IF uretim_id IS NOT NULL THEN
        INSERT INTO categories (name, slug, icon, parent_id) VALUES
        ('Tekstil Atölyesi', 'tekstil-atolyesi', '🧵', uretim_id),
        ('Matbaa', 'matbaa', '🖨️', uretim_id),
        ('Mobilya Atölyesi', 'mobilya-atolyesi', '🪑', uretim_id),
        ('Metal İşleri', 'metal-isleri', '⚙️', uretim_id),
        ('Gıda Üretim', 'gida-uretim', '🏭', uretim_id)
        ON CONFLICT (slug) DO UPDATE SET parent_id = EXCLUDED.parent_id;
        
        RAISE NOTICE 'Üretim alt kategorileri eklendi (parent_id: %)', uretim_id;
    END IF;
    
END $$;

-- 4. Sonucu kontrol et
SELECT 
    c.id,
    CASE WHEN c.parent_id IS NULL THEN '📁 ' ELSE '  └─ ' END || c.name as kategori,
    c.icon,
    c.parent_id,
    p.name as ana_kategori
FROM categories c
LEFT JOIN categories p ON c.parent_id = p.id
ORDER BY COALESCE(c.parent_id, c.id), c.parent_id NULLS FIRST, c.name;
