/**
 * Örnek yapı (repoda güvenli). Gerçek dosya: npm run build ile .env’den üretilen js/runtime-config.js
 * Acil deneme: bu dosyayı runtime-config.js olarak kopyalayıp değerleri elle yazabilirsin (gitignore’da).
 */
(function () {
    window.__DEVRETIN_ENV__ = {
        SUPABASE_URL: '',
        SUPABASE_ANON_KEY: '',
        GOOGLE_MAPS_API_KEY: ''
    };
    window.GOOGLE_MAPS_API_KEY = window.__DEVRETIN_ENV__.GOOGLE_MAPS_API_KEY || '';
})();
