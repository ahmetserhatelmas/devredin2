-- ============================================
-- EMLAK: city_name / district_name doldurma
-- Şehir filtresi çalışsın diye mevcut ilanlarda city_id/district_id'den
-- city_name ve district_name alanlarını doldurur.
-- Supabase SQL Editor'de bir kez çalıştırın.
-- ============================================

-- Kolonlar yoksa ekle
ALTER TABLE emlak_listings ADD COLUMN IF NOT EXISTS city_name TEXT;
ALTER TABLE emlak_listings ADD COLUMN IF NOT EXISTS district_name TEXT;

-- city_id dolu ama city_name boş olan satırları cities tablosundan doldur
UPDATE emlak_listings e
SET city_name = c.name
FROM cities c
WHERE e.city_id = c.id
  AND (e.city_name IS NULL OR e.city_name = '');

-- district_id dolu ama district_name boş olan satırları districts tablosundan doldur
UPDATE emlak_listings e
SET district_name = d.name
FROM districts d
WHERE e.district_id = d.id
  AND (e.district_name IS NULL OR e.district_name = '');

-- İndeksler (filtre performansı)
CREATE INDEX IF NOT EXISTS idx_emlak_city_name ON emlak_listings(city_name);
CREATE INDEX IF NOT EXISTS idx_emlak_district_name ON emlak_listings(district_name);
