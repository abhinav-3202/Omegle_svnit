import {hashPassword, comparePassword} from '../utils/password.js';
import {generateToken } from '../utils/jwt.js';
import { ApiError } from "../utils/ApiError.js";
import dotenv from 'dotenv';
dotenv.config({path:'./.env'});
import User from '../models/user.js';

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

        return new ApiResponse(201,newUser,"User created successfully");
    }
    catch(error){
        throw new ApiError(500,"Error creating user");
    }
}

export async function loginUser(email,password) {
    if(!email || !password){
        throw new ApiError(
            400,
            "Missing required fields"
        );
    }

    try{
        const user = await User.findOne({email});
        if(!user){
            throw new ApiError(
                401,
                "Invalid credentials"
            );
        }

        const isPasswordValid = await comparePassword(password,user.password);
        if(!isPasswordValid){
            throw new ApiError(
                401,
                "Invalid credentials"
            );
        }

        await user.findById(user._id).select("-password");

        const token = generateToken({
            id: user._id,
            email: user.email
        })

        return { 
            user:{
                id: user._id,
                email: user.email
            },
            token
         };
    } catch (err) {
        throw err;
    }
}
