class ConnectionManager {
  constructor() {
    this.connections = new Map();
  }

  addConnection(userId, socket) {
    const id = userId.toString();
    // this.connections.set(id, socket);
    const old = this.connections.get(id);
    if (old && old !== socket) {
        old.close(4000, "Replaced by a new connection");
    }
    this.connections.set(id, socket);

    console.log(`User connected: ${id}`);

    // A second tab or reconnect kills the live session. addConnection overwrites the old socket. 
    // When the old socket later closes, its close handler runs leaveQueue and endMatch for that userId, which wrecks the new connection’s match.
    // Only clean up if connectionManager.getConnection(userId) === socket. 
    // Better, close the old socket explicitly when a new one arrives.
  }

  getConnection(userId) {
    return this.connections.get(userId.toString());
  }

  getConnectionCount() {
    console.log("Active connections:", this.connections.size);
   return this.connections.size;
  }
  
  removeConnection(userId,socket) {
    const id = userId.toString();
    if(this.connections.get(id)=== socket){
        this.connections.delete(id);
        console.log(`User disconnected: ${id}`);
    }
  }

  sendMessage(userId,message){
    const socket = this.getConnection(userId);
    if(socket && socket.readyState === 1) { // Checking if the socket is open
      socket.send(JSON.stringify(message));
      return true;
    } else {
      console.log(`No connection found for user: ${userId}`);
      return false;
    }
  }

  isConnected(userId) {
    const socket = this.getConnection(userId);
    return socket && socket.readyState === 1; // Checking if the socket is open
  }
}

const connectionManager = new ConnectionManager();
// this is a singleton because we have created a sinlge instance of the ConnectionManager class and exported it. This means that throughout the application, whenever we import this module, we will get the same instance of ConnectionManager, allowing us to manage connections consistently across different parts of the application.


export default connectionManager;