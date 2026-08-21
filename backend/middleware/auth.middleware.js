import jwt from 'jsonwebtoken';
export default function authMiddleware(req,res,next){try{const token=(req.headers.authorization||'').replace(/^Bearer\s+/i,'');if(!token)throw new Error();req.user=jwt.verify(token,process.env.JWT_SECRET);next()}catch{return res.status(401).json({error:'Authentication required'})}}
