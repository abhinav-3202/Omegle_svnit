import mongoose,{Schema} from "mongoose";

const userSchema = new Schema({
    username:{
        type:String,
        required:true,
        unique:true
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    interests:{
        type:[String],
        default:[],
        required:true
    },
    skills:{
        type:[String],
        default:[],
        required:true
    }
},
{
    timestamps:true
}
);