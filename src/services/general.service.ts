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

export function calculateMatchupResults(teams, matchups, currentWeek) {
  const results = [];

  for (let m of matchups) {
    if (m.week <= currentWeek) {
      const homeTeam = teams.find((t) => t.id === m.home_team_id);
      const awayTeam = teams.find((t) => t.id === m.away_team_id);

      const homeRoster = homeTeam.rosters.find((r) => r.week === m.week);
      const awayRoster = awayTeam.rosters.find((r) => r.week === m.week);

      let homeScore = 0;
      for (const p of homeRoster.players) {
        const pgs = p.player.player_game_stats.find((pgs) => pgs.game.week === m.week);
        homeScore += Number(calculateFantasyPoints(pgs));
      }

      let awayScore = 0;
      for (const p of awayRoster.players) {
        const pgs = p.player.player_game_stats.find((pgs) => pgs.game.week === m.week);
        awayScore += Number(calculateFantasyPoints(pgs));
      }

      m = {
        ...m,
        homeScore,
        awayScore,
      };

      results.push(m);
    }
  }

  return results;
}

export function calculateStandings(league, currentWeek) {
  const matchupResults = calculateMatchupResults(league.teams, league.matchups, currentWeek);
  const teams = league.teams.map((t) => {
    return {
      ...t,
      league,
      wins: 0,
      losses: 0,
    };
  });

  for (const m of matchupResults) {
    const winnerId = m.homeScore > m.awayScore ? m.home_team_id : m.away_team_id;
    const loserId = m.homeScore > m.awayScore ? m.away_team_id : m.home_team_id;
    const winnerIndex = teams.findIndex((t) => t.id === winnerId);
    const loserIndex = teams.findIndex((t) => t.id === loserId);

    teams[winnerIndex].wins++;
    teams[loserIndex].losses++;
  }

  return teams.sort((teamOne, teamTwo) => teamTwo.wins - teamOne.wins);
}

export function firstPlayoffWeek()
{
    return SEASON.FINAL_SEASON_WEEK + 1;
}

export function expectedNumberOfPlayoffMatchups()
{
    return Math.log2(SEASON.NUM_PLAYOFF_TEAMS);
}

// League should be with info
export function getPlayoffMatchups(league, week: number, previousWeekPlayoffMatchups)
{
    if(week === SEASON.FINAL_SEASON_WEEK + 1)
    {
        // if its the first week of playoffs
        const standings = calculateStandings(league, SEASON.FINAL_SEASON_WEEK);
        const matchups = [
            {
                week,
                home_team_id: standings[0].id,
                away_team_id: standings[3].id,
            },
            {
                week,
                home_team_id: standings[1].id,
                away_team_id: standings[2].id,
            },
        ];
        
        return matchups;
    }
    else {
        const roundResults = calculateMatchupResults(league.teams, previousWeekPlayoffMatchups, week);
        console.log(roundResults);
        const mOneWinnerId = roundResults[0].homeScore > roundResults[1].awayScore ? roundResults[0].home_team_id : roundResults[0].away_team_id;
        const mTwoWinnerId = roundResults[1].homeScore > roundResults[1].awayScore ? roundResults[1].home_team_id : roundResults[1].away_team_id;

        const matchups = [
            {
                week,
                home_team_id: mOneWinnerId,
                away_team_id: mTwoWinnerId,
            },
        ];
        
        return matchups;
    }    
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




