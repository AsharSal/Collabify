// src/utils/socket.js
import { io } from "socket.io-client";

// Connect to the backend WebSocket server (adjust URL if needed)
const socket = io(process.env.REACT_APP_SOCKET_URL || "http://localhost:5000");

export default socket;
