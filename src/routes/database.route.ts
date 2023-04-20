// Define API schemas in swagger

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - username
 *         - email
 *       properties:
 *         id:
 *           type: number
 *           description: The auto-generated id of the user
 *         username:
 *           type: string
 *           description: The user's username
 *         email:
 *           type: string
 *           description: Email of the user
 *       example:
 *         username: tinymoose68
 *         email: tinymoose68@gmail.com
 *     League:
 *       type: object
 *       required:
 *         - name
 *         - description
 *         - token
 *       properties:
 *         id:
 *           type: number
 *           description: Auto-generated id of league
 *         name:
 *           type: string
 *           description: The name of the league
 *         description:
 *           type: string
 *           description: Description of the league
 *         token:
 *           type: string
 *           description: Token others can use to join the league
 *         commissioner_id:
 *           type: number
 *           description: user id of the league commissioner
 *         settings_id:
 *           type: number
 *           desciption: Id of league settings
 *       example:
 *         id: 4
 *         name: Utah Grad's League
 *         description: League for UofU class of 2023
 *         token: 1Afgh5t
 *         commissioner_id: 32
 *         settings_id: 4
 *     CreateLeagueData:
 *       type: object
 *       required:
 *         - commissionerId
 *         - leagueName
 *         - numTeams
 *         - minPlayers
 *         - maxPlayers
 *         - leagueDescription
 *         - publicJoin
 *         - scoring
 *         - date
 *         - draftTime
 *       properties:
 *         commissionerId:
 *           type: number
 *           description: The id of the user that is the commissioner
 *         leagueName:
 *           type: string
 *           description: Name of the league
 *         numTeams:
 *           type: number
 *           description: Number of teams in the league
 *         minPlayers:
 *           type: number
 *           description: Minimum number of players per team
 *         maxPlayers:
 *           type: number
 *           description: Maximum number of players per team
 *         leagueDescription:
 *           type: string
 *           description: Description fo the league
 *         publicJoin:
 *           type: boolean
 *           description: Is the league publicly joinable
 *         scoring:
 *           type: string
 *           description: Scoring rules for the league
 *         date:
 *           type: string
 *           format: date
 *           description: Date of the league's draft
 *         draftTime:
 *           type: string
 *           format: date-time
 *           description: Time of the league's draft
 *       example:
 *         commissionerId: 1
 *         leagueName: Gridiron Giants
 *         numTeams: 10
 *         minPlayers: 3
 *         maxPlayers: 6
 *         leagueDescription: This is a really cool league!
 *         publicJoin: true
 *         scoring: PPR
 *         date: 2023-04-15
 *         draftTime: 12:30:00.000
 *     CreateTeamData:
 *       type: object
 *       required:
 *         - leagueId
 *         - teamOwnerId
 *         - teamName
 *       properties:
 *         leagueId:
 *           type: number
 *           description: Unique identifier of the league the team belongs to
 *         teamOwnerId:
 *           type: number
 *           description: User ID of the team owner
 *         teamName:
 *           type: string
 *           description: Name of team
 *       example:
 *         leagueId: 4
 *         teamOwnerId: 2
 *         teamName: Skull Crushers
 *     Team:
 *       type: object
 *       required:
 *         - id
 *         - name
 *         - league_id
 *         - team_settings_id
 *         - token
 *       properties:
 *         id:
 *           type: number
 *           description: Unique identifier of the team
 *         name:
 *           type: string
 *           description: Name of the team
 *         league_id:
 *           type: number
 *           description: Unique identifier of the league the team belongs to
 *         team_settings_id:
 *           type: number
 *           description: Unique identifier of the team settings
 *         token:
 *           type: number
 *           description: Unique team token
 *       example:
 *         id: 2
 *         name: Skull Crushers
 *         league_id: 3
 *         team_settings_id: 6
 *         token: 1ghtu28
 *     Roster:
 *       type: object
 *       required:
 *         - id
 *         - week
 *         - season
 *         - team_id
 *         - players
 *       properties:
 *         id:
 *           type: number
 *         week:
 *           type: number
 *         season:
 *           type: number
 *         team_id:
 *           type: number
 *         players:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               id:
 *                 type: number
 *               external_id:
 *                 type: number
 *               player_id:
 *                 type: number
 *               position:
 *                 type: number
 *               roster_id:
 *                 type: number
 *       example:
 *         id: 1
 *         week: 4
 *         season: 2023
 *         team_id: 5
 *         players:
 *           - id: 1
 *             external_id: 12345
 *             player_id: 54321
 *             position: 1
 *             roster_id: 1
 *           - id: 2
 *             external_id: 23456
 *             player_id: 65432
 *             position: 2
 *             roster_id: 1
 *           - id: 3
 *             external_id: 34567
 *             player_id: 76543
 *             position: 3
 *             roster_id: 1
 *     News:
 *       type: object
 *       required:
 *         - id
 *         - external_id
 *         - updated_date
 *         - time_posted
 *         - title
 *         - content
 *         - external_player_id
 *         - external_team_id
 *         - source
 *         - source_url
 *       properties:
 *         id:
 *           type: number
 *         external_id:
 *           type: number
 *         updated_date:
 *           type: string
 *           format: date-time
 *         time_posted:
 *           type: string
 *         title:
 *           type: string
 *         content:
 *           type: string
 *         external_player_id:
 *           type: number
 *         external_team_id:
 *           type: number
 *         source:
 *           type: string
 *         source_url:
 *           type: string
 *       example:
 *         - id: 1
 *           external_id: 160325
 *           updated_date: "2023-04-08T05:28:11"
 *           time_posted: "yesterday"
 *           title: "Joe Douglas Assures Fans Aaron Rodgers Will Be A Jet"
 *           content: "Green Bay Packers quarterback Aaron Rodgers remains with the team, even after the signal-caller expressed his intention to play for the Jets during an appearance on \"The Pat McAfee Show\" nearly a month ago. However, there hasn't been any movement since then, with Rodgers remaining a member of the Packers. But things appear to still be in the works, as seemingly indicated by Jets general manager Joe Douglas at a WFAN fan event on Friday night. When asked by Boomer Esiason when Rodgers was \"coming\" to New York, Douglas replied, \"He's gonna be here.\" While the response got a pop from the crowd in attendance, many aren't as optimistic. Nevertheless, there should be more to this story, especially since Douglas' answer could be misconstrued as tampering."
 *           external_player_id: 2593
 *           external_team_id: 12
 *           source: "Hard Rock Sportsbook"
 *           source_url: "https://twitter.com/HardRockSB/status/1644533815157637120?s=20"
 *         - id: 2
 *           external_id: 160316
 *           updated_date: "2023-04-07T14:59:25"
 *           time_posted: "2 days ago"
 *           title: "Chargers Re-Sign Will Clapp"
 *           content: "The Los Angeles Chargers re-signed offensive lineman Will Clapp to an undisclosed deal on Thursday. Clapp will return to LA for a second season after playing in 17 regular season games (three starts) for the Bolts last year. He was originally a seventh-round pick by the New Orleans Saints in 2018 out of Louisiana State University. The 27-year-old will be the backup to Corey Linsley at center once again in 2023. In his five NFL seasons, Clapp has played in 51 games and made only 10 starts."
 *           external_player_id: 20072
 *           external_team_id: 29
 *           source: "ESPN.com - Field Yates"
 *           source_url: "https://twitter.com/FieldYates/status/1644075422877876229"
 *     Timeframe:
 *       type: object
 *       required:
 *         - id
 *         - week
 *         - season
 *         - type
 *         - has_started
 *         - has_ended
 *       properties:
 *         id:
 *           type: number
 *           example: 502
 *         week:
 *           type: number
 *           example: 6
 *         season:
 *           type: number
 *           example: 2022
 *         type:
 *           type: number
 *           example: 1
 *         has_started:
 *           type: boolean
 *           example: true
 *         has_ended:
 *            type: boolean
 *            example: false
 *     UserToTeam:
 *       type: object
 *       required:
 *         - id
 *         - user_id
 *         - team_id
 *         - is_captain
 *       properties:
 *         id:
 *           type: number
 *           example: 93
 *         user_id:
 *           type: number
 *           example: 16
 *         team_id:
 *           type: number
 *           example: 4
 *         is_captain:
 *           type: boolean
 *           example: false
 *     PlayerToRoster:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: The unique identifier of the PlayerToRoster object.
 *         external_id:
 *           type: integer
 *           description: The external identifier of the player.
 *         player_id:
 *           type: integer
 *           description: The unique identifier of the player in the system.
 *         position:
 *           type: string
 *           description: The position of the player on the roster.
 *           example: "WR"
 *         roster_id:
 *           type: integer
 *           description: The unique identifier of the roster the player belongs to.
 *       example:
 *         id: 4
 *         external_id: 17975
 *         player_id: 57
 *         position: "WR"
 *         roster_id: 1
 */

