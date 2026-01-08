const { io } = require("socket.io-client");

console.log("Intentando conectar a http://localhost:3001...");
const socket = io("http://localhost:3001", {
    transports: ["websocket", "polling"]
});

socket.on("connect", () => {
    console.log("¡Conectado! ID:", socket.id);
    socket.emit("join_bus", "NB-TEST");
});

socket.on("connect_error", (err) => {
    console.log("Error de conexión:", err.message);
});

socket.on("update_location", (data) => {
    console.log("Dato recibido:", data);
    process.exit(0); // Success
});

// Timeout
setTimeout(() => {
    console.log("Timeout: No se pudo conectar.");
    process.exit(1);
}, 5000);
