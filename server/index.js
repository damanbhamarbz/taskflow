import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Database from 'better-sqlite3';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const db = new Database(path.join(__dirname, 'taskflow.db'));
db.pragma('journal_mode = WAL');
db.exec(`CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, email TEXT UNIQUE NOT NULL, password TEXT NOT NULL, created_at TEXT NOT NULL); CREATE TABLE IF NOT EXISTS tasks (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER NOT NULL, title TEXT NOT NULL, description TEXT DEFAULT '', priority TEXT NOT NULL DEFAULT 'medium', due_date TEXT DEFAULT '', completed INTEGER NOT NULL DEFAULT 0, created_at TEXT NOT NULL, FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE);`);
const app=express(); app.use(cors()); app.use(express.json());
const secret=process.env.JWT_SECRET||'taskflow-development-secret-change-me';
const tokenFor=u=>jwt.sign({id:u.id,email:u.email},secret,{expiresIn:'7d'});
function auth(req,res,next){const h=req.headers.authorization||''; try{req.user=jwt.verify(h.replace(/^Bearer\s+/i,''),secret);next()}catch{return res.status(401).json({error:'Authentication required'})}}
app.get('/api/health',(_,res)=>res.json({ok:true}));
app.post('/api/auth/register',(req,res)=>{const {name,email,password}=req.body||{}; if(!name||!email||!password||password.length<6)return res.status(400).json({error:'Name, email and password (6+ characters) are required'}); try{const hash=bcrypt.hashSync(password,12); const info=db.prepare('INSERT INTO users(name,email,password,created_at) VALUES(?,?,?,?)').run(name.trim(),email.trim().toLowerCase(),hash,new Date().toISOString()); const u={id:Number(info.lastInsertRowid),name:name.trim(),email:email.trim().toLowerCase()};res.status(201).json({user:u,token:tokenFor(u)})}catch{return res.status(409).json({error:'Email is already registered'})}});
app.post('/api/auth/login',(req,res)=>{const {email,password}=req.body||{};const u=db.prepare('SELECT * FROM users WHERE email=?').get(String(email||'').trim().toLowerCase());if(!u||!bcrypt.compareSync(password||'',u.password))return res.status(401).json({error:'Invalid email or password'});const user={id:u.id,name:u.name,email:u.email};res.json({user,token:tokenFor(user)})});
app.get('/api/me',auth,(req,res)=>{const u=db.prepare('SELECT id,name,email FROM users WHERE id=?').get(req.user.id);res.json({user:u})});
app.get('/api/tasks',auth,(req,res)=>{const rows=db.prepare('SELECT id,title,description,priority,due_date as dueDate,completed,created_at as createdAt FROM tasks WHERE user_id=? ORDER BY created_at DESC').all(req.user.id);res.json({tasks:rows.map(x=>({...x,completed:Boolean(x.completed)}))})});
app.post('/api/tasks',auth,(req,res)=>{const {title,description='',priority='medium',dueDate=''}=req.body||{};if(!String(title||'').trim())return res.status(400).json({error:'Title is required'});const now=new Date().toISOString();const info=db.prepare('INSERT INTO tasks(user_id,title,description,priority,due_date,completed,created_at) VALUES(?,?,?,?,?,0,?)').run(req.user.id,String(title).trim(),String(description||'').trim(),['low','medium','high'].includes(priority)?priority:'medium',dueDate||'',now);res.status(201).json({task:{id:Number(info.lastInsertRowid),title:String(title).trim(),description:String(description||'').trim(),priority,dueDate:dueDate||'',completed:false,createdAt:now}})});
app.put('/api/tasks/:id',auth,(req,res)=>{const old=db.prepare('SELECT * FROM tasks WHERE id=? AND user_id=?').get(req.params.id,req.user.id);if(!old)return res.status(404).json({error:'Task not found'});const b=req.body||{};const next={title:b.title??old.title,description:b.description??old.description,priority:b.priority??old.priority,dueDate:b.dueDate??old.due_date,completed:typeof b.completed==='boolean'?b.completed:Boolean(old.completed)};db.prepare('UPDATE tasks SET title=?,description=?,priority=?,due_date=?,completed=? WHERE id=? AND user_id=?').run(next.title,next.description,next.priority,next.dueDate,next.completed?1:0,req.params.id,req.user.id);res.json({task:{id:Number(req.params.id),...next,createdAt:old.created_at}})});
app.delete('/api/tasks/:id',auth,(req,res)=>{const r=db.prepare('DELETE FROM tasks WHERE id=? AND user_id=?').run(req.params.id,req.user.id);if(!r.changes)return res.status(404).json({error:'Task not found'});res.json({deleted:true})});
const port=process.env.PORT||3000; app.listen(port,()=>console.log(`TaskFlow API running on http://localhost:${port}`));