import { Router } from 'express';
import { Routes } from '@interfaces/routes.interface';
import DatabaseController from '@controllers/database.controller';

class DatabaseRoute implements Routes {
  public path = '/database';
  public router = Router();
  public controller = new DatabaseController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    //************* POST ROUTES  **************/

    /**
     * @swagger
     * tags:
     *   name: User
     *   description: User endpoints
     * /database/user:
     *   post:
     *     summary: Create a new user
     *     tags: [User]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/User'
     *     responses:
     *       201:
     *         description: The created user.
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/User'
     *       400:
     *         description: Bad request. Unable to create user.
     *       500:
     *         description: Internal server error
     *
     */
    this.router.post(`${this.path}/user`, this.controller.createUser);

    /**
     * @swagger
     * tags:
     *   name: League
     *   description: League endpoints
     * /database/league:
     *   post:
     *     summary: Create a new league
     *     tags: [League]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/CreateLeagueData'
     *     responses:
     *       201:
     *         description: The created league.
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/League'
     *       400:
     *         description: Bad request. Unable to create league.
     *       500:
     *         description: Internal server error
     */
    this.router.post(`${this.path}/league`, this.controller.createLeague);

    /**
     * @swagger
     * tags:
     *   name: Team
     *   description: Team endpoints
     * /database/team:
     *   post:
     *     summary: Create a new team
     *     tags: [Team]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/CreateTeamData'
     *     responses:
     *       201:
     *         description: The created team.
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Team'
     *       400:
     *         description: Bad request. Unable to create team.
     *       500:
     *         description: Internal server error
     */
    this.router.post(`${this.path}/team`, this.controller.createTeam);

