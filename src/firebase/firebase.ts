
import admin from 'firebase-admin';

const serviceAccountKey = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

try {
  console.log('Initing firebase admin app');
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccountKey),
  });
} catch (error) {
  console.error('Error initializing Firebase Admin SDK: ', error);
}

const firebaseAdminAuth = admin.auth();

export { firebaseAdminAuth };
