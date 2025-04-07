const express = require('express');
const app = express();
const path = require('path');

const socketIo = require('socket.io');
const http = require('http');

const server = http.createServer(app);
const io = socketIo(server);

app.set ('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));


io.on("connection", (socket) => {
    console.log("connected");

    socket.on("location", (data) => {
        console.log("Location received:", data);
        io.emit("receive-location", {
            id: socket.id,
            latitude: data.latitude,
            longitude: data.longitude
        });
    });

    socket.on("disconnect", () => {
        console.log("User disconnected:", socket.id);
        io.emit("user-disconnected", socket.id); // 🔁 CUSTOM event name
    });
});


app.get ('/', (req, res) => {
    res.render("index");
});

server.listen(3000, () => {
    console.log('Server is running on port 3000')
})