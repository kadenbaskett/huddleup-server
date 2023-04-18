import { PrismaClient, RosterPlayer, Timeframe, Transaction, TransactionPlayer } from '@prisma/client';
import DatabaseService from './database.service';

class TransactionService {
  client: PrismaClient;
  public databaseService: DatabaseService;

  constructor()
  {
    this.client = new PrismaClient();
    this.databaseService = new DatabaseService();
  }

  public async executeTransactionAction(action, transactionId, userId): Promise<boolean> {
    await this.client.transactionAction.create({
      data: {
        transaction_id: transactionId,
        user_id: userId,
        action_date: new Date(),
        action_type: action,
      },
    });
    const transaction = await this.client.transaction.findFirst({
      where: { id: transactionId },
      include: {
        players: {
          include: {
            player: {
              include: {
                roster_players: {
                  include: {
                    roster: true,
                  },
                },
              },
            },
          },
        },
      },
    });
    
    if (transaction.type !== 'Trade') {
      await this.client.transaction.update({
        where: { id: transactionId },
        data: {
          status: action === 'Reject' ? 'Rejected' : 'Complete',
        },
      });
    } else {
      // has the trade been approved by the proposing team?
      if (transaction.status === 'Pending') {
        await this.client.transaction.update({
          where: { id: transactionId },
          data: {
            status: action === 'Reject' ? 'Rejected' : 'SentToRelatedTeam',
          },
        });
      } else if (transaction.status === 'SentToRelatedTeam') {
        await this.client.transaction.update({
          where: { id: transactionId },
          data: {
            status: action === 'Reject' ? 'Rejected' : 'Complete',
          },
        });
      }
    }
    if(!transaction) return false;
    try {
        const timeframe: Timeframe = await this.databaseService.getTimeframe();
        const proposingTeamRoster = await this.client.roster.findFirst({
          where: {
            team_id: transaction.proposing_team_id,
            week: timeframe.week,
          },
        });
        const realtedTeamRoster = await this.client.roster.findFirst({
          where: {
            team_id: transaction.related_team_id,
            week: timeframe.week,
          },
        });
        const proposingTeamRosterId = proposingTeamRoster.id;
        const relatedTeamRosterId = realtedTeamRoster.id;

        if(transaction.type === 'Drop' && action === 'Approve') {
          transaction.players.forEach(async (transactionPlayer) => {
          await this.executePlayerDrop(transactionPlayer.player.id, proposingTeamRosterId);
        });
      } else if (transaction.type === 'Add' && action === 'Approve') {
        transaction.players.forEach(async (transactionPlayer) => {
          await this.executePlayerAdd(transactionPlayer.player.id, proposingTeamRosterId, transactionPlayer.player.external_id);
        });
      } else if (transaction.type === 'AddDrop' && action === 'Approve') {
        // get player being added
        const addingPlayer = transaction.players.find((transactionPlayer) => {
          return transactionPlayer.joins_proposing_team === true;
        }).player;
        // get players getting dropped
        const droppingPlayers = transaction.players.filter((transactionPlayer) => {
          return transactionPlayer.joins_proposing_team === false;
        });
        // get roster_id for proposing team on current week
        if (!proposingTeamRoster) return false;

        const droppingPlayerIds: number[] = droppingPlayers.map((transactionPlayer) => {return transactionPlayer.player_id;});
        // Execute
        await this.executePlayerAddDrop(addingPlayer.id, addingPlayer.external_id, droppingPlayerIds, proposingTeamRoster.id);
      }
      // else if (transaction.type === 'Trade' && transaction.status === 'Pending' && action === 'Approve') {
      //   console.log('sending to related team');
      //   await this.sendTradeToOtherTeam(transactionId);
      // }
      else if (transaction.type === 'Trade' && transaction.status === 'SentToRelatedTeam' && action === 'Approve') {
        await this.completeTrade(transactionId, proposingTeamRosterId, relatedTeamRosterId);
      }
      // TODO: reject all pending transactions involving dropped players
      return true;
    } catch(e) {
      return false;
    }
  }