    /**
     * @swagger
     * /database/deleteTeam:
     *   post:
     *     summary: Deletes a team from a league
     *     tags: [Team]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               managers:
     *                 type: object
     *                 properties:
     *                   team_id:
     *                     type: number
     *                     description: Unique identifier for the league
     *                     example: 4
     *                   user_id:
     *                     type: number
     *                     description: Unique identifier of the manager user
     *                     example: 8
     *               id:
     *                 type: number
     *                 description: Unique identifier of the team to delete
     *                 example: 4
     *               league_id:
     *                 type: number
     *                 description: Unique identifier of the league the team is in
     *                 example: 2
     *             required:
     *               - managers
     *               - id
     *               - league_id
     *     responses:
     *       200:
     *         description: Team deleted successfully.
     *       400:
     *         description: Bad request. Unable to delete team.
     *       500:
     *         description: Internal server error
     */
    this.router.post(`${this.path}/deleteTeam`, this.controller.deleteTeam);

    /**
     * @swagger
     * /database/userToTeam:
     *   post:
     *     summary: Assigns a user to a team
     *     tags: [Team]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               user:
     *                 type: object
     *                 properties:
     *                   userInfo:
     *                     type: object
     *                     properties:
     *                       id:
     *                          type: number
     *                          example: 16
     *               team:
     *                 type: object
     *                 properties:
     *                   id:
     *                     type: number
     *                     example: 4
     *     responses:
     *       200:
     *         description: User successfully added to team.
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/UserToTeam'
     *       400:
     *         description: Bad request. Unable to add user to team.
     *       500:
     *         description: Internal server error
     */
    this.router.post(`${this.path}/userToTeam`, this.controller.userToTeam);

