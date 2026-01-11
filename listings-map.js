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
    markers.forEach(marker => marker.setMap(null));
    markers = [];
    
    if (!listings || listings.length === 0) return;
    
    listings.forEach(listing => {
        if (!listing.latitude || !listing.longitude) return;
        
        // Create standard marker with custom label
        const marker = new google.maps.Marker({
            position: { 
                lat: parseFloat(listing.latitude), 
                lng: parseFloat(listing.longitude) 
            },
            map: map,
            title: listing.title,
            label: {
                text: `₺${formatPrice(listing.price)}`,
                color: '#ffffff',
                fontSize: '14px',
                fontWeight: 'bold',
                fontFamily: 'Inter, sans-serif'
            },
            icon: {
                path: google.maps.SymbolPath.CIRCLE,
                fillColor: '#FF6B35',
                fillOpacity: 1,
                strokeColor: '#ffffff',
                strokeWeight: 3,
                scale: 18
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

// Create custom marker content with price
function createMarkerContent(listing) {
    const div = document.createElement('div');
    div.className = 'custom-marker';
    div.innerHTML = `
        <div class="marker-price">
            ₺${formatPrice(listing.price)}
        </div>
    `;
    return div;
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
                ₺${formatPrice(listing.price)}
            </div>
            <a href="listing-detail.html?slug=${listing.slug}" class="info-link">
                Detayları Gör →
            </a>
        </div>
    `;
    
    infoWindow.setContent(content);
    infoWindow.open(map, marker);
}

// Format price
function formatPrice(price) {
    if (price >= 1000000) {
        return `${(price / 1000000).toFixed(1)}M`;
    } else if (price >= 1000) {
        return `${(price / 1000).toFixed(0)}K`;
    }
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

// Update map markers based on current filters
window.updateMapMarkers = function(filteredListings) {
    if (!map || !allListings.length) return;
    
    // If filtered listings provided, show only those
    if (filteredListings && filteredListings.length > 0) {
        const filteredIds = new Set(filteredListings.map(l => l.id));
        const filtered = allListings.filter(l => filteredIds.has(l.id));
        createMarkers(filtered);
    } else {
        // Show all listings
        createMarkers(allListings);
    }
};

