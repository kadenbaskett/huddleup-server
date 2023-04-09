import { firebaseAdminAuth } from '@/server';
import { Request, Response, NextFunction } from 'express';

export default async function verifyJWT (req : Request, res : Response, next : NextFunction) {
  try{
        if(req.path.startsWith('/api-docs') || (req.path.startsWith('/database/user') && req.method === 'post')){ //skip swagger docs
          return next();
        }

        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
          return res.status(401).json({ message: 'Missing or invalid Authorization header' });
        }
  
        const token = authHeader.split(' ')[1];

        if (!token) {
          res.status(401).send('Unauthorized');
          return;
        }
        
        const isValid = await verifyFirebaseJWT(token);
        if(!isValid){
          res.status(401).send('Unauthorized');
          return;
        }
      
        next(); //continue to next middleware
      }
      catch (err) {
        console.error(err);
        res.status(500).send('Internal error occurred');
        return;
      }
}

async function verifyFirebaseJWT(token: string): Promise<boolean> {
  try {
    const decodedToken = await firebaseAdminAuth.verifyIdToken(token);
    return !!decodedToken;
  } catch (error) {
    return false;
  }
}