export const handleWebSocketConnection = (socket, request) => {
    console.log('Client connected');

    socket.send(
        JSON.stringify({
            type:"CONNECTED",
            message:"websocket connection established"
        })
    )

    socket.on("message",(message)=>{
        console.log("Message Recieved",message.toString());

        socket.send(
            JSON.stringify({
                type:"ECHO",
                message:message.toString(),
            })
        );
    })

    socket.on("close",()=>{
        console.log("Client disconnected");
    });

    socket.on("error",(error)=>{
        console.error("Websocket error:",error.message);
    })
}