import App from '@/app';
import AuthRoute from '@routes/auth.route';
import IndexRoute from '@routes/index.route';
import UsersRoute from '@routes/users.route';
import validateEnv from '@utils/validateEnv';
import DataSinkApp from './datasink/app';
import Seed from './datasink/seed';
import DatabaseRoute from './routes/database.route';

validateEnv();

const args = process.argv.slice(2);

const runBackend = args.includes('backend');
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


if(process.env.SERVICE === 'backend')
{
    const routes = [
        new IndexRoute(),
        new UsersRoute(),
        new AuthRoute(),
        new DatabaseRoute(),
    ];

    const backendApp = new App(routes);

    backendApp.listen();
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


