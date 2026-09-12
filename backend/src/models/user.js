import mongoose,{Schema} from "mongoose";

const userSchema = new Schema({
    username:{
        type:String,
        required:true,
        unique:true,
        trim:true
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    password:{
        type:String,
        required:true
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

const User = mongoose.model("User",userSchema);
export default User;