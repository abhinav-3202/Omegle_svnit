import WebSocket from "ws";

const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjZhYTY2YThhMGM3ZmFjM2EzOGZiYzNjYiIsImVtYWlsIjoiYUBnbWFpbC5jb20iLCJpYXQiOjE3OTEwMDc4NzgsImV4cCI6MTc5MTAxMTQ3OH0.HsJs072hQn_Fa6qQ4eZkR1R-kIcemGL6F2AVQu5ctOk";

const socket = new WebSocket("ws://localhost:3000", {
    headers: {
        Authorization: `Bearer ${token}`
    }
});

socket.on("open", () => {
    console.log("WebSocket connected");
});

socket.on("message", (data) => {
    console.log("Server:", data.toString());
});

socket.on("close", (code, reason) => {
    console.log("Disconnected:", code, reason.toString());
});

socket.on("error", (error) => {
    console.error("Error:", error.message);
});