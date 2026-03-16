-- Emlak kategorisi (Konut / İş Yeri) ve İş Yeri ilan detay alanları
-- Supabase SQL Editor'de çalıştırın

-- Kategori: konut | is_yeri | komple_bina
ALTER TABLE emlak_listings ADD COLUMN IF NOT EXISTS emlak_category VARCHAR(20) DEFAULT 'konut'
    CHECK (emlak_category IN ('konut', 'is_yeri', 'komple_bina'));

-- İş Yeri / Komple Bina detayları (satariz referansı)
ALTER TABLE emlak_listings ADD COLUMN IF NOT EXISTS building_condition VARCHAR(30);  -- sifir, ikinci_el, insa_halinde
ALTER TABLE emlak_listings ADD COLUMN IF NOT EXISTS tenant_occupied BOOLEAN;        -- Kiracılı: evet/hayır
ALTER TABLE emlak_listings ADD COLUMN IF NOT EXISTS credit_eligibility VARCHAR(20); -- evet, hayir, bilinmiyor
ALTER TABLE emlak_listings ADD COLUMN IF NOT EXISTS property_owner_type VARCHAR(50); -- tc_vatandasi, yabanci, ozel_kurum, devlet
ALTER TABLE emlak_listings ADD COLUMN IF NOT EXISTS property_no TEXT;               -- Taşınmaz No
ALTER TABLE emlak_listings ADD COLUMN IF NOT EXISTS general_features JSONB;         -- Genel özellikler (checkbox listesi)

-- Komple Bina detayları
ALTER TABLE emlak_listings ADD COLUMN IF NOT EXISTS apartments_per_floor INTEGER;   -- Bir kattaki daire sayısı (1-6+)
ALTER TABLE emlak_listings ADD COLUMN IF NOT EXISTS parking_type VARCHAR(30);      -- acik, kapali, acik_kapali, yok

CREATE INDEX IF NOT EXISTS idx_emlak_category ON emlak_listings(emlak_category);

-- property_type: konut tipleri + is_yeri + komple_bina
ALTER TABLE emlak_listings DROP CONSTRAINT IF EXISTS emlak_listings_property_type_check;
ALTER TABLE emlak_listings ADD CONSTRAINT emlak_listings_property_type_check
    CHECK (property_type IS NULL OR property_type IN ('daire','mustakil','villa','rezidans','stüdyo','dubleks','tripleks','çatı_dubleks','ara_kat_dubleks','is_yeri','komple_bina'));
