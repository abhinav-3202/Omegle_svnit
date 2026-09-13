import * as userService from '../services/userService.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';

export const getUser = asyncHandler(async(req,res)=>{
    const response = await userService.getUser(req,res);
    return res.status(201).json(response,"User retrieved successfully");
}); 