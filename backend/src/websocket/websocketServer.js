import {WebSocketServer} from 'ws';
import {handleWebSocketConnection} from './websocketHandler.js';

export const initializeWebSocket = (server) => {
    const wss = new WebSocketServer({ server });

    console.log('WebSocket server initialized');

    wss.on('connection',(socket,request)=>{
        console.log("New websocket connection");

        handleWebSocketConnection(socket, request);
    })

    return wss;

}