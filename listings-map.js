// Google Maps Integration for Listings Page

let map = null;
let markers = [];
let infoWindow = null;
let allListings = [];

// Initialize map when Google Maps API is loaded
window.initListingsMap = function() {
    console.log('🗺️ Initializing listings map...');
    
    // Default center: Turkey
    const defaultLat = 39.9334;
    const defaultLng = 32.8597;
    
    // Create map
    map = new google.maps.Map(document.getElementById('map'), {
        center: { lat: defaultLat, lng: defaultLng },
        zoom: 6,
        mapTypeControl: false,
        fullscreenControl: true,
        streetViewControl: false,
        zoomControl: true,
        styles: [
            {
                featureType: 'poi',
                elementType: 'labels',
                stylers: [{ visibility: 'off' }]
            }
        ]
    });
    
    // Create info window
    infoWindow = new google.maps.InfoWindow();
    
    // Load listings for map
    loadListingsForMap();
    
    console.log('✅ Map initialized');
};

// Load all active listings with coordinates
async function loadListingsForMap() {
    try {
        const { data: listings, error } = await supabase
            .from('listings')
            .select(`
                id,
                title,
                slug,
                price,
                city,
                district,
                latitude,
                longitude
            `)
            .eq('status', 'active')
            .not('latitude', 'is', null)
            .not('longitude', 'is', null);
        
        if (error) throw error;
        
        allListings = listings || [];
        console.log(`📍 Loaded ${listings?.length || 0} listings with coordinates`);
        
        // Create markers
        if (listings && listings.length > 0) {
            createMarkers(listings);
        } else {
            console.log('⚠️ No listings with coordinates found');
        }
        
    } catch (error) {
        console.error('❌ Error loading listings for map:', error);
    }
}

// Create markers for listings
function createMarkers(listings) {
    // Clear existing markers
    markers.forEach(marker => {
        if (marker.setMap) marker.setMap(null);
    });
    markers = [];
    
    if (!listings || listings.length === 0) return;
    
    listings.forEach(listing => {
        if (!listing.latitude || !listing.longitude) return;
        
        const priceText = formatPriceShort(listing.price);
        
        // Create marker with custom icon
        const marker = new google.maps.Marker({
            position: { 
                lat: parseFloat(listing.latitude), 
                lng: parseFloat(listing.longitude) 
            },
            map: map,
            title: listing.title,
            icon: {
                url: createMarkerIcon(priceText),
                scaledSize: new google.maps.Size(80, 40),
                anchor: new google.maps.Point(40, 40)
            }
        });
        
        // Add click listener
        marker.addListener('click', () => {
            showListingInfo(listing, marker);
        });
        
        markers.push(marker);
    });
    
    // Fit bounds to show all markers
    if (markers.length > 0) {
        const bounds = new google.maps.LatLngBounds();
        markers.forEach(marker => {
            bounds.extend(marker.getPosition());
        });
        map.fitBounds(bounds);
        
        // Prevent excessive zoom for single marker
        if (markers.length === 1) {
            map.setZoom(12);
        }
    }
}

// Create SVG marker icon with price
function createMarkerIcon(priceText) {
    const svg = `
        <svg xmlns="http://www.w3.org/2000/svg" width="80" height="40" viewBox="0 0 80 40">
            <rect x="0" y="0" width="80" height="32" rx="6" fill="#dc2626"/>
            <polygon points="40,40 32,32 48,32" fill="#dc2626"/>
            <text x="40" y="21" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="12" font-weight="bold">₺${priceText}</text>
        </svg>
    `;
    return 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svg);
}

// Format price for marker (short version)
function formatPriceShort(price) {
    if (price >= 1000000) {
        const m = price / 1000000;
        return m % 1 === 0 ? `${m}M` : `${m.toFixed(1)}M`;
    } else if (price >= 1000) {
        const k = price / 1000;
        return k % 1 === 0 ? `${k}K` : `${Math.round(k)}K`;
    }
    return price.toLocaleString('tr-TR');
}

// Show listing info in popup
function showListingInfo(listing, marker) {
    const location = listing.district && listing.city 
        ? `${listing.district}, ${listing.city}` 
        : listing.city || '-';
    
    const content = `
        <div class="map-info-window">
            <h3 class="info-title">${listing.title}</h3>
            <div class="info-location">
                📍 ${location}
            </div>
            <div class="info-price">
                ₺${formatPriceFull(listing.price)}
            </div>
            <a href="listing-detail.html?slug=${listing.slug}" class="info-link">
                Detayları Gör →
            </a>
        </div>
    `;
    
    infoWindow.setContent(content);
    infoWindow.open(map, marker);
}

// Format price - full display
function formatPriceFull(price) {
    return price.toLocaleString('tr-TR');
}

// Update map markers based on current filters
window.updateMapMarkers = function(filteredListings) {
    if (!map) return;
    
    // If filtered listings provided, show only those with coordinates
    if (filteredListings && filteredListings.length > 0) {
        // Filtrelenmiş ilanları kullan (koordinatı olanları)
        const listingsWithCoords = filteredListings.filter(l => l.latitude && l.longitude);
        createMarkers(listingsWithCoords);
    } else if (filteredListings && filteredListings.length === 0) {
        // Boş filtre sonucu - tüm markerları temizle
        createMarkers([]);
    } else {
        // Filtre yok - tüm ilanları göster
        createMarkers(allListings);
    }
};
