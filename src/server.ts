import App from '@/app';
import validateEnv from '@utils/validateEnv';
import DataSinkApp from './datasink/app';
import Seed from './datasink/seed';
import DatabaseRoute from './routes/database.route';
import DraftSocketServer from './draft/draftSocketServer';

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

let draftSocketServer;

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

    if(!leagueId)
    {
      throw new Error('Provide a league id to start the draft for');
    }

    console.log('Starting up draft websocket for league ', leagueId);
    draftSocketServer = new DraftSocketServer(leagueId);
    draftSocketServer.start();
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
      const leagueId = Number(args[1]);
      const weekToSim = Number(args[2]);
      seed.simulateWeek(leagueId, weekToSim); // leagueID, week number
    } else if (seedUsers){
      console.log('seeding users');
      seed.createFirebaseUsers();
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


