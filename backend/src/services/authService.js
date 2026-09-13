import {hashPassword, comparePassword} from '../utils/password.js';
import {generateToken } from '../utils/jwt.js';
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import User from '../models/user.js';

export async function createUser(username,email,interests,skills,password){
    if(!username || !email || !interests || !skills || !password){
        throw new ApiError(400,"Missing required fields");
    }
    
    try{
        // console.log("Checking existing user with email:",email);

        const existingUser = await User.findOne({email});
        if(existingUser){
            throw new ApiError(
                400,"User with this username or email already exists"
            );
        }

        // console.log("existingUser checked",existingUser);

        const hashedPassword = await hashPassword(password);

        // console.log("hashedPassword",hashedPassword);

        const newUser = await User.create({
            username,
            email,
            interests,
            skills,
            password:hashedPassword
        });

        // await newUser.save();
        // console.log("newUser created",newUser);

        if(!newUser){
            throw new ApiError(500,"Error creating user");
        }
        
        const createdUser = await User.findById(newUser._id).select("-password");
        
        return new ApiResponse(201,createdUser,"User created successfully");
    }
    catch(error){
        // console.error("Error creating user:",error);
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

        // await User.findById(user._id).select("-password");   

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
