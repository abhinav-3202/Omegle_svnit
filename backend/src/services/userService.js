import {connectDB} from '../config/db.js';
import User from '../models/user.js';
import {ApiError} from '../utils/ApiError.js';
import {ApiResponse} from '../utils/ApiResponse.js';
import {hashPassword,comparePassword} from '../utils/passwordUtils.js';
import dotenv from 'dotenv';
dotenv.config({path:'./.env'});

export const createUser = async(req,res)=>{
    try{
        const {username,email,interests,skills,password} = req.body;
        if(!username || !email || !interests || !skills || !password){
            throw new ApiError(400,"Missing required fields");
        }

        const existingUser = await User.findOne({$or:[{username},{email}]});
        if(existingUser){
            throw new ApiError(
                400,"User with this username or email already exists"
            );
        }

        const hashedPassword = await hashPassword(password);

        const newUser = await User.create({
            username,
            email,
            interests,
            skills,
            hashedPassword
        });

        if(!newUser){
            throw new ApiError(500,"Error creating user");
        }

        delete newUser.password;

        return new ApiResponse(201,newUser,"User created successfully");
    }
    catch(error){
        throw new ApiError(500,"Error creating user");
    }
}