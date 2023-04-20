import App from '@/app';
import validateEnv from '@utils/validateEnv';
import DataSinkApp from './datasink/app';
import Seed from './datasink/seed';
import DatabaseRoute from './routes/database.route';
import DraftSocketServer from './draft/draftSocketServer';
import { TaskManager } from './TaskManager/taskManager';
import admin from 'firebase-admin';

validateEnv();

const args = process.argv.slice(2);

const initOnly = args.includes('init') && !args.includes('seed');
const seedOnly = !args.includes('init') && args.includes('seed');
const initAndSeed = args.includes('init') && args.includes('seed');
const onlyClearDB = args.includes('onlyClearDB');
const fillLeague = args.includes('fillLeague');
const createEmptyLeague = args.includes('createEmptyLeague');
const simulateDraft = args.includes('simulateDraft');
const simulateMatchups = args.includes('simulateMatchups');
const simulateWeek = args.includes('simulateWeek');
const seedUsers = args.includes('seedUsers');
const syncDBWithFirebase = args.includes('syncDBWithFirebase');
const clearFirebaseUsers = args.includes('clearFirebaseUsers');

// create firebase admin app instance
const serviceAccountKey = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
try {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccountKey),
  });
} catch (error) {
  console.error('Error initializing Firebase Admin SDK: ', error);
}

const firebaseAdminAuth = admin.auth();

let draftSocketServer: DraftSocketServer;
let taskManager: TaskManager; 

if(process.env.SERVICE === 'backend')
{
    const routes = [
        new DatabaseRoute(),
    ];

    const backendApp = new App(routes);
    backendApp.listen();
  }
else if(process.env.SERVICE === 'websocket')
{
  try{
    const leagueId = Number(args[0]);
    const port = Number(args[1]);

    if(!leagueId)
    {
      throw new Error('Provide a league id to start the draft for');
    }
    console.log('Starting up draft websocket for league ', leagueId, 'on port', port);
    try{
      draftSocketServer = new DraftSocketServer(leagueId, port);
    }
    catch(e)
    {
      console.log('failed creating the socker');
      console.log('e', e);
    }

    draftSocketServer.start();
  }
  catch(e){
    console.log(e);
  }
}
else if(process.env.SERVICE === 'taskManager')
{
  try
  {
    console.log('Starting up the task manager service');
    taskManager = new TaskManager();
    taskManager.start();
  }
  catch(e){
    console.log(e);
  }
}
else if(process.env.SERVICE === 'datasink')
{
  const dataSink = new DataSinkApp();

  if (process.env.NODE_ENV === 'development') {

    const seed = new Seed();

    if (onlyClearDB) {
      console.log('clear only');
      seed.clearLeagueStuff();
    } else if (initAndSeed) {
      console.log('init and seed');
      dataSink.initialUpdate().then(() => seed.seedDB());
    } else if (seedOnly) {
      console.log('seed only');
      seed.seedDB();
    } else if (initOnly) {
      console.log('init only');
      dataSink.initialUpdate();
    } else if (fillLeague) {
      console.log('filling league');
      seed.fillLeague(Number(args[1]));
    } else if (createEmptyLeague) {
      console.log('creating an empty league');
      seed.createEmptyLeague();
    } else if (simulateDraft) {
      console.log('simulating draft');
      seed.simulateDraft(Number(args[1]));
    } else if (simulateMatchups) {
      console.log('simulating matchups');
      seed.simulateMatchups(Number(args[1]));
    } else if (simulateWeek) {
      console.log('simulating week');
      const weekToSim = Number(args[1]);
      seed.simulateWeek(weekToSim); // leagueID, week number
    } else if (seedUsers){
      console.log('seeding users');
      seed.createFirebaseUsers();
    } else if(syncDBWithFirebase){
      console.log('syncing DB with firebase users');
      seed.syncDBWithFirebaseUsers();
    } else if(clearFirebaseUsers){
      console.log('clearing firebase');
      seed.clearFirebaseUsers();
    } else {
      console.log(
        'Must run with command line args to output the desired behavior. See package.json for a list of available args',
      );
    }
  } else if (process.env.NODE_ENV === 'production') {
    // Updates the db with NFL players, games, teams, etc, and then starts the update loop to keep our DB in sync
    dataSink.initialUpdate().then(() => dataSink.startUpdateLoop());
  }
}

export{ firebaseAdminAuth };


