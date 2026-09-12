import * as authService from '../services/authService.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';

export const registerUser = asyncHandler(async(req,res)=>{
    const response = await authService.createUser(req,res);
    res.status(response.statusCode).json(response);
});

export const loginUser = asyncHandler(async(req,res)=>{
    const {email,password} = req.body;
    const response = await authService.loginUser(email,password);
    res.status(200).json(new ApiResponse(200,response,"Login successful"));
});