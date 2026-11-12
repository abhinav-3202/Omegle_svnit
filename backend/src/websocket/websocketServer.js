import {WebSocketServer} from 'ws';
import {handleWebSocketConnection} from './websocketHandler.js';
import {consumeWebSocketTicket} from '../services/webSocketTicketService.js';
import {authenticateWebSocket} from './websocketAuth.js';

export const initializeWebSocket = (server) => {
    const wss = new WebSocketServer({ noServer: true });

    server.on('upgrade', async(request, socket, head) => {
        try{
            console.log("Upgrade request:", request.url);
            const requestUrl = new URL(
                request.url,
                `http://${request.headers.host}`
            )

            
            if(requestUrl.pathname !== '/ws'){
                socket.write("HTTP/1.1 404 Not Found\r\n\r\n");
                socket.destroy();
                return;
            }
            
            // requestUrl se ticket nikala h 
            const ticket = requestUrl.searchParams.get('ticket');
            // console.log("WebSocket path:", requestUrl.pathname);
            // console.log("Ticket received:", Boolean(ticket));
            if(!ticket){
                socket.write("HTTP/1.1 401 Unauthorized\r\n\r\n");
                socket.destroy(); // closes the network connection
                return; // exit the callback so that the rejected req cannot proceed
            }

            const ticketData = consumeWebSocketTicket(ticket);
            // console.log("Ticket data:", ticketData);
            // console.log("Ticket user ID:", ticketData?.userId);
            // console.log("Ticket valid:", Boolean(ticketData));
            if(!ticketData){
                socket.write("HTTP/1.1 401 Unauthorized\r\n\r\n");
                socket.destroy();
                return;
            }

            // now attaching the authenticated userId to the request 

            request.authenticatedUserId = ticketData.userId;
            try{
                request.user = await authenticateWebSocket(request); // load user BEFORE upgrading
            }catch(e){
                socket.write("HTTP/1.1 401 Unauthorized\r\n\r\n");
                socket.destroy();
                return;
            }

            wss.handleUpgrade(request, socket, head, (ws) => {
                wss.emit('connection', ws, request);
            });
        }
        catch(err){
            console.error("Error during WebSocket upgrade:", err);
            socket.write("HTTP/1.1 500 Internal Server Error\r\n\r\n");
            socket.destroy();
        }
    })

    console.log('WebSocket server initialized');

    wss.on('connection',(socket,request)=>{
        console.log("Authenticated websocket connection");

        handleWebSocketConnection(socket, request);
    })

    return wss;

}