    /**
     * @swagger
     * /database/removeUserFromTeam:
     *   post:
     *     summary: Removes a user to a team
     *     tags: [Team]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               user:
     *                 type: object
     *                 properties:
     *                   user_id:
     *                     type: number
     *                     example: 16
     *               userTeam:
     *                 type: object
     *                 properties:
     *                   id:
     *                     type: number
     *                     example: 4
     *     responses:
     *       200:
     *         description: User successfully removed from team.
     *       400:
     *         description: Bad request. Unable to remove user from team.
     *       500:
     *         description: Internal server error
     */
    this.router.post(`${this.path}/removeUserFromTeam`, this.controller.removeUserFromTeam);

    /**
     * @swagger
     * tags:
     *   name: Roster
     *   description: Roster endpoints
     * /database/roster/addDropPlayer:
     *   post:
     *     summary: Drop an existing player and add a new player to roster
     *     tags: [Roster]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               addPlayerId:
     *                 type: number
     *                 description: Unique identifier of the player to add
     *                 example: 6
     *               addPlayerExternalId:
     *                 type: number
     *                 description: External unique identifier of the player to add
     *                 example: 1
     *               dropPlayerIds:
     *                 type: number
     *                 description: Unique identifier of the player to drop
     *                 example: 5
     *               rosterId:
     *                 type: number
     *                 description: Unique identifier of the roster to perform the add/drop on
     *                 example: 7
     *               teamId:
     *                 type: number
     *                 description: Unique identifier of the team performing the add/drop
     *                 example: 3
     *               userId:
     *                 type: number
     *                 description: Unique idenfitifier of the user that created the transaction
     *                 example: 2
     *               week:
     *                 type: number
     *                 description: Current week number to be recorded
     *                 example: 6
     *     responses:
     *       200:
     *         description: User successfully removed from team.
     *       400:
     *         description: Bad request. Unable to add and drop players.
     *       500:
     *         description: Internal server error
     */
    this.router.post(`${this.path}/roster/addDropPlayer`, this.controller.addDropPlayer);

    /**
     * @swagger
     * /database/roster/addPlayer:
     *   post:
     *     summary: Add a player to roster
     *     tags: [Roster]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               addPlayerId:
     *                 type: number
     *                 description: Unique identifier of the player to add
     *                 example: 4
     *               addPlayerExternalId:
     *                 type: number
     *                 description: External unique identifier of the player to add
     *                 example: 1000
     *               rosterId:
     *                 type: number
     *                 description: Unique identifier of the roster to perform the add on
     *                 example: 5
     *               teamId:
     *                 type: number
     *                 description: Unique identifier of the team performing the add
     *                 example: 3
     *               userId:
     *                 type: number
     *                 description: Unique idenfitifier of the user that created the transaction
     *                 example: 6
     *               week:
     *                 type: number
     *                 description: Current week number to be recorded
     *                 example: 5
     *     responses:
     *       200:
     *         description: Player successfully added to roster.
     *       400:
     *         description: Bad request. Unable to add player.
     *       500:
     *         description: Internal server error
     */
    this.router.post(`${this.path}/roster/addPlayer`, this.controller.addPlayer);

    /**
     * @swagger
     * /database/roster/dropPlayer:
     *   post:
     *     summary: Drop a player from roster
     *     tags: [Roster]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               playerId:
     *                 type: number
     *                 description: Unique identifier of the player to drop
     *                 example: 4
     *               rosterId:
     *                 type: number
     *                 description: Unique identifier of the roster to perform the drop on
     *                 example: 5
     *               teamId:
     *                 type: number
     *                 description: Unique identifier of the team performing the drop
     *                 example: 3
     *               userId:
     *                 type: number
     *                 description: Unique idenfitifier of the user that created the transaction
     *                 example: 6
     *               week:
     *                 type: number
     *                 description: Current week number to be recorded
     *                 example: 5
     *     responses:
     *       200:
     *         description: Player successfully dropped from roster.
     *       400:
     *         description: Bad request. Unable to drop player.
     *       500:
     *         description: Internal server error
     */
    this.router.post(`${this.path}/roster/dropPlayer`, this.controller.dropPlayer);

