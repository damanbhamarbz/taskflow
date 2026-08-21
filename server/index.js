import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';

const app = express();
app.use(cors());
app.use(express.json());

const secret = process.env.JWT_SECRET || 'taskflow-development-secret-change-me';
const mongoUri = process.env.MONGODB_URI;

const userSchema = new mongoose.Schema({ name:{type:String,required:true,trim:true}, email:{type:String,required:true,unique:true,lowercase:true,trim:true}, password:{type:String,required:true} },{timestamps:true});
const taskSchema = new mongoose.Schema({ userId:{type:mongoose.Schema.Types.ObjectId,ref:'User',required:true,index:true}, title:{type:String,required:true,trim:true}, description:{type:String,default:''}, priority:{type:String,enum:['low','medium','high'],default:'medium'}, dueDate:{type:String,default:''}, completed:{type:Boolean,default:false} },{timestamps:true});
const User = mongoose.models.User || mongoose.model('User',userSchema);
const Task = mongoose.models.Task || mongoose.model('Task',taskSchema);

const tokenFor = u => jwt.sign({id:String(u._id),email:u.email},secret,{expiresIn:'7d'});
function auth(req,res,next){const h=req.headers.authorization||'';try{req.user=jwt.verify(h.replace(/^Bearer\s+/i,''),secret);next()}catch{return res.status(401).json({error:'Authentication required'})}}

app.get('/api/health',(_,res)=>res.json({ok:true,database:mongoose.connection.readyState===1?'connected':'disconnected'}));
app.post('/api/auth/register',async(req,res)=>{try{const {name,email,password}=req.body||{};if(!name||!email||!password||password.length<6)return res.status(400).json({error:'Name, email and password (6+ characters) are required'});const normalized=email.trim().toLowerCase();if(await User.exists({email:normalized}))return res.status(409).json({error:'Email is already registered'});const user=await User.create({name:name.trim(),email:normalized,password:await bcrypt.hash(password,12)});const safe={id:String(user._id),name:user.name,email:user.email};res.status(201).json({user:safe,token:tokenFor(user)})}catch(e){res.status(500).json({error:'Registration failed'})}});
app.post('/api/auth/login',async(req,res)=>{try{const {email,password}=req.body||{};const user=await User.findOne({email:String(email||'').trim().toLowerCase()});if(!user||!(await bcrypt.compare(password||'',user.password)))return res.status(401).json({error:'Invalid email or password'});res.json({user:{id:String(user._id),name:user.name,email:user.email},token:tokenFor(user)})}catch{res.status(500).json({error:'Login failed'})}});
app.get('/api/me',auth,async(req,res)=>{const user=await User.findById(req.user.id).select('name email');if(!user)return res.status(404).json({error:'User not found'});res.json({user:{id:String(user._id),name:user.name,email:user.email}})});
app.get('/api/tasks',auth,async(req,res)=>{const rows=await Task.find({userId:req.user.id}).sort({createdAt:-1}).lean();res.json({tasks:rows.map(x=>({id:String(x._id),title:x.title,description:x.description,priority:x.priority,dueDate:x.dueDate,completed:x.completed,createdAt:x.createdAt}))});});
app.post('/api/tasks',auth,async(req,res)=>{const {title,description='',priority='medium',dueDate=''}=req.body||{};if(!String(title||'').trim())return res.status(400).json({error:'Title is required'});const task=await Task.create({userId:req.user.id,title:String(title).trim(),description:String(description||'').trim(),priority:['low','medium','high'].includes(priority)?priority:'medium',dueDate:dueDate||''});res.status(201).json({task:{id:String(task._id),title:task.title,description:task.description,priority:task.priority,dueDate:task.dueDate,completed:task.completed,createdAt:task.createdAt}})});
app.put('/api/tasks/:id',auth,async(req,res)=>{const old=await Task.findOne({_id:req.params.id,userId:req.user.id});if(!old)return res.status(404).json({error:'Task not found'});const b=req.body||{};old.title=b.title??old.title;old.description=b.description??old.description;old.priority=b.priority??old.priority;old.dueDate=b.dueDate??old.dueDate;old.completed=typeof b.completed==='boolean'?b.completed:old.completed;await old.save();res.json({task:{id:String(old._id),title:old.title,description:old.description,priority:old.priority,dueDate:old.dueDate,completed:old.completed,createdAt:old.createdAt}})});
app.delete('/api/tasks/:id',auth,async(req,res)=>{const r=await Task.deleteOne({_id:req.params.id,userId:req.user.id});if(!r.deletedCount)return res.status(404).json({error:'Task not found'});res.json({deleted:true})});

const port=process.env.PORT||3000;
if(!mongoUri){console.error('MONGODB_URI is missing. Create a .env file from .env.example before starting the server.');process.exit(1)}
mongoose.connect(mongoUri).then(()=>{console.log('MongoDB connected');app.listen(port,()=>console.log(`TaskFlow API running on http://localhost:${port}`));}).catch(err=>{console.error('MongoDB connection failed:',err.message);process.exit(1)});
