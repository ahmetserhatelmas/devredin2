/**
 * Devret Link — çok dilli arayüz (TR / EN / DE)
 * Kullanım: data-i18n="anahtar" | data-i18n-html="anahtar" | data-i18n-placeholder="anahtar"
 */
(function () {
    'use strict';

    var STORAGE_KEY = 'language';

    var I18N = {
        tr: {
            doc_title: "Devret Link - Türkiye'nin En Güvenilir İşletme Pazaryeri",
            nav_buy: "İşletme Devral",
            nav_sell: "İşletmeni Devret",
            nav_estate: "Emlak",
            nav_panel: "Panel",
            nav_blog: "Blog",
            nav_free_mobile: "Ücretsiz İlan Oluştur",
            nav_cta: "Ücretsiz İlan Oluştur",
            nav_login: "Giriş Yap",
            nav_register: "Üye Ol",
            nav_profile: "Profil",
            nav_settings: "Ayarlar",
            nav_logout: "Çıkış Yap",
            nav_user: "Kullanıcı",
            hero_img_alt: "İşletme",
            hero_subtitle: "FIRSATLARIN YENİ ADRESİ",
            hero_title_html: "Türkiye'nin En Güvenilir İşletme<br><span class=\"highlight\">Pazaryeri</span>",
            sector_select: "Sektör Seçiniz",
            btn_search: "İşletme Ara",
            featured_sub: "Hayalinizdeki işletmeyi bulun",
            featured_title: "Öne Çıkan İlanlar",
            view_all: "Tümünü Gör →",
            stats_sub: "Pazaryerinin nabzı: gerçek zamanlı veriler",
            stats_title: "Devret Link'den güncel istatistikler",
            stat_listings: "Toplam İlan Sayısı",
            stat_value: "Toplam İlan Değeri",
            stat_avg: "Ortalama İşletme Değeri",
            recent_sub: "Güncel fırsatlara göz atın",
            recent_title: "Son Yayınlanan İlanlar",
            filter_sub: "Arama kriterlerinizi daraltın",
            filter_title: "Sonuca daha hızlı ulaşın",
            tab_sector: "Sektör",
            tab_location: "Lokasyon",
            tab_investment: "Yatırım Aralığı",
            franchise_sub: "Stratejik yatırım fırsatlarını keşfedin",
            franchise_title: "Franchise ilanları",
            contact_sub: "Bize Ulaşın",
            contact_title: "En kısa sürede geri dönüş yapacağız",
            lbl_first: "Ad",
            lbl_last: "Soyad",
            lbl_msg: "Mesaj",
            lbl_phone: "Telefon Numarası",
            lbl_email: "E-posta Adresi",
            ph_first: "Adınızı yazın",
            ph_last: "Soyadınızı yazın",
            ph_msg: "Mesajınızı yazın",
            ph_phone: "5XX XXX XX XX",
            ph_email: "E-posta adresinizi yazın",
            btn_send: "Gönder",
            cta_sub: "Kolay kullanım, hızlı sonuç, tam destek",
            cta_title: "İşletmenizi Devret Link'le Satın",
            cta_btn: "Devret Link ile Sat",
            news_sub: "Öne çıkan veriler ve ilanlar",
            news_title: "Devret Link bültenine abone olun",
            ph_news: "E-posta adresinizi yazın...",
            btn_news: "Abone Ol",
            footer_copy_html: "Copyright © 2025<br>Devret Link Bilgi Teknolojileri<br>Yazılım ve Ticaret A.Ş.<br>Tüm Hakları Saklıdır.",
            footer_tagline: "Devret Link.com, işletme devri ve yatırım ilanlarının güvenli şekilde paylaşılmasını amaçlayan bir platformdur.",
            fh_brand: "Devret Link",
            fh_acquire: "İşletme Devral",
            fh_other: "Diğer",
            fl_about: "Hakkımızda",
            fl_contact: "Bize Ulaşın",
            fl_guide: "İşlem Rehberi",
            fl_faq: "Sıkça Sorulan Sorular",
            fl_blog: "Blog",
            fl_listings: "Devren Kiralık İlanlar",
            fl_franchise: "Franchise Bul",
            fl_rules: "İlan Verme Kuralları",
            fo_terms: "Kullanım Koşulları",
            fo_privacy1: "Aydınlatma Metni",
            fo_kvkk: "KVKK",
            fo_privacy2: "Gizlilik Sözleşmesi",
            fo_data: "Gizlilik ve Kişisel Verilerin İşlenmesi",
            fo_request: "Veri Sahibi Başvuru Formu",
            fo_cookie: "Gizlilik ve Çerez Politikası",
            fo_appendix: "Başvuru Formu Eki",
            fo_membership: "Üyelik Sözleşmesi",
            fo_consent: "Açık Rıza Metni",
            /* Emlak */
            emlak_title: "Emlak İlanları",
            emlak_rent: "Kiralık",
            emlak_sale: "Satılık",
            emlak_city: "Şehir",
            emlak_district: "İlçe",
            emlak_rooms: "Oda Sayısı",
            emlak_rooms_all: "Tümü",
            emlak_search: "Ara",
            emlak_nav_cta: "+ İlan Ver",
            emlak_ph_city: "İl seçin veya yazın...",
            emlak_ph_district: "Önce şehir seçin...",
            emlak_ph_price_unlim: "Sınır yok",
            emlak_max_rent: "Maks. Kira (₺)",
            emlak_max_price: "Maks. Fiyat (₺)",
            emlak_sidebar_rent: "Kira Aralığı (₺)",
            emlak_sidebar_price: "Fiyat Aralığı (₺)",
            emlak_loading: "Yükleniyor...",
            emlak_sort_new: "En Yeni",
            emlak_sort_price_low: "En Düşük Fiyat",
            emlak_sort_price_high: "En Yüksek Fiyat",
            emlak_sort_area: "En Büyük m²",
            emlak_no_results: "Sonuç bulunamadı",
            emlak_filters: "Filtreler",
            emlak_clear: "Temizle",
            emlak_doc_title: "Emlak İlanları - Devret Link",
            emlak_results_rent: "<strong>{{count}}</strong> kiralık ilan bulundu",
            emlak_results_sale: "<strong>{{count}}</strong> satılık ilan bulundu",
            emlak_load_error: "İlanlar yüklenirken hata oluştu.",
            emlak_no_match: "Bu kriterlere uygun ilan bulunamadı.",
            emlak_clear_filters_btn: "Filtreleri Temizle",
            emlak_ph_district_active: "İlçe seçin veya yazın...",
            emlak_cat_label: "Kategoriler",
            emlak_cat_konut: "Konut",
            emlak_cat_is_yeri: "İş Yeri",
            emlak_cat_komple: "Komple Bina",
            emlak_cat_toprak: "Toprak",
            emlak_prop_label: "Konut Tipi",
            emlak_prop_daire: "Daire",
            emlak_prop_mustakil: "Müstakil",
            emlak_prop_villa: "Villa",
            emlak_prop_rezidans: "Rezidans",
            emlak_prop_studio: "Stüdyo",
            emlak_prop_dubleks: "Dubleks",
            emlak_prop_tripleks: "Tripleks",
            emlak_studio: "Stüdyo",
            emlak_room_6plus: "6+1 ve üzeri",
            emlak_room_5plus_cb: "5+1 ve üzeri",
            emlak_room_studio_cb: "Stüdyo (1+0)",
            emlak_m2_label: "Metrekare (m²)",
            emlak_ph_min: "Min",
            emlak_ph_max: "Max",
            emlak_building_age: "Bina Yaşı",
            emlak_age_0_5: "0-5 Yıl",
            emlak_age_5_10: "5-10 Yıl",
            emlak_age_10_15: "10-15 Yıl",
            emlak_age_15_20: "15-20 Yıl",
            emlak_age_20p: "20+ Yıl",
            emlak_features: "Özellikler",
            emlak_feat_elevator: "Asansör",
            emlak_feat_parking: "Otopark",
            emlak_feat_furnished: "Eşyalı",
            emlak_feat_complex: "Site İçinde",
            emlak_feat_pets: "Evcil Hayvan",
            emlak_filter_apply: "Filtrele",
            emlak_per_month: "/ay",
            emlak_view_grid: "Izgara görünümü",
            emlak_view_list: "Liste görünümü",
            emlak_badge_office: "İş Yeri",
            emlak_badge_building: "Komple Bina",
            emlak_badge_land: "Toprak",
            emlak_featured: "Öne Çıkan",
            emlak_floor: "{{n}}. Kat",
            emlak_furnished_short: "Eşyalı"
        },
        en: {
            doc_title: "Devret Link — Turkey's Trusted Business Marketplace",
            nav_buy: "Buy a Business",
            nav_sell: "Sell Your Business",
            nav_estate: "Real Estate",
            nav_panel: "Dashboard",
            nav_blog: "Blog",
            nav_free_mobile: "Post a Free Listing",
            nav_cta: "Post a Free Listing",
            nav_login: "Log in",
            nav_register: "Sign up",
            nav_profile: "Profile",
            nav_settings: "Settings",
            nav_logout: "Log out",
            nav_user: "User",
            hero_img_alt: "Business",
            hero_subtitle: "THE NEW ADDRESS FOR OPPORTUNITIES",
            hero_title_html: "Turkey's Most Trusted Business<br><span class=\"highlight\">Marketplace</span>",
            sector_select: "Select sector",
            btn_search: "Search businesses",
            featured_sub: "Find the business you want",
            featured_title: "Featured listings",
            view_all: "View all →",
            stats_sub: "Marketplace pulse: live data",
            stats_title: "Latest stats from Devret Link",
            stat_listings: "Total listings",
            stat_value: "Total listing value",
            stat_avg: "Average business value",
            recent_sub: "Browse the latest opportunities",
            recent_title: "Recently published",
            filter_sub: "Narrow your search",
            filter_title: "Get to results faster",
            tab_sector: "Sector",
            tab_location: "Location",
            tab_investment: "Investment range",
            franchise_sub: "Discover strategic investment options",
            franchise_title: "Franchise listings",
            contact_sub: "Contact us",
            contact_title: "We'll get back to you shortly",
            lbl_first: "First name",
            lbl_last: "Last name",
            lbl_msg: "Message",
            lbl_phone: "Phone number",
            lbl_email: "Email address",
            ph_first: "Your first name",
            ph_last: "Your last name",
            ph_msg: "Your message",
            ph_phone: "5XX XXX XX XX",
            ph_email: "Your email address",
            btn_send: "Send",
            cta_sub: "Easy to use, fast results, full support",
            cta_title: "Sell your business with Devret Link",
            cta_btn: "Sell with Devret Link",
            news_sub: "Highlights and listings",
            news_title: "Subscribe to the Devret Link newsletter",
            ph_news: "Enter your email...",
            btn_news: "Subscribe",
            footer_copy_html: "Copyright © 2025<br>Devret Link Information Technologies<br>Software and Trade Inc.<br>All rights reserved.",
            footer_tagline: "Devret Link is a platform for safely sharing business transfer and investment listings.",
            fh_brand: "Devret Link",
            fh_acquire: "Buy a business",
            fh_other: "Other",
            fl_about: "About us",
            fl_contact: "Contact",
            fl_guide: "How it works",
            fl_faq: "FAQ",
            fl_blog: "Blog",
            fl_listings: "Leasehold listings",
            fl_franchise: "Find a franchise",
            fl_rules: "Listing rules",
            fo_terms: "Terms of use",
            fo_privacy1: "Privacy notice",
            fo_kvkk: "Data protection (KVKK)",
            fo_privacy2: "Privacy agreement",
            fo_data: "Privacy & personal data",
            fo_request: "Data subject request",
            fo_cookie: "Privacy & cookie policy",
            fo_appendix: "Request form appendix",
            fo_membership: "Membership agreement",
            fo_consent: "Explicit consent",
            emlak_title: "Real estate listings",
            emlak_rent: "For rent",
            emlak_sale: "For sale",
            emlak_city: "City",
            emlak_district: "District",
            emlak_rooms: "Rooms",
            emlak_rooms_all: "All",
            emlak_search: "Search",
            emlak_nav_cta: "+ Post listing",
            emlak_ph_city: "Select or type city...",
            emlak_ph_district: "Select city first...",
            emlak_ph_price_unlim: "No limit",
            emlak_max_rent: "Max. rent (₺)",
            emlak_max_price: "Max. price (₺)",
            emlak_sidebar_rent: "Rent range (₺)",
            emlak_sidebar_price: "Price range (₺)",
            emlak_loading: "Loading...",
            emlak_sort_new: "Newest",
            emlak_sort_price_low: "Lowest price",
            emlak_sort_price_high: "Highest price",
            emlak_sort_area: "Largest m²",
            emlak_no_results: "No results",
            emlak_filters: "Filters",
            emlak_clear: "Clear",
            emlak_doc_title: "Real Estate - Devret Link",
            emlak_results_rent: "<strong>{{count}}</strong> rental listings found",
            emlak_results_sale: "<strong>{{count}}</strong> listings for sale found",
            emlak_load_error: "Could not load listings.",
            emlak_no_match: "No listings match your criteria.",
            emlak_clear_filters_btn: "Clear filters",
            emlak_ph_district_active: "Select or type district...",
            emlak_cat_label: "Categories",
            emlak_cat_konut: "Residential",
            emlak_cat_is_yeri: "Commercial",
            emlak_cat_komple: "Whole building",
            emlak_cat_toprak: "Land",
            emlak_prop_label: "Property type",
            emlak_prop_daire: "Apartment",
            emlak_prop_mustakil: "Detached",
            emlak_prop_villa: "Villa",
            emlak_prop_rezidans: "Residence",
            emlak_prop_studio: "Studio",
            emlak_prop_dubleks: "Duplex",
            emlak_prop_tripleks: "Triplex",
            emlak_studio: "Studio",
            emlak_room_6plus: "6+1 and up",
            emlak_room_5plus_cb: "5+1 and up",
            emlak_room_studio_cb: "Studio (1+0)",
            emlak_m2_label: "Area (m²)",
            emlak_ph_min: "Min",
            emlak_ph_max: "Max",
            emlak_building_age: "Building age",
            emlak_age_0_5: "0-5 years",
            emlak_age_5_10: "5-10 years",
            emlak_age_10_15: "10-15 years",
            emlak_age_15_20: "15-20 years",
            emlak_age_20p: "20+ years",
            emlak_features: "Features",
            emlak_feat_elevator: "Elevator",
            emlak_feat_parking: "Parking",
            emlak_feat_furnished: "Furnished",
            emlak_feat_complex: "Gated community",
            emlak_feat_pets: "Pets allowed",
            emlak_filter_apply: "Apply filters",
            emlak_per_month: "/mo",
            emlak_view_grid: "Grid view",
            emlak_view_list: "List view",
            emlak_badge_office: "Commercial",
            emlak_badge_building: "Whole building",
            emlak_badge_land: "Land",
            emlak_featured: "Featured",
            emlak_floor: "Floor {{n}}",
            emlak_furnished_short: "Furnished"
        },
        de: {
            doc_title: "Devret Link — Türkeis vertrauenswürdiger Business-Marktplatz",
            nav_buy: "Unternehmen kaufen",
            nav_sell: "Unternehmen verkaufen",
            nav_estate: "Immobilien",
            nav_panel: "Panel",
            nav_blog: "Blog",
            nav_free_mobile: "Kostenlos inserieren",
            nav_cta: "Kostenlos inserieren",
            nav_login: "Anmelden",
            nav_register: "Registrieren",
            nav_profile: "Profil",
            nav_settings: "Einstellungen",
            nav_logout: "Abmelden",
            nav_user: "Nutzer",
            hero_img_alt: "Geschäft",
            hero_subtitle: "DIE NEUE ADRESSE FÜR CHANCEN",
            hero_title_html: "Die vertrauenswürdigste Business-<br><span class=\"highlight\">Plattform</span> der Türkei",
            sector_select: "Branche wählen",
            btn_search: "Suchen",
            featured_sub: "Finden Sie Ihr Wunschgeschäft",
            featured_title: "Empfohlene Inserate",
            view_all: "Alle anzeigen →",
            stats_sub: "Puls des Marktplatzes: Live-Daten",
            stats_title: "Aktuelle Zahlen von Devret Link",
            stat_listings: "Anzahl Inserate",
            stat_value: "Gesamtwert der Inserate",
            stat_avg: "Durchschnittlicher Geschäftswert",
            recent_sub: "Neue Chancen entdecken",
            recent_title: "Zuletzt veröffentlicht",
            filter_sub: "Suche eingrenzen",
            filter_title: "Schneller zum Ergebnis",
            tab_sector: "Branche",
            tab_location: "Standort",
            tab_investment: "Investitionsrahmen",
            franchise_sub: "Strategische Investitionschancen",
            franchise_title: "Franchise-Inserate",
            contact_sub: "Kontakt",
            contact_title: "Wir melden uns schnellstmöglich",
            lbl_first: "Vorname",
            lbl_last: "Nachname",
            lbl_msg: "Nachricht",
            lbl_phone: "Telefonnummer",
            lbl_email: "E-Mail-Adresse",
            ph_first: "Ihr Vorname",
            ph_last: "Ihr Nachname",
            ph_msg: "Ihre Nachricht",
            ph_phone: "5XX XXX XX XX",
            ph_email: "Ihre E-Mail-Adresse",
            btn_send: "Senden",
            cta_sub: "Einfach, schnell, mit voller Unterstützung",
            cta_title: "Verkaufen Sie mit Devret Link",
            cta_btn: "Mit Devret Link verkaufen",
            news_sub: "Highlights und Inserate",
            news_title: "Devret Link-Newsletter abonnieren",
            ph_news: "E-Mail-Adresse eingeben...",
            btn_news: "Abonnieren",
            footer_copy_html: "Copyright © 2025<br>Devret Link Informationstechnologien<br>Software und Handel A.Ş.<br>Alle Rechte vorbehalten.",
            footer_tagline: "Devret Link ist eine Plattform zum sicheren Teilen von Unternehmensübergaben und Investitionsinseraten.",
            fh_brand: "Devret Link",
            fh_acquire: "Unternehmen kaufen",
            fh_other: "Sonstiges",
            fl_about: "Über uns",
            fl_contact: "Kontakt",
            fl_guide: "Ablauf",
            fl_faq: "FAQ",
            fl_blog: "Blog",
            fl_listings: "Pacht-Inserate",
            fl_franchise: "Franchise finden",
            fl_rules: "Inseratsregeln",
            fo_terms: "Nutzungsbedingungen",
            fo_privacy1: "Hinweisgeber",
            fo_kvkk: "Datenschutz",
            fo_privacy2: "Datenschutzvereinbarung",
            fo_data: "Datenschutz & personenbezogene Daten",
            fo_request: "Antrag betroffene Person",
            fo_cookie: "Datenschutz & Cookies",
            fo_appendix: "Anhang Antragsformular",
            fo_membership: "Mitgliedschaftsvereinbarung",
            fo_consent: "Einwilligung",
            emlak_title: "Immobilieninserate",
            emlak_rent: "Miete",
            emlak_sale: "Kauf",
            emlak_city: "Stadt",
            emlak_district: "Bezirk",
            emlak_rooms: "Zimmer",
            emlak_rooms_all: "Alle",
            emlak_search: "Suchen",
            emlak_nav_cta: "+ Inserat",
            emlak_ph_city: "Stadt wählen oder eingeben...",
            emlak_ph_district: "Zuerst Stadt wählen...",
            emlak_ph_price_unlim: "Kein Limit",
            emlak_max_rent: "Max. Miete (₺)",
            emlak_max_price: "Max. Preis (₺)",
            emlak_sidebar_rent: "Mietspanne (₺)",
            emlak_sidebar_price: "Preisspanne (₺)",
            emlak_loading: "Wird geladen...",
            emlak_sort_new: "Neueste",
            emlak_sort_price_low: "Niedrigster Preis",
            emlak_sort_price_high: "Höchster Preis",
            emlak_sort_area: "Größte m²",
            emlak_no_results: "Keine Ergebnisse",
            emlak_filters: "Filter",
            emlak_clear: "Zurücksetzen",
            emlak_doc_title: "Immobilien - Devret Link",
            emlak_results_rent: "<strong>{{count}}</strong> Miet-Inserate gefunden",
            emlak_results_sale: "<strong>{{count}}</strong> Kauf-Inserate gefunden",
            emlak_load_error: "Inserate konnten nicht geladen werden.",
            emlak_no_match: "Keine Inserate für diese Kriterien.",
            emlak_clear_filters_btn: "Filter zurücksetzen",
            emlak_ph_district_active: "Bezirk wählen oder eingeben...",
            emlak_cat_label: "Kategorien",
            emlak_cat_konut: "Wohnen",
            emlak_cat_is_yeri: "Gewerbe",
            emlak_cat_komple: "Ganzes Gebäude",
            emlak_cat_toprak: "Grundstück",
            emlak_prop_label: "Immobilientyp",
            emlak_prop_daire: "Wohnung",
            emlak_prop_mustakil: "Einfamilienhaus",
            emlak_prop_villa: "Villa",
            emlak_prop_rezidans: "Residenz",
            emlak_prop_studio: "Studio",
            emlak_prop_dubleks: "Maisonette",
            emlak_prop_tripleks: "Dreietagenwohnung",
            emlak_studio: "Studio",
            emlak_room_6plus: "6+1 und mehr",
            emlak_room_5plus_cb: "5+1 und mehr",
            emlak_room_studio_cb: "Studio (1+0)",
            emlak_m2_label: "Fläche (m²)",
            emlak_ph_min: "Min",
            emlak_ph_max: "Max",
            emlak_building_age: "Gebäudealter",
            emlak_age_0_5: "0-5 Jahre",
            emlak_age_5_10: "5-10 Jahre",
            emlak_age_10_15: "10-15 Jahre",
            emlak_age_15_20: "15-20 Jahre",
            emlak_age_20p: "20+ Jahre",
            emlak_features: "Ausstattung",
            emlak_feat_elevator: "Aufzug",
            emlak_feat_parking: "Parkplatz",
            emlak_feat_furnished: "Möbliert",
            emlak_feat_complex: "Wohnanlage",
            emlak_feat_pets: "Haustiere erlaubt",
            emlak_filter_apply: "Filtern",
            emlak_per_month: "/Monat",
            emlak_view_grid: "Rasteransicht",
            emlak_view_list: "Listenansicht",
            emlak_badge_office: "Gewerbe",
            emlak_badge_building: "Ganzes Gebäude",
            emlak_badge_land: "Grundstück",
            emlak_featured: "Hervorgehoben",
            emlak_floor: "{{n}}. Stock",
            emlak_furnished_short: "Möbliert"
        }
    };

    function getLang() {
        var l = localStorage.getItem(STORAGE_KEY);
        if (l === 'en' || l === 'de' || l === 'tr') return l;
        return 'tr';
    }

    function t(key, lang) {
        var l = lang || getLang();
        var pack = I18N[l] || I18N.tr;
        if (pack[key] !== undefined) return pack[key];
        return I18N.tr[key] !== undefined ? I18N.tr[key] : key;
    }

    function applyTranslations(root, lang) {
        var scope = root || document;
        var l = lang || getLang();

        scope.querySelectorAll('[data-i18n]').forEach(function (el) {
            var key = el.getAttribute('data-i18n');
            if (key) el.textContent = t(key, l);
        });
        scope.querySelectorAll('[data-i18n-html]').forEach(function (el) {
            var key = el.getAttribute('data-i18n-html');
            if (key) el.innerHTML = t(key, l);
        });
        scope.querySelectorAll('[data-i18n-placeholder]').forEach(function (el) {
            var key = el.getAttribute('data-i18n-placeholder');
            if (key) el.placeholder = t(key, l);
        });
        scope.querySelectorAll('[data-i18n-alt]').forEach(function (el) {
            var key = el.getAttribute('data-i18n-alt');
            if (key) el.setAttribute('alt', t(key, l));
        });
        scope.querySelectorAll('[data-i18n-title]').forEach(function (el) {
            var key = el.getAttribute('data-i18n-title');
            if (key) el.setAttribute('title', t(key, l));
        });

        var pageKey = document.body && document.body.getAttribute('data-i18n-page');
        if (pageKey === 'emlak') document.title = t('emlak_doc_title', l);
        else document.title = t('doc_title', l);
        var htmlLang = l === 'tr' ? 'tr' : l === 'de' ? 'de' : 'en';
        document.documentElement.lang = htmlLang;
    }

    function updateLangSelectorUI(lang) {
        var flags = { tr: '🇹🇷', en: '🇺🇸', de: '🇩🇪' };
        var names = { tr: 'TR', en: 'EN', de: 'DE' };
        var cf = document.getElementById('currentFlag');
        var cl = document.getElementById('currentLang');
        if (cf) cf.textContent = flags[lang] || flags.tr;
        if (cl) cl.textContent = names[lang] || names.tr;
        var dd = document.getElementById('langDropdown');
        if (dd) dd.classList.remove('active');
    }

    function setLanguage(lang) {
        if (lang !== 'tr' && lang !== 'en' && lang !== 'de') lang = 'tr';
        localStorage.setItem(STORAGE_KEY, lang);
        applyTranslations(document, lang);
        updateLangSelectorUI(lang);
        window.dispatchEvent(new CustomEvent('devretin-lang-changed', { detail: { lang: lang } }));
    }

    window.addEventListener('devretin-lang-changed', refreshDynamicI18nParts);

    /** Sektör select ilk seçenek + dinamik metinler */
    function refreshDynamicI18nParts() {
        var l = getLang();
        var sel = document.getElementById('heroSector');
        if (sel && sel.options.length && sel.options[0].value === '') {
            sel.options[0].textContent = t('sector_select', l);
        }
        if (typeof window.__i18nRefreshEmlakDynamic === 'function') {
            window.__i18nRefreshEmlakDynamic();
        }
    }

    window.changeLang = function (event, lang) {
        if (event && event.stopPropagation) event.stopPropagation();
        setLanguage(lang || 'tr');
    };

    window.toggleLangDropdown = function (event) {
        if (event && event.stopPropagation) event.stopPropagation();
        var d = document.getElementById('langDropdown');
        if (d) d.classList.toggle('active');
    };

    window.__i18nT = t;
    window.__i18nGetLang = getLang;
    window.__i18nApply = applyTranslations;
    window.__i18nRefreshDynamic = refreshDynamicI18nParts;

    document.addEventListener('click', function (event) {
        if (!event.target.closest('.lang-selector')) {
            var langDropdown = document.getElementById('langDropdown');
            if (langDropdown) langDropdown.classList.remove('active');
        }
    });

    document.addEventListener('DOMContentLoaded', function () {
        var lang = getLang();
        applyTranslations(document, lang);
        updateLangSelectorUI(lang);
    });

    console.log('✅ i18n.js loaded');
})();
