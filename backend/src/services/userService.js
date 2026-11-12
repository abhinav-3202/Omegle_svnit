import User from '../models/user.js';
import {ApiError} from '../utils/ApiError.js';
import {ApiResponse} from '../utils/ApiResponse.js';

export const getUser = async(req,res)=>{
        const user = await User.findById(req.user._id).select("-password");
        if(!user){
            throw new ApiError(404,"User not found");
        }

        return new ApiResponse(200,user,"User fetched successfully");
}

