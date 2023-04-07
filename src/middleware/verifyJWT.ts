// import { Request, Response, NextFunction } from 'express';

// export default async function verifyJWT (req : Request, res : Response, next : NextFunction) {
//   try{
//     const token = req.header('authorization');

//     if(!token){
//       res.status(401).send('Unauthorized');
//       return;
//     } 
    
//     const isValid = await verifyFirebaseJWT(token);
//     // const isValid = await getUserCount();

//     console.log('Is valid: ', isValid);

//     if(!isValid){
//       res.status(401).send('Unauthorized');
//       return;
//     }
  
//     next(); //continue to next middleware
//   }
//   catch (err) {
//     console.error(err);
//     res.status(500).send('Internal error occurred');
//     return;
//   }
// }

// async function verifyFirebaseJWT(token: string): Promise<boolean> {
//   try{
//     const decodedToken = await firebaseAdminAuth.verifyIdToken(token);
//     return !!decodedToken;
//   }
//   catch {
//     return false;
//   }
// }

// // async function verifyFirebaseJWT(token : string): Promise<boolean> {
// //   return new Promise<boolean>((resolve) => {
// //     setTimeout(() => {
// //       resolve(Math.random() < 0.5);
// //     }, 1000);
// //   });
// // }

// // async function verifyFirebaseJWT(token: string): Promise<boolean> {
// //   try {
// //     // Verify the JWT using the Firebase Admin SDK
// //     const decodedToken = await firebaseAdminAuth.verifyIdToken(token);
// //     return !!decodedToken;
// //   } catch (error) {
// //     console.error('Error verifying Firebase JWT:', error);
// //     return false;
// //   }
// //}

// async function getUserCount(): Promise<number> {
//   try {
//     const listUsersResult = await firebaseAdminAuth.listUsers();
//     return listUsersResult.users.length;
//   } catch (error) {
//     console.error('Error fetching Firebase users:', error);
//     return -1;
//   }
// }