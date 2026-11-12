// import {verifyToken} from '../utils/jwt.js';
import User from '../models/user.js';

export const authenticateWebSocket = async (request) => {
    const userId = request.authenticatedUserId;
    console.log("User ID received by websocketAuth:", userId);
    if(!userId){
        throw new Error("WebSocket authentication failed");
    }

    const user = await User.findById(userId).select('-password');
    if(!user){
        throw new Error("Authenticated user not found");
    }

    return user;
}