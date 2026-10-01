import dotenv from 'dotenv';
dotenv.config({ path: './.env' });
import http from 'http';
import { app } from './app.js';
import { connectDB } from './config/db.js';
import { initializeWebSocket } from './websocket/websocketServer.js';


const startServer = async () => {
    try {
        await connectDB();
        const PORT = process.env.PORT || 3000;
        const server = http.createServer(app);
        initializeWebSocket(server);    
        server.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    } catch (error) {
        console.error(`Error starting server: ${error.message}`);
    }
}

startServer();