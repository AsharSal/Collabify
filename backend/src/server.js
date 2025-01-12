require("dotenv").config();
const express = require("express");
const http = require("http");
const mongoose = require("mongoose");
const cors = require("cors");
const socketIo = require("socket.io");
const authRoutes = require("./routes/authRoutes");
const documentRoutes = require("./routes/documentRoutes");

const app = express();
const server = http.createServer(app); // Create HTTP server
const io = socketIo(server, {
  cors: {
    origin: "*", // Allow all origins for now
    methods: ["GET", "POST"],
  },
});

app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/documents", documentRoutes);

// Database Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log("DB Error: ", err));

  // Socket.IO connection handler
io.on("connection", (socket) => {
    console.log("A user connected", socket.id);
  
    // Join a document room based on document ID
    socket.on("joinDocument", (documentId, username) => {
        socket.join(documentId);  // Join a room for the specific document
        console.log(`User joined document room: ${documentId}`);
        socket.to(documentId).emit("userJoined", { username, socketId: socket.id });

        // Handle content update from clients
        socket.on("updateDocument", (documentId, content) => {
        socket.to(documentId).emit("documentUpdated", content);  // Emit to all clients in the same room
        });

        // Handle typing events
        socket.on("userTyping", (username) => {
            socket.to(documentId).emit("typing", username);
        });

        //real time adding comments

        socket.on("newComment", (comment) => {
          console.log("new comment emitted");
          socket.to(documentId).emit("commentAdded", comment);
        });

        // Disconnect handling
        socket.on("disconnect", () => {
            console.log(`${username} disconnected`);
            socket.to(documentId).emit("userLeft", socket.id);
        });
    });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
