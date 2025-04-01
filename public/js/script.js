const socket=io();

if (navigator.geolocation) {
    navigator.geolocation.watchPosition((position) => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;
        console.log(`Latitude: ${latitude}, Longitude: ${longitude}`);
        socket.emit('location', { latitude, longitude });
    }, (error) => { 
        console.error('Error getting location:', error);
    },
    {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 5000
    }
    );
}
L.map('map').setView([0, 0], 2);
socket.on('location', (data) => {
    const { latitude, longitude } = data;
    console.log(`Received location: Latitude: ${latitude}, Longitude: ${longitude}`);
    L.marker([latitude, longitude]).addTo(map).bindPopup('User Location').openPopup();
});
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: 'Dilrajs Map'
}).addTo(map);

const markers = {};

socket.on('location', (data) => {
    const { userId, latitude, longitude } = data;
    const position = [latitude, longitude];

    if (markers[userId]) {
        markers[userId].setLatLng(position);
    } else {
        markers[userId] = L.marker(position).addTo(map).bindPopup(`User ${userId}`).openPopup();
    }
}
socket.on('disconnect', (userId) => {
    if (markers[userId]) {
        map.removeLayer(markers[userId]);
        delete markers[userId];
    }
}