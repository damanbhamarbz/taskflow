import Todo from '../models/todo.model.js';
const shape=t=>({id:t._id,title:t.title,description:t.description,priority:t.priority,dueDate:t.dueDate,completed:t.completed,createdAt:t.createdAt});
export async function createTodo(req,res){const{title,description='',priority='medium',dueDate=''}=req.body;if(!String(title||'').trim())return res.status(400).json({error:'Title is required'});const t=await Todo.create({user:req.user.id,title:String(title).trim(),description,priority,dueDate});res.status(201).json({task:shape(t)})}
export async function getTodos(req,res){const ts=await Todo.find({user:req.user.id}).sort({createdAt:-1});res.json({tasks:ts.map(shape)})}
export async function updateTodo(req,res){const t=await Todo.findOneAndUpdate({_id:req.params.id,user:req.user.id},req.body,{new:true,runValidators:true});if(!t)return res.status(404).json({error:'Task not found'});res.json({task:shape(t)})}
export async function deleteTodo(req,res){const t=await Todo.findOneAndDelete({_id:req.params.id,user:req.user.id});if(!t)return res.status(404).json({error:'Task not found'});res.json({deleted:true})}
