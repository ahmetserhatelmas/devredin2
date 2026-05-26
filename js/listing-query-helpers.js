/**
 * İlan sorguları — FK/embed olmadan çalışır (city/district/sector metin alanları).
 */
(function (global) {
    /** Liste/kart için önerilen select (listing_images embed FK listings'e bağlı olmalı) */
    var LISTING_CARD_FIELDS =
        'id, title, slug, price, monthly_rent, created_at, area_sqm, city, district, sector, category_id, latitude, longitude, establishment_year, is_featured, images:listing_images(image_url, is_primary)';

    /** Detay sayfası için genişletilmiş alanlar */
    var LISTING_DETAIL_FIELDS =
        'id, title, slug, price, description, address, area_sqm, monthly_rent, monthly_revenue, monthly_profit, employee_count, establishment_year, lease_end_date, transfer_reason, is_franchise, inventory_value, equipment_value, contact_name, contact_phone, contact_email, sector, category_id, city, district, latitude, longitude, document_url, created_at, images:listing_images(image_url, is_primary)';

    function listingCategoryLabel(listing) {
        if (!listing) return '';
        if (listing.sector) return String(listing.sector);
        if (listing.category && listing.category.name) return listing.category.name;
        return '';
    }

    function listingLocationLabel(listing) {
        if (!listing) return '';
        var city = listing.city;
        var district = listing.district;
        if (city && typeof city === 'object' && city.name) city = city.name;
        if (district && typeof district === 'object' && district.name) district = district.name;
        if (district && city) return district + ' / ' + city;
        return city || district || listing.address || '';
    }

    global.LISTING_CARD_FIELDS = LISTING_CARD_FIELDS;
    global.LISTING_DETAIL_FIELDS = LISTING_DETAIL_FIELDS;
    global.listingCategoryLabel = listingCategoryLabel;
    global.listingLocationLabel = listingLocationLabel;
})(typeof window !== 'undefined' ? window : this);
