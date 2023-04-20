import App from '@/app';
import validateEnv from '@utils/validateEnv';
import DataSinkApp from './datasink/app';
import Seed from './datasink/seed';
import DatabaseRoute from './routes/database.route';
import { TaskManager } from './TaskManager/taskManager';
import admin from 'firebase-admin';
import { ENV, PROCESSES } from './config/huddleup_config';
import DatabaseService from './services/database.service';

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

let taskManager: TaskManager; 

if(process.env.SERVICE === PROCESSES.BACKEND)
{
    const routes = [ new DatabaseRoute() ];

    console.log('Starting up the REST API');

    const backendApp = new App(routes);
    backendApp.listen();
}
else if(process.env.SERVICE === PROCESSES.TASK_MANAGER)
{
  try
  {
    console.log('Starting up the task manager service');

    taskManager = new TaskManager();
    taskManager.start();
  }
  catch(e) {
    console.log(e);
  }
}
else if(process.env.SERVICE === PROCESSES.DATASINK)
{
  try {
    const dataSink = new DataSinkApp();

    // TODO better checking for correct params and messages back to user
    if (process.env.NODE_ENV === ENV.DEV) {

      const seed = new Seed();

      if (onlyClearDB) {
        // Clears the DB of fantasy related data - everything that we don't fetch from the SportsData.io API
        console.log('Clear DB of fantasy data only');
        const dbService = new DatabaseService();
        dbService.clearLeagueStuff();
      } else if (initAndSeed) {
        // Fills the DB will all NFL data from the SportsData.io API and seeds it with mock fantasy data (& some users)
        console.log('Init and seed');
        dataSink.initialUpdate().then(() => seed.seedDB());
      } else if (seedOnly) {
        // Only seeds DB with mock fantasy data. Must have initialized the DB with NFL data first
        console.log('Seed only');
        seed.seedDB();
      } else if (initOnly) {
        // Only fills DB with NFL Data from the SportsData.io API
        console.log('Init only');
        dataSink.initialUpdate();
      } else if (fillLeague) {
        // Fills a given league with mock users (and teams?)
        console.log('Filling league');

        const leagueId = args.length > 1 ? Number(args[1]) : null;

        if(!leagueId)
        {
          console.log('No league ID provided to fill league. First arg must be a league ID');
        }
        else {
          seed.fillLeague(Number(args[1]));
        }
      } else if (createEmptyLeague) {
        console.log('Creating an empty league');
        seed.createEmptyLeague();
      } else if (simulateDraft) {
        console.log('Simulating draft');

        const leagueId = args.length > 1 ? Number(args[1]) : null;

        if(!leagueId)
        {
          console.log('No league ID provided to simulate draft. First arg must be a league ID');
        }
        else {
          seed.simulateDraft(leagueId);
        }
      } else if (simulateMatchups) {
        console.log('Creating matchups');

        const leagueId = args.length > 1 ? Number(args[1]) : null;

        if(!leagueId)
        {
          console.log('No league ID provided to create matchups. First arg must be a league ID');
        }
        else {
          seed.simulateMatchups(leagueId);
        }
      } else if (simulateWeek) {
        console.log('Simulating week');

        const weekToSim = args.length > 1 ? Number(args[1]) : null;

        if(!weekToSim)
        {
          console.log('No league ID provided to create matchups. First arg must be a league ID');
        }
        else {
          seed.simulateWeek(weekToSim);
        }
      } else if (seedUsers){
        console.log('Seeding users');
        seed.createFirebaseUsers();
      } else if(syncDBWithFirebase){
        console.log('Syncing users in our DB with firebase users');
        seed.syncDBWithFirebaseUsers();
      } else if(clearFirebaseUsers){
        console.log('Clearing firebase users');
        seed.clearFirebaseUsers();
      } else {
        console.log(
          'Must run with command line args to output the desired behavior. See package.json for a list of available args',
        );
      }
    } else if (process.env.NODE_ENV === ENV.PROD) {
      // Updates the db with NFL players, games, teams, etc, and then starts the update loop to keep our DB in sync
      dataSink.initialUpdate().then(() => dataSink.startUpdateLoop());
    }
  }
  catch(e)
  {
    console.log('Data sink error: ', e);
  }
}

export{ firebaseAdminAuth };


