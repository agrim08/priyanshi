import mongoose from "mongoose";

const cusineSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true,
    },
    imageUrl:{
        type:String,
    },
    description:{
        type:String,
        required:true,
    },
},{timestamps:true})

const Cusine = mongoose.model("Cusine", cusineSchema);
export default Cusine;
