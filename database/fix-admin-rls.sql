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
    'ahmetserhatelmas@gmail.com'
  )
);

