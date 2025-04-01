// Initialize the map
let map = L.map('map', {
    zoomControl: false
}).setView([12.9698, 79.1559], 15);

// Set OpenStreetMap as the tile layer
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

let markers = [];
let poiMarkers = [];
let lastSearchTime = 0;

navigator.geolocation.getCurrentPosition(success);

function success(pos){
    const lat=pos.coords.latitude;
    const lng=pos.coords.longitude;
    const accuracy = pos.coords.accuracy;

    L.marker([lat,lng]).addTo(map);
}

// Custom marker icon
const customIcon = L.icon({
    iconUrl: './image/map-marker.png',
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40]
});

// Custom icons for POIs
const icons = {
    hotel: L.divIcon({
        className: 'custom-marker',
        html: `<div style="font-size: 30px;">🏨</div>`
    }),
    hospital: L.divIcon({
        className: 'custom-marker',
        html: `<div style="font-size: 30px;">🏥</div>`
    }),
    hostel: L.divIcon({
        className: 'custom-marker',
        html: `<div style="font-size: 30px;">🛏️</div>`
    })
};

// Track visibility of POIs
const poiVisibility = {
    hotels: false,
    hospitals: false,
    lodges: false
};

// Function to search and place marker
async function searchPlace() {
    const place = document.getElementById('search-input').value.trim();
    if (!place) return;

    const now = Date.now();
    if (now - lastSearchTime < 1000) return;
    lastSearchTime = now;

    try {
        // Show loading state
        const searchBtn = document.getElementById('search-btn');
        searchBtn.disabled = true;
        searchBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Searching...';

        const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(place)}`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data && data.length > 0) {
            const lat = parseFloat(data[0].lat);
            const lon = parseFloat(data[0].lon);
            const location = data[0].display_name;

            // Center the map
            map.setView([lat, lon], 13);

            // Add marker to the map
            const marker = L.marker([lat, lon], { icon: customIcon }).addTo(map);
            marker.bindPopup(`<b>${location}</b>`).openPopup();

            // Add to markers array
            markers.push({
                id: Date.now(),
                location,
                marker
            });

            // Update history display
            updateHistory();

            // Fetch POIs
            fetchPOIs(lat, lon);
        } else {
            console.log("No results found for:", place);
        }
    } catch (error) {
        console.error("Error in searchPlace:", error);
        if (error instanceof TypeError || error.message.includes('HTTP error')) {
            alert("Error searching for location. Please check your connection and try again.");
        }
    } finally {
        // Reset button state
        const searchBtn = document.getElementById('search-btn');
        searchBtn.disabled = false;
        searchBtn.textContent = 'Search';
    }
}

// Function to update history display
function updateHistory() {
    const historyContainer = document.getElementById('history');
    historyContainer.innerHTML = '';

    if (markers.length === 0) {
        historyContainer.innerHTML = '<p class="text-muted history-empty">No search history yet.</p>';
        return;
    }

    markers.forEach((marker, index) => {
        const historyItem = document.createElement('div');
        historyItem.className = 'history-item';
        
        const contentDiv = document.createElement('div');
        contentDiv.className = 'history-content';
        contentDiv.textContent = `${index + 1}. ${marker.location}`;
        
        const deleteBtn = document.createElement('span');
        deleteBtn.className = 'delete-btn';
        deleteBtn.innerHTML = '&times;';
        deleteBtn.title = "Remove this location";
        
        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            removeMarker(marker.id);
        });

        historyItem.addEventListener('click', () => {
            map.setView(marker.marker.getLatLng(), 13);
            marker.marker.openPopup();
        });

        historyItem.appendChild(contentDiv);
        historyItem.appendChild(deleteBtn);
        historyContainer.appendChild(historyItem);
    });
}

// Function to remove a marker
function removeMarker(id) {
    const index = markers.findIndex(m => m.id === id);
    if (index !== -1) {
        map.removeLayer(markers[index].marker);
        markers.splice(index, 1);
        updateHistory();
        
        if (markers.length === 0) {
            map.setView([12.9698, 79.1559], 15);
        }
    }
}

// Function to fetch POIs using Overpass API
async function fetchPOIs(lat, lon) {
    const radius = 5000;
    const overpassUrl = `https://overpass-api.de/api/interpreter?data=[out:json];
        (node["tourism"="hotel"](around:${radius},${lat},${lon});
         node["amenity"="hospital"](around:${radius},${lat},${lon});
         node["tourism"="hostel"](around:${radius},${lat},${lon});
        );
        out;`;

    try {
        const response = await fetch(overpassUrl);
        const data = await response.json();

        poiMarkers.forEach(marker => map.removeLayer(marker.marker));
        poiMarkers = [];

        data.elements.forEach(element => {
            const poiLat = element.lat;
            const poiLon = element.lon;
            const poiType = element.tags.tourism || element.tags.amenity;
            let icon;

            switch (poiType) {
                case 'hotel': icon = icons.hotel; break;
                case 'hospital': icon = icons.hospital; break;
                case 'hostel': icon = icons.hostel; break;
                default: icon = icons.hotel;
            }

            const marker = L.marker([poiLat, poiLon], { icon }).addTo(map);
            marker.bindPopup(`<b>${poiType}</b>`);
            poiMarkers.push({ marker, type: poiType });
            map.removeLayer(marker);
        });

        togglePOIVisibility();
    } catch (error) {
        console.error("Error fetching POIs:", error);
    }
}

// Function to toggle POI visibility
function togglePOIVisibility() {
    poiMarkers.forEach(({ marker, type }) => {
        switch (type) {
            case 'hotel':
                poiVisibility.hotels ? map.addLayer(marker) : map.removeLayer(marker);
                break;
            case 'hospital':
                poiVisibility.hospitals ? map.addLayer(marker) : map.removeLayer(marker);
                break;
            case 'hostel':
                poiVisibility.lodges ? map.addLayer(marker) : map.removeLayer(marker);
                break;
        }
    });
}

// Event listeners
document.getElementById('search-btn').addEventListener('click', searchPlace);
document.getElementById('search-input').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') searchPlace();
});

document.getElementById('search-toggle').addEventListener('click', function() {
    document.getElementById('search-panel').classList.toggle('open');
});

document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', function(event) {
        event.preventDefault();
        this.classList.toggle('active');
        const poiType = this.id.replace('-link', '');
        poiVisibility[poiType] = !poiVisibility[poiType];
        togglePOIVisibility();
    });
});

// Initialize
updateHistory();