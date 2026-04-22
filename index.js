const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
require("dotenv").config();

const app = express();
const httpServer = http.createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
    },
});

const PORT = process.env.PORT || 5555;

// Middleware
app.use(
    cors({
        origin: "*",
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"],
        credentials: true,
    }),
);
app.use(express.json());

// MongoDB Connection with improved error handling
const mongoURI = process.env.MONGO_URI;

mongoose
    .connect(mongoURI, {
        maxPoolSize: 10,
        minPoolSize: 2,
        socketTimeoutMS: 45000,
        serverSelectionTimeoutMS: 10000,
        retryWrites: true,
        w: "majority",
    })
    .then(() => {
        console.log("✅ MongoDB connected successfully");
        console.log("📊 Connected to:", mongoURI);
    })
    .catch((err) => {
        console.error("❌ MongoDB connection error:", err.message);
        console.error("🔗 Attempting to connect to:", mongoURI);
        process.exit(1);
    });

// Monitor connection events
mongoose.connection.on("disconnected", () => {
    console.warn("⚠️ MongoDB disconnected, attempting to reconnect...");
});

mongoose.connection.on("error", (err) => {
    console.error("❌ MongoDB connection error:", err.message);
});

// Routes
const authRoutes = require("./routes/authRoutes");
const journalRoutes = require("./routes/journalRoutes");
const messageRoutes = require("./routes/messageRoutes");

app.use("/api/auth", authRoutes);
app.use("/api/journals", journalRoutes);
app.use("/api/messages", messageRoutes);

// Start server listening on all network interfaces
httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Server running on http://0.0.0.0:${PORT}`);
    console.log(`📡 Access from network using your machine IP:PORT`);
});

// Socket.io initialization
io.on("connection", (socket) => {
    console.log("🔌 New connection:", socket.id);

    // Join station/department room
    socket.on("join_room", (roomId) => {
        socket.join(roomId);
        console.log(`🏠 User joined room: ${roomId}`);
    });

    // Dispatcher sends message
    socket.on("new_dispatcher_message", (message) => {
        // Broadcast based on targetType
        if (message.targetType === "all") {
            io.emit("receive_dispatcher_message", message);
        } else {
            io.to(message.targetId).emit("receive_dispatcher_message", message);
        }
    });

    socket.on("disconnect", () => {
        console.log("🔌 User disconnected");
    });
});

// Test Route
app.get("/api/test", (req, res) => {
    res.json({
        message: "Metro Digital Journal Backend is Live!",
        status: "OK",
    });
});

httpServer.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
