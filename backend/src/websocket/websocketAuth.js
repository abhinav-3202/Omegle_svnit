import {verifyToken} from '../utils/jwt.js';
import User from '../models/user.js';

export const authenticateWebSocket = async (request) => {
    try{
        const header = request.headers.authorization;
        if(!header || !header.startsWith('Bearer ')){
            throw new Error('Authorization header missing or malformed');
        }

        const token = header.split(' ')[1];
        const decodedToken = verifyToken(token);
        const user = await User.findById(decodedToken.id).select('-password');

        if(!user){
            throw new Error('User not found');
        }

        return user;
    }catch(error){
        console.error('Error occurred while authenticating WebSocket:', error);
    }
}