    /**
     * @swagger
     * /database/roster/proposeTrade:
     *   post:
     *     summary: Propose a trade
     *     tags: [Roster]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               sendPlayerIds:
     *                 type: number
     *                 description: Unique identifier of the player being released
     *                 example: 4
     *               recPlayerIds:
     *                 type: number
     *                 description: Unique identifier of the player being received
     *                 example: 5
     *               proposeRosterId:
     *                 type: number
     *                 description: Unique identifier of the propoing team's roster
     *                 example: 3
     *               relatedRosterId:
     *                 type: number
     *                 description: Unique idenfitifier of the related team's roster
     *                 example: 6
     *               proposeTeamId:
     *                 type: number
     *                 description: Unique identifier of the proposing team
     *                 example: 5
     *               relatedTeamId:
     *                 type: number
     *                 description: Unique identifier of the related team
     *                 example: 2
     *               userId:
     *                 type: number
     *                 description: Unique identifier of the user proposing the trade
     *                 example: 11
     *               week:
     *                 type: number
     *                 description: Current week to be recorded
     *                 example: 11
     *     responses:
     *       200:
     *         description: Trade successfully proposed.
     *       400:
     *         description: Bad request. Unable to propose trade.
     *       500:
     *         description: Internal server error
     */
    this.router.post(`${this.path}/roster/proposeTrade`, this.controller.proposeTrade);

    /**
     * @swagger
     * /database/roster/editLineup:
     *   post:
     *     summary: Edit current lineup
     *     tags: [Roster]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               rosterPlayerId:
     *                 type: number
     *                 description: Unique identifier of the player being released
     *                 example: 4
     *               newPosition:
     *                 type: string
     *                 description: Unique identifier of the player being received
     *                 example: WR
     *     responses:
     *       200:
     *         description: Lineup edited successfully.
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/PlayerToRoster'
     *       400:
     *         description: Bad request. Unable to edit lineup.
     *       500:
     *         description: Internal server error
     */
    this.router.post(`${this.path}/roster/editLineup`, this.controller.editLineup);

        /**
     * @swagger
     * tags:
     *   name: Transaction
     *   description: Transaction endpoints
     * /database/transaction/action:
     *   post:
     *     summary: Execute transaction action
     *     tags: [Transaction]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               action:
     *                 type: string
     *                 description: Action to be executed
     *                 example: Approve
     *               transactionId:
     *                 type: number
     *                 description: Unique identifier of the transaction being executed
     *                 example: 2
     *               userId:
     *                 type: number
     *                 description: Unique identifier of the user executing the transaction action
     *                 example: 3
     *     responses:
     *       200:
     *         description: Transaction action successful executed.
     *       400:
     *         description: Bad request. Unable to execute transaction action.
     *       500:
     *         description: Internal server error
     */
    this.router.post(`${this.path}/transaction/action`, this.controller.transactionAction);

    /**
     * @swagger
     * /database/league/fill:
     *   post:
     *     summary: Fills a league with teams and team managers
     *     tags: [League]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               leagueId:
     *                 type: number
     *                 description: Unique identifier for the league
     *                 example: 4
     *             required:
     *               - leagueId
     *     responses:
     *       200:
     *         description: League filled successfully.
     *       400:
     *         description: Bad request. Unable to fill league.
     *       500:
     *         description: Internal server error
     */
    this.router.post(`${this.path}/league/fill`, this.controller.fillLeague);
    // this.router.post(`${this.path}/league/startDraft`, this.controller.startDraft);

    //************* GET ROUTES  **************//

    // TODO: add swagger docs
    this.router.get(`${this.path}/players`, this.controller.getAllPlayersDetails);
    // TODO: add swagger docs
    this.router.get(
      `${this.path}/players/:playerId(\\d+)`,
      this.controller.getIndividualPlayerDetails,
    );

