
import admin from 'firebase-admin';

const serviceAccountKey = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccountKey),
});

const auth = admin.auth();

function getFirebaseUsers(nextPageToken?: string, allUsers: admin.auth.UserRecord[] = []): Promise<admin.auth.UserRecord[]> {
    return auth.listUsers(1000, nextPageToken)
      .then((listUsersResult) => {
        allUsers.push(...listUsersResult.users);
        if (listUsersResult.pageToken) {
          return getFirebaseUsers(listUsersResult.pageToken, allUsers);
        } else {
          return allUsers;
        }
      });
  }

export { getFirebaseUsers };
