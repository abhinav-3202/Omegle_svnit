import connectionManager from '../singletons/connectionManager.js';
import {authenticateWebSocket} from './websocketAuth.js';

export const handleWebSocketConnection = async (socket, request) => {

    try{
        const user = await authenticateWebSocket(request);

        const userId = user._id.toString();

        connectionManager.addConnection(userId, socket);

        socket.send(
            JSON.stringify({
                type:"CONNECTED",
                message:"WebSocket Authentication successful",
                userId
            })
        );

        socket.on("close",()=>{
           connectionManager.removeConnection(userId,socket);
        });

        socket.on("error",(error)=>{
            console.error("Websocket error:",error.message);
        })
    }catch(error){
        console.log(error.message);
        socket.close(1008,"Unauthorized");
    }

    
}