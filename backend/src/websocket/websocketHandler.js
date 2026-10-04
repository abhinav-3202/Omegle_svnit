import connectionManager from '../singletons/connectionManager.js';
import {authenticateWebSocket} from './websocketAuth.js';
import { joinQueue, leaveQueue, getQueue } from '../services/queueService.js';
import matchManager from '../singletons/matchManager.js';

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

        socket.on("message",async(data)=>{
            try{
                const message = JSON.parse(data.toString());

                if(message.type === "JOIN_QUEUE"){
                    const result = await joinQueue(user);
                    
                    if(result.matched){
                        const matchedUserId = result.user._id.toString();

                        //creating and storing the current active match
                        const match = matchManager.createMatch(userId, matchedUserId);
                        
                        if(!match){
                            socket.send(
                                JSON.stringify({
                                    type:"ERROR",
                                    message:"Unable to create match.Please try again later."
                                })
                            )
                            return;
                        }

                        connectionManager.sendMessage(userId,{
                            type:"MATCH_FOUND",
                            matchId:match.matchId,
                            partnerId:matchedUserId
                        });

                        connectionManager.sendMessage(matchedUserId, {
                            type: "MATCH_FOUND",
                            matchId:match.matchId,
                            partnerId:userId
                        });  // both get notified about the match
                    }
                    else{
                        socket.send(
                            JSON.stringify({
                                type:"QUEUE_JOINED",
                                message:result.message
                            })
                        );
                    }
                }
                else if(message.type === "LEAVE_QUEUE"){
                    await leaveQueue(userId);
                    socket.send(
                        JSON.stringify({
                            type:"QUEUE_LEFT",
                            message:"You have left the queue."
                        })
                    );
                }
                else if(message.type ==="END_MATCH"){
                    const match = matchManager.getMatchByUserId(userId);
                    if(!match){
                        socket.send(
                            JSON.stringify({
                                type:"ERROR",
                                message:"You are not in an active match."
                            })
                        );
                        return;
                    }

                    if(!matchManager.isMatchParticipant(match.matchId,userId)){
                        socket.send(
                            JSON.stringify({
                                type:"ERROR",
                                message:"You are not a participant of this match."
                            })
                        );
                        return;
                    }

                    const endedMatch = matchManager.endMatch(match.matchId);

                    if(!endedMatch){
                        socket.send(
                            JSON.stringify({
                                type:"ERROR",
                                message:"Unable to end match. Please try again later."
                            })
                        );
                        return;
                    }

                    // Notifying both participants about the match end
                    for(const participantId of endedMatch.participants){
                        connectionManager.sendMessage(participantId,{
                            type:"MATCH_ENDED",
                            matchId:endedMatch.matchId,
                            message:"The match has ended."
                        });
                    }
                }
                else{
                    socket.send(JSON.stringify({
                        type:"ERROR",
                        message:"Unknown message type."
                    }));
                }
            }catch(error){
                console.error("Error handling message:",error.message);
                socket.send(JSON.stringify({
                    type:"ERROR",
                    message:"Error processing your request."
                }));
            }
        })
        socket.on("close",async(userId,socket)=>{
            await leaveQueue(userId);

            const match = matchManager.getMatchByUserId(userId);

            if(match){
                const endedMatch = matchManager.endMatch(match.matchId);

                if(endedMatch){
                    const partnerId = endedMatch.participants.find(
                        participantId => participantId !== userId
                    );

                    connectionManager.sendMessage(partnerId,{
                        type:"PARTNER_DISCONNECTED",
                        matchId:endedMatch.matchId,
                        message:"Your partner has disconnected."
                    });
                }
            }
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