    // TODO: swagger doc
    this.router.get(
      `${this.path}/players/stats/:playerId(\\d+)`,
      this.controller.getIndividualPlayerStats,
    );

    // TODO: add swagger docs
    this.router.get(`${this.path}/players/stats`, this.controller.getAllPlayersStats);

    /**
     * @swagger
     * /database/user/{email}:
     *   get:
     *     summary: Get user info by email
     *     tags: [User]
     *     parameters:
     *       - in: path
     *         name: email
     *         schema:
     *           type: string
     *         required: true
     *         description: Email of the user to get
     *     responses:
     *       200:
     *         description: The requested user's info.
     *         content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/User'
     *       404:
     *         description: User not found
     *       500:
     *         description: Internal server error
     *
     */
    this.router.get(`${this.path}/user/:email`, this.controller.getUser);

    /**
     * @swagger
     * /database/players/league/{leagueId}:
     *   get:
     *     summary: Get players of a league
     *     tags: [Player]
     *     parameters:
     *       - in: path
     *         name: leagueId
     *         schema:
     *           type: number
     *         required: true
     *         description: Unique identifier of the league to get the players of
     *     responses:
     *       200:
     *         description: The league's players.
     *       400:
     *         description: Bad Request. Unable to get league's players
     *       500:
     *         description: Internal server error
     *
     */
    this.router.get(
      `${this.path}/players/league/:leagueId(\\d+)`,
      this.controller.getLeaguePlayers,
    );

    /**
     * @swagger
     * tags:
     *   name: Timeframe
     *   description: Timeframe endpoints
     * /database/timeframe:
     *   get:
     *     summary: Gets timeframe
     *     tags: [Timeframe]
     *     responses:
     *       200:
     *          description: Timeframe
     *          content:
     *             application/json:
     *               schema:
     *                 $ref: '#/components/schemas/Timeframe'
     *       400:
     *         description: Bad request. Unable to get timeframe.
     *       500:
     *         description: Internal server error
     */
    this.router.get(`${this.path}/timeframe`, this.controller.getTimeframe);

    /**
     * @swagger
     * tags:
     *   name: News
     *   description: News endpoints
     * /database/news/{amount}:
     *   get:
     *     summary: Gets news
     *     tags: [News]
     *     parameters:
     *       - in: path
     *         name: amount
     *         schema:
     *           type: number
     *           required: true
     *           description: Amount of news to get
     *     responses:
     *       200:
     *          description: The amount of news specified
     *          content:
     *             application/json:
     *               schema:
     *                 $ref: '#/components/schemas/News'
     *       400:
     *         description: Bad request. Unable to get news.
     *       500:
     *         description: Internal server error
     */
    this.router.get(`${this.path}/news/:amount(\\d+)`, this.controller.getNews);

    /**
     * @swagger
     * /database/leagues/user/{userId}:
     *   get:
     *     summary: Gets the leagues of a user
     *     tags: [League]
     *     parameters:
     *       - in: path
     *         name: userId
     *         schema:
     *           type: number
     *           required: true
     *           description: Unique identifier of the user to get the leagues of
     *     responses:
     *       200:
     *         description: List of user's leagues including teams and settings.
     *       400:
     *         description: Bad request. Unable to get user's leagues.
     *       500:
     *         description: Internal server error
     */
    this.router.get(`${this.path}/leagues/user/:userId(\\d+)`, this.controller.getUserLeagues);

    /**
     * @swagger
     * /database/leagues/public:
     *   get:
     *     summary: Gets public leagues
     *     tags: [League]
     *     responses:
     *       200:
     *         description: List of public leagues including teams and settings.
     *       400:
     *         description: Bad request. Unable to get public leagues.
     *       500:
     *         description: Internal server error
     */
    this.router.get(`${this.path}/leagues/public`, this.controller.getPublicLeagues);

