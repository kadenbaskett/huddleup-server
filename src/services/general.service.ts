// File for re usable functions/services
import { DRAFT } from '@/config/huddleup_config';
import { spawn } from 'child_process';

export function calculateFantasyPoints(s, pprValue = 1)
{
    if (s) {
        let points = 0;
        points += -2 * s.interceptions_thrown;
        points += -2 * s.fumbles;
        points += 4 * s.pass_td;
        points += (4 / 100) * s.pass_yards;
        points += 0.1 * s.rec_yards;
        points += 6 * s.rec_td;
        points += pprValue * s.receptions; // PPR leagues
        points += 0.1 * s.rush_yards;
        points += 0.1 * s.rush_td;
        points += 2 * s.two_point_conversion_passes;
        points += 2 * s.two_point_conversion_receptions;
        points += 2 * s.two_point_conversion_runs;

        return points.toFixed(1);
    }

    return 0;
}


export function calculateSeasonLength(numPlayoffTeams)
{
    const totalWeeks = 18;
    const fantasyWeeks = totalWeeks - 1; // Skip the last week of regular season because sometimes teams rest starters
    const playoffWeeks = Math.floor(Math.log2(numPlayoffTeams));
    //const teamsOnBye = numPlayoffTeams - Math.pow(2, playoffWeeks);

    return fantasyWeeks - playoffWeeks;
}

// Requires an even number of teams
export function createMatchups(teams, numWeeks)
{
    const matchups = [];
    const middleIndex = teams.length / 2;
    const homeTeams = teams.slice(0, middleIndex);
    const awayTeams = teams.slice(middleIndex);
    let offset = 0;

    for(let week = 1; week <= numWeeks; week++)
    {
        for(let teamNum = 0; teamNum < homeTeams.length; teamNum++)
        {
            const awayIndex = (teamNum + offset) % awayTeams.length;

            const matchup = {
                week: week,
                home_team_id: homeTeams[teamNum].id,
                away_team_id: awayTeams[awayIndex].id,
            };

            matchups.push(matchup);
        }

        offset++;
    }

    return matchups;
}

// Generates a (mostly) unique port for 
// TODO when we have thousands of leagues this will have to change
export function getUniquePortForDraft(leagueId: number): number {
    return DRAFT.START_PORT + leagueId; 
}

export function startDraftChildProcess(leagueId: number, port: number): void
{
    console.log(`Starting up the draft on port ${port} for league ${leagueId}`);

    const child = process.env.NODE_ENV === 'production' ? spawn('cross-env', [ 'NODE_ENV=production', 'SERVICE=websocket', 'node dist/server.js', `${leagueId}`, `${port}` ], { shell: true }) : spawn('cross-env', [ 'NODE_ENV=development', 'SERVICE=websocket', 'nodemon', `${leagueId}`, `${port}` ], { shell: true });
      
    child.stdout.on('exit', (code, signal) => {
        console.log(`league(${leagueId}) draft process exited with code ${code} and signal ${signal}`);
    });

    child.stdout.on('data', (data) => {
        console.log(`league(${leagueId}) draft}: ${data}`);
    });

    child.stdout.on('error', (error) => {
        console.error(`league(${leagueId}) draft}: ${error}`);
    });

    child.on('exit', console.log.bind(console, 'exited'));
    child.on('close', console.log.bind(console, 'closed'));
}




