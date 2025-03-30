// Initialize the map
let map = L.map('map', {
    zoomControl: false // Disable zoom controls
}).setView([12.9698, 79.1559], 15);

// Set OpenStreetMap as the tile layer
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

let markers = [];
let poiMarkers = [];
let searchCount = 0; // Counter for searched places

// Custom marker icon
const customIcon = L.icon({
    iconUrl: './image/map-marker.png', // Path to the custom icon
    iconSize: [40, 40], // Size of the icon
    iconAnchor: [20, 40], // Point of the icon which will correspond to marker's location
    popupAnchor: [0, -40] // Point from which the popup should open relative to the iconAnchor
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
    const place = document.getElementById('search-input').value;

    try {
        const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${place}`);
        const data = await response.json();
        if (data.length > 0) {
            const lat = parseFloat(data[0].lat);
            const lon = parseFloat(data[0].lon);
            const location = data[0].display_name;

            // Center the map on the searched location
            map.setView([lat, lon], 13);

            // Increment search count
            searchCount++;

            // Add marker to the map with the custom icon
            const marker = L.marker([lat, lon], {
                icon: customIcon // Use the custom icon
            }).addTo(map);

            marker.bindPopup(`<b>${location}</b>`).openPopup();
            markers.push({ location, number: searchCount });

            // Add to history
            updateHistory();

            // Fetch POIs around the searched location
            fetchPOIs(lat, lon);
        } else {
            alert("Location not found!");
        }
    } catch (error) {
        console.error("Error fetching place:", error);
    }
}

// Function to fetch POIs using Overpass API
async function fetchPOIs(lat, lon) {
    const radius = 5000; // Radius in meters
    const overpassUrl = `https://overpass-api.de/api/interpreter?data=[out:json];
        (node["tourism"="hotel"](around:${radius},${lat},${lon});
         node["amenity"="hospital"](around:${radius},${lat},${lon});
         node["tourism"="hostel"](around:${radius},${lat},${lon});
        );
        out;`;

    try {
        const response = await fetch(overpassUrl);
        const data = await response.json();

        // Clear previous POI markers
        poiMarkers.forEach(marker => map.removeLayer(marker));
        poiMarkers = [];

        // Add new POI markers
        data.elements.forEach(element => {
            const poiLat = element.lat;
            const poiLon = element.lon;
            const poiType = element.tags.tourism || element.tags.amenity;
            let icon;

            switch (poiType) {
                case 'hotel':
                    icon = icons.hotel;
                    break;
                case 'hospital':
                    icon = icons.hospital;
                    break;
                case 'hostel':
                    icon = icons.hostel;
                    break;
                default:
                    icon = icons.hotel; // Default icon
            }

            const marker = L.marker([poiLat, poiLon], { icon }).addTo(map);
            marker.bindPopup(`<b>${poiType}</b>`);
            poiMarkers.push({ marker, type: poiType });

            // Hide all POI markers by default
            map.removeLayer(marker);
        });

        // Toggle visibility based on active links
        togglePOIVisibility();
    } catch (error) {
        console.error("Error fetching POIs:", error);
    }
}

// Function to toggle POI visibility based on active links
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

// Update history of searched places
function updateHistory() {
    const historyContainer = document.getElementById('history');
    historyContainer.innerHTML = '';  // Clear the history

    markers.forEach((marker, index) => {
        const historyItem = document.createElement('div');
        historyItem.classList.add('history-item');
        historyItem.innerHTML = `<span>${marker.number}. ${marker.location}</span>`;
        historyContainer.appendChild(historyItem);
    });
}

// Toggle search panel on mobile
document.getElementById('search-toggle').addEventListener('click', function() {
    document.getElementById('search-panel').classList.toggle('open');
});

// Add event listeners to navbar links
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', function(event) {
        event.preventDefault(); // Prevent default link behavior

        // Toggle active class
        this.classList.toggle('active');

        // Update POI visibility
        const poiType = this.id.replace('-link', '');
        poiVisibility[poiType] = !poiVisibility[poiType];

        // Toggle visibility of POIs
        togglePOIVisibility();
    });
});

// Search button event listener
document.getElementById('search-btn').addEventListener('click', function() {
    searchPlace();
});



// Get the search term from the URL
var searchTerm = getQueryParam('search');

if (searchTerm) {
    // Fill the search bar with the search term
    document.getElementById('search-input').value = decodeURIComponent(searchTerm);

    /*// Display the search term (or perform a search)
    document.getElementById('results').innerHTML = '<p>Search results for: <strong>' + decodeURIComponent(searchTerm) + '</strong></p>';*/
}

// Add functionality for the "Search Again" link
document.getElementById('search-btn').addEventListener('click', function(event) {
    event.preventDefault(); // Prevent the default link behavior

    // Get the new search term
    var newSearchTerm = document.getElementById('search-input').value;

    // Redirect to the results page with the new search term
    if (newSearchTerm) {
        window.location.href = 'index_1.html?search=' + encodeURIComponent(newSearchTerm);
    } else {
        alert('Please enter a search term.'); // Optional: Alert if the search term is empty
    }
});