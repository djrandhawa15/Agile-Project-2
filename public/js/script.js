console.log("✅ Script loaded");

const socket = io();
const map = L.map('map').setView([0, 0], 2);

// Load tile layer
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: 'Dilraj\'s Map',
}).addTo(map);

// Track markers by socket ID
const markers = {};

// 🔍 Geolocation
if (navigator.geolocation) {
    navigator.geolocation.watchPosition(
        (position) => {
            const latitude = position.coords.latitude;
            const longitude = position.coords.longitude;
            console.log(`📍 Geolocation success: Latitude ${latitude}, Longitude ${longitude}`);
            socket.emit('location', { latitude, longitude });
        },
        (error) => {
            console.error('❌ Geolocation error:', error);
        },
        {
            enableHighAccuracy: true,
            maximumAge: 0,
            timeout: 5000
        }
    );
} else {
    console.warn("⚠️ Geolocation not supported in this browser.");
}

// 🧪 Force test marker after 2s
setTimeout(() => {
    console.log("🧪 Sending fake location for test...");
    socket.emit('location', { latitude: 49.2827, longitude: -123.1207 }); // Vancouver
}, 2000);

// 🎯 Receive location and place marker
socket.on("receive-location", (data) => {
    console.log("📦 Received location from socket:", data);
    const { id, latitude, longitude } = data;
    const position = [latitude, longitude];

    // Optionally center map on latest location
    map.setView(position, 13);

    if (markers[id]) {
        markers[id].setLatLng(position);
    } else {
        markers[id] = L.marker(position).addTo(map).bindPopup(`User ${id}`).openPopup();
    }
});

// ❌ Handle disconnection
socket.on("user-disconnected", (userId) => {
    console.log(`❌ User disconnected: ${userId}`);
    if (markers[userId]) {
        map.removeLayer(markers[userId]);
        delete markers[userId];
    }
});
