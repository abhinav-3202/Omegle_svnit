import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
dotenv.config({path:'./.env'});
import jwt from 'jsonwebtoken';

export const generateToken = (payload) => {
    return jwt.sign(payload,process.env.JWT_SECRET,{expiresIn:process.env.JWT_EXPIRY});
}

export const verifyToken = (token) => {
    return jwt.verify(token,process.env.JWT_SECRET);
}