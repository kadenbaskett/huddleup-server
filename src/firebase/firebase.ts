
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

  function deleteFirebaseUsers(userIds: string[]){
    auth
  .deleteUsers(userIds)
  .then((deleteUsersResult) => {
    console.log(`Successfully deleted ${deleteUsersResult.successCount} users`);
    console.log(`Failed to delete ${deleteUsersResult.failureCount} users`);
    deleteUsersResult.errors.forEach((err) => {
      console.log(err.error.toJSON());
    });
  })
  .catch((error) => {
    console.log('Error deleting users:', error);
  });
  }

export { getFirebaseUsers, deleteFirebaseUsers };