    /**
     * @swagger
     * /database/leagues/private:
     *   get:
     *     summary: Gets private leagues
     *     tags: [League]
     *     responses:
     *       200:
     *         description: List of private leagues including teams and settings.
     *       400:
     *         description: Bad request. Unable to get private leagues.
     *       500:
     *         description: Internal server error
     */
    this.router.get(`${this.path}/leagues/private`, this.controller.getPrivateLeagues);

    /**
     * @swagger
     * /database/league/{leagueId}:
     *   get:
     *     summary: Gets the leagues info
     *     tags: [League]
     *     parameters:
     *       - in: path
     *         name: leagueId
     *         schema:
     *           type: number
     *           required: true
     *           description: Unique identifier of the league to get info for
     *     responses:
     *       200:
     *         description: The league's info.
     *       400:
     *         description: Bad request. Unable to get league info.
     *       500:
     *         description: Internal server error
     */
    this.router.get(`${this.path}/league/:leagueId(\\d+)`, this.controller.getLeagueInfo);

    /**
     * @swagger
     * /database/teams/user/{userId}:
     *   get:
     *     summary: Gets the teams of a user
     *     tags: [Team]
     *     parameters:
     *       - in: path
     *         name: userId
     *         schema:
     *           type: number
     *           required: true
     *           description: Unique identifier of the user to get the teams of
     *     responses:
     *       200:
     *         description: List of user's teams including leagues and rosters.
     *       400:
     *         description: Bad request. Unable to get user's teams.
     *       500:
     *         description: Internal server error
     */
    this.router.get(`${this.path}/teams/user/:userId(\\d+)`, this.controller.getUserTeams);

       /**
     * @swagger
     * /database/teams/roster/{teamId}:
     *   get:
     *     summary: Gets the team's current roster
     *     tags: [Team]
     *     parameters:
     *       - in: path
     *         name: teamId
     *         schema:
     *           type: number
     *           required: true
     *           description: Unique identifier of the team to get the current roster for
     *     responses:
     *       200:
     *          description: The team's current roster
     *          content:
     *             application/json:
     *               schema:
     *                 $ref: '#/components/schemas/Roster'
     *       400:
     *         description: Bad request. Unable to get team's current roster.
     *       500:
     *         description: Internal server error
     */
    this.router.get(
      `${this.path}/teams/roster/:teamId(\\d+)`,
      this.controller.getCurrentTeamRoster,
    );

    /**
     * @swagger
     * /database/teams/roster/{teamId}/{week}:
     *   get:
     *     summary: Gets the team's roster of a specific week
     *     tags: [Team]
     *     parameters:
     *       - in: path
     *         name: teamId
     *         schema:
     *           type: number
     *           required: true
     *           description: Unique identifier of the team to get the roster for
     *       - in: path
     *         name: week
     *         schema:
     *            type: number
     *            required: true
     *            description: The week number for which to get the roster
     *     responses:
     *       200:
     *          description: The team's roster from specified week
     *          content:
     *             application/json:
     *               schema:
     *                 $ref: '#/components/schemas/Roster'
     *       400:
     *         description: Bad request. Unable to get team's roster.
     *       500:
     *         description: Internal server error
     */
    this.router.get(`${this.path}/teams/roster/:teamId(\\d+)/:week`, this.controller.getTeamRoster);

    /**
     * @swagger
     * tags:
     *   name: Draft
     *   description: Draft endpoints
     * /database/league/getDraftSocket/{leagueId}:
     *   get:
     *     summary: Gets the port of the league's draft socket
     *     tags: [Draft]
     *     parameters:
     *       - in: path
     *         name: leagueId
     *         schema:
     *           type: number
     *           required: true
     *           description: Unique identifier of the league of which to get the draft socket's port
     *     responses:
     *       200:
     *         description: The port the draft socket is hosting on
     *         content:
     *           application/json:
     *             schema:
     *               type: number
     *               description: Port of draft websocket
     *               example: 49155
     *       400:
     *         description: Bad request. Unable to get user's teams.
     *       500:
     *         description: Internal server error
     */
    this.router.get(
      `${this.path}/league/getDraftSocket/:leagueId(\\d+)`,
      this.controller.getDraftPort,
    );
  }
}

export default DatabaseRoute;