  public async executePlayerDrop(dropPlayerId, rosterId) {
    // Update the roster player
    const rp: RosterPlayer = await this.client.rosterPlayer.delete({
      where: {
        player_id_roster_id: {
          player_id: dropPlayerId,
          roster_id: rosterId,
          },
      },
    });
    return rp;
  }

  public async executePlayerAdd(addPlayerId, rosterId, externalPlayerId) {
    // Update the roster player
    const rp: RosterPlayer = await this.client.rosterPlayer.create({
      data: {
          external_id: externalPlayerId,
          position: 'BE',
          roster_id: rosterId,
          player_id: addPlayerId,
      },
    });

    return rp;
  }

  public async executePlayerAddDrop(addPlayerId, addPlayerExternalId, dropPlayerIds, rosterId ) {

    await this.client.rosterPlayer.create({
        data: {
            external_id: addPlayerExternalId,
            position: 'BE',
            roster_id: rosterId,
            player_id: addPlayerId,
        },
    });

    // For each player selected to drop, create the transaction player and update the roster player
    for(const id of dropPlayerIds)
    {
        // Update the roster player
        await this.client.rosterPlayer.delete({
            where: {
                player_id_roster_id: {
                    player_id: id,
                    roster_id: rosterId,
                },
            },
        });
    }

    return;
  }

  public async sendTradeToOtherTeam(transactionId: number) {
    try {
      await this.client.transaction.update({
        where: {
          id: transactionId,
        },
        data: {
          status: 'SentToRelatedTeam',
        },
      });
      return;
    } catch (e) {
      return null;
    }
  }

  public async completeTrade(transactionId: number, proposingTeamRosterId: number, relatedTeamRosterId: number)
    {
        try {
            const transaction: Transaction = await this.client.transaction.findFirst({
                where: {
                    id: transactionId,
                },
            });
            const tPlayers: TransactionPlayer[] = await this.client.transactionPlayer.findMany({
                where: {
                    transaction_id: transactionId,
                },
            });

            const playerIds: number[] = tPlayers.map((tp) => tp.player_id);
            const rosterIds: number[] = [];
            rosterIds.push(proposingTeamRosterId);
            rosterIds.push(relatedTeamRosterId);
            const rosterPlayers: RosterPlayer[] = await this.client.rosterPlayer.findMany({
                where: {
                    roster: {
                        week: transaction.week,
                    },
                    player_id: {
                        in: playerIds,
                    },
                    roster_id:
                    {
                      in: rosterIds,
                    },
                },
            });
            // Complete the trade for the current week - not necessarily when the transaction was proposed
            const timeframe: Timeframe = await this.databaseService.getTimeframe();
            for(const rp of rosterPlayers)
            {
                const transactionPlayer = tPlayers.find((tp) => tp.player_id === rp.player_id && tp.transaction_id === transactionId);

                // add to new roster
                const newTeamId = transactionPlayer.joins_proposing_team ? transaction.proposing_team_id : transaction.related_team_id;
                const newRoster = await this.client.roster.findFirst({
                  where: {
                    team_id: newTeamId,
                    week: timeframe.week,
                  },
                });

                await this.client.rosterPlayer.update({
                    where: {
                        player_id_roster_id: {
                            player_id: rp.player_id,
                            roster_id: rp.roster_id,
                        },
                    },
                    data: {
                        roster_id: newRoster.id,
                        position: 'BE',
                    },
                });
            }

            const updated: Transaction = await this.client.transaction.update({
                where: {
                    id: transactionId,
                },
                data: {
                    status: 'Complete',
                    execution_date: new Date(),
                },
            });

            return updated;
        }
        catch(e)
        {
            return null;
        }
    }
}

export default TransactionService;
