import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { verifyToken } from "../utils/jwt.js";
import User from "../models/user.js";

export const verifyJWT = asyncHandler(async(req,res,next)=>{
    const header = req.header("Authorization");

    if(!header || !header.startsWith("Bearer ")){
        throw new ApiError(401,"Unauthorized");
    }

    const token = header.split(" ")[1];
    const decodedToken = verifyToken(token);

    const user = await User.findById(decodedToken.id).select("-password");
    
    if(!user){
        throw new ApiError(401,"Unauthorized user");
    }

    // delete user.password; // this could be the case of postgre
    
    req.user = user;
    next();
})