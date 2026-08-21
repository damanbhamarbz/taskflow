import mongoose from 'mongoose';
const todoSchema=new mongoose.Schema({user:{type:mongoose.Schema.Types.ObjectId,ref:'User',required:true,index:true},title:{type:String,required:true,trim:true},description:{type:String,default:''},priority:{type:String,enum:['low','medium','high'],default:'medium'},dueDate:{type:String,default:''},completed:{type:Boolean,default:false}},{timestamps:true});
export default mongoose.models.Todo||mongoose.model('Todo',todoSchema);
