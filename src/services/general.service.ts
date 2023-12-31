import { DRAFT, SCORING, SEASON } from '@/config/huddleup_config';
import { spawn } from 'child_process';


/* 
 *  This file is supposed to be for re useable functions that DO NOT interact with the database
 */

export const hoursToMilliseconds = (hours) => {
  return hours * 60 * 60 * 1000;
};

export function calculateFantasyPoints(s, pprValue = 1)
{
    if (s) {
        let points = 0;
        points += SCORING.INT_THROWN * s.interceptions_thrown;
        points += SCORING.FUMBLES * s.fumbles;
        points += SCORING.PASS_TD * s.pass_td;
        points += SCORING.PASS_YARDS * s.pass_yards;
        points += SCORING.REC_YARDS * s.rec_yards;
        points += SCORING.REC_TD * s.rec_td;
        points += pprValue * s.receptions; // PPR leagues
        points += SCORING.RUSH_YARDS * s.rush_yards;
        points += SCORING.RUSH_TD * s.rush_td;
        points += SCORING.TWO_PNT_CONV_PASS * s.two_point_conversion_passes;
        points += SCORING.TWO_PNT_CONV_REC * s.two_point_conversion_receptions;
        points += SCORING.TWO_PNT_CONV_RUN * s.two_point_conversion_runs;

        return points.toFixed(1);
    }

    return 0;
}


export function calculateSeasonLength()
{
    const playoffWeeks = Math.floor(Math.log2(SEASON.NUM_PLAYOFF_TEAMS));
    return SEASON.FINAL_PLAYOFF_WEEK - playoffWeeks;
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
        console.log(`league(${leagueId}) draft data: ${data}`);
    });

    child.stdout.on('error', (error) => {
        console.error(`league(${leagueId}) draft error: ${error}`);
    });

    child.on('exit', console.log.bind(console, 'exited'));
    child.on('close', console.log.bind(console, 'closed'));
}




