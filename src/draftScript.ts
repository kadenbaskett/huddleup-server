import DraftSocketServer from './draft/draftSocketServer';

console.log('Starting up draft websocket');
// const args = process.argv.slice(2);
// console.log(process.argv);
// console.log(args);
// const leagueId = Number(args[1]);
const draftSocketServer = new DraftSocketServer(21);
draftSocketServer.start();