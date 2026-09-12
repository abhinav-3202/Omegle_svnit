import User from '../models/user.js';
import {ApiError} from '../utils/ApiError.js';
import {ApiResponse} from '../utils/ApiResponse.js';
import dotenv from 'dotenv';
dotenv.config({path:'./.env'});

export const getUser = async(req,res)=>{
    try{
        const user = await User.findById(req.params.id).select("-password");
        if(!user){
            throw new ApiError(404,"User not found");
        }

        return new ApiResponse(201,user,"User fetched successfully");
    }
    catch(error){
        throw new ApiError(500,"Error fetching user");
    }
}

