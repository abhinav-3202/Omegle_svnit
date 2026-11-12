import * as authService from '../services/authService.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import {createWebSocketTicket} from '../services/webSocketTicketService.js';

export const registerUser = asyncHandler(async(req,res)=>{
    const {email,password,username,interests,skills} = req.body;
    const response = await authService.createUser(username,email,interests,skills,password);
    res.status(201).json(new ApiResponse(201,response,"User registered successfully"));
});

export const loginUser = asyncHandler(async(req,res)=>{
    const {email,password} = req.body;
    const response = await authService.loginUser(email,password);
    res.status(200).json(new ApiResponse(200,response,"Login successful"));
});

export const issueWebSocketTicket = asyncHandler(async(req,res)=>{
    const userId = req.user._id;
    const ticket = createWebSocketTicket(userId);
    res.status(200).json(
        new ApiResponse(
            200,
            {ticket},
            "WebSocket ticket issued successfully"
        ));
});