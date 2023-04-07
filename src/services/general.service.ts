// File for re usable functions/services

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




