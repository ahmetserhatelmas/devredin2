-- Toprak (Arsa / Tarla vb.) kategorisi ve alanları
-- Supabase SQL Editor'de çalıştırın

-- emlak_category'ye toprak ekle
ALTER TABLE emlak_listings DROP CONSTRAINT IF EXISTS emlak_listings_emlak_category_check;
ALTER TABLE emlak_listings ADD CONSTRAINT emlak_listings_emlak_category_check
    CHECK (emlak_category IN ('konut', 'is_yeri', 'komple_bina', 'toprak'));

-- Toprak alt türü: arsa, tarla, icar, kat_karsiligi
ALTER TABLE emlak_listings ADD COLUMN IF NOT EXISTS toprak_type VARCHAR(20);
-- Arsa/Toprak ilan detayları (satariz referansı)
ALTER TABLE emlak_listings ADD COLUMN IF NOT EXISTS imar_durumu VARCHAR(50);   -- İmar durumu (konut, ticari, arazi, vb.)
ALTER TABLE emlak_listings ADD COLUMN IF NOT EXISTS price_per_sqm DECIMAL(12,2); -- m² fiyatı
ALTER TABLE emlak_listings ADD COLUMN IF NOT EXISTS ada_no VARCHAR(30);         -- Ada no
ALTER TABLE emlak_listings ADD COLUMN IF NOT EXISTS parsel_no VARCHAR(30);      -- Parsel no
ALTER TABLE emlak_listings ADD COLUMN IF NOT EXISTS kaks VARCHAR(20);           -- Kaks (emsal)
ALTER TABLE emlak_listings ADD COLUMN IF NOT EXISTS gabari VARCHAR(30);         -- Gabari
ALTER TABLE emlak_listings ADD COLUMN IF NOT EXISTS takasli VARCHAR(10);        -- evet, hayir
ALTER TABLE emlak_listings ADD COLUMN IF NOT EXISTS pafta_no VARCHAR(30);       -- Pafta no
ALTER TABLE emlak_listings ADD COLUMN IF NOT EXISTS altyapi JSONB;              -- Altyapı (elektrik, su, vb. checkbox)
ALTER TABLE emlak_listings ADD COLUMN IF NOT EXISTS konum_ozellik JSONB;        -- Konum (ana yola yakın, denize yakın vb.)
ALTER TABLE emlak_listings ADD COLUMN IF NOT EXISTS manzara JSONB;              -- Manzara (şehir, deniz, doğa vb.)

CREATE INDEX IF NOT EXISTS idx_emlak_toprak_type ON emlak_listings(toprak_type) WHERE emlak_category = 'toprak';

-- property_type: toprak alt türleri de kabul et
ALTER TABLE emlak_listings DROP CONSTRAINT IF EXISTS emlak_listings_property_type_check;
ALTER TABLE emlak_listings ADD CONSTRAINT emlak_listings_property_type_check
    CHECK (property_type IS NULL OR property_type IN ('daire','mustakil','villa','rezidans','stüdyo','dubleks','tripleks','çatı_dubleks','ara_kat_dubleks','is_yeri','komple_bina','arsa','tarla','icar','kat_karsiligi'));
