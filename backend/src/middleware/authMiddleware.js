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
    let decodedToken;

    try{
        decodedToken = verifyToken(token);
    }
    catch(error){
        if(error instanceof jwt.TokenExpiredError ||
              error instanceof jwt.JsonWebTokenError||
              error instanceof jwt.NotBeforeError){
            throw new ApiError(401,"Invalid or expired token");
        }
        throw error;
    }

    const user = await User.findById(decodedToken.id).select("-password");
    
    if(!user){
        throw new ApiError(401,"Unauthorized user");
    }

    // delete user.password; // this could be the case of postgre
    
    req.user = user;
    next();
})