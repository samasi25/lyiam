const { User } = require('../models/user'); // User schema includes Wallet
const Contest = require('../models/Contest');
const Team = require('../models/Team');


// Fetch contests the user has joined for a specific match
const LeaderBoard = async (req, res) => {
    const userId = req.userId; // Extract userId from authenticated token
    // const matchId = req.query.matchId; // Extract matchId from query params
    const matchId = '65a7b2c9876c9e001c4f0e20'; // Extract matchId from query params

    // Validate matchId
    if (!matchId) {
        return res.status(400).json({ message: "matchId is required." });
    }

    try {
        // Fetch contests user joined for the specific match
        const contests = await Contest.find({
            matchId: matchId,
            'teams.userId': userId,
        }).populate({
            path: 'teams',
            populate: { path: 'userId', select: 'username' }, // Populate username of users
        });

        if (!contests || contests.length === 0) {
            return res.status(404).json({ message: "No contests found for this match." });
        }

        // Prepare contests with players and ranks
        const contestsWithPlayers = contests.map((contest) => {
            const players = contest.teams.map((team) => ({
                username: team.userId.username,
                score: team.totalPoints || 0,
                winning: 0, // Default winnings
            }));

            // Sort players by score and assign ranks
            players.sort((a, b) => b.score - a.score);
            players.forEach((player, index) => {
                player.rank = index + 1;
            });

            return {
                contestName: contest.name,
                entryFee: contest.entryFee,
                prizePool: contest.prizePool,
                players,
            };
        });

        res.status(200).json({ contests: contestsWithPlayers });
    } catch (error) {
        console.error('Error fetching contests:', error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};



// Finalize match and distribute winnings Post route
const Finalize = async (req, res) => {
    const contestId = req.params.contestId;

    try {
        // Fetch contest details
        const contest = await Contest.findById(contestId).populate('teams');
        if (!contest) {
            return res.status(404).json({ message: "Contest not found." });
        }

        const { prizePool, teams } = contest;
        const numPlayers = teams.length;

        // Sort players by total points
        teams.sort((a, b) => b.totalPoints - a.totalPoints);

        // Distribute prize pool
        const distribution = distributePrizePool(prizePool, numPlayers);
        const updates = teams.map((team, index) => ({
            userId: team.userId,
            rank: index + 1,
            winning: distribution[index] || 0,
        }));

        // Update wallets and save results
        await Promise.all(
            updates.map(async (update) => {
                await User.updateOne(
                    { _id: update.userId },
                    {
                        $inc: {
                            'wallet.totalMoney': update.winning,
                            'wallet.withdrawableAmount': update.winning,
                            'wallet.winningAmount': update.winning,
                        },
                    }
                );
            })
        );

        res.status(200).json({ message: "Match finalized and results saved." });
    } catch (error) {
        console.error('Error finalizing contest:', error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

// Calculate scores for all users in a match Post
const CalculateScores = async (req, res) => {
    const matchId = req.body.matchId;

    if (!matchId) {
        return res.status(400).json({ message: "matchId is required." });
    }

    try {
        // Fetch teams for the match
        const teams = await Team.find({ matchId }).populate('userId', 'username');
        if (!teams || teams.length === 0) {
            return res.status(404).json({ message: "No teams found for this match." });
        }

        // Fetch player stats for the selected players
        const playerIds = teams.flatMap((team) =>
            team.selectedPlayers.map((player) => player.id)
        );
        const playerStats = await PlayerStats.find({ matchId, playerId: { $in: playerIds } });

        // Calculate total points for each team
        const updates = teams.map((team) => {
            let totalPoints = 0;

            team.selectedPlayers.forEach((player) => {
                const stats = playerStats.find((stat) => stat.playerId === player.id);
                if (stats) {
                    let points = 0;
                    points += stats.goals * 6;
                    points += stats.assists * 3;
                    points += Math.floor(stats.shots / 10) * 1;
                    points += Math.floor(stats.passes / 50) * 2;
                    points += stats.tackles * 2;
                    points += stats.interceptions * 2;
                    points -= stats.yellowCards * 1;
                    points += stats.penaltiesScored * 5;
                    totalPoints += points;
                }
            });

            return { teamId: team._id, totalPoints };
        });

        // Update total points in teams
        await Promise.all(
            updates.map((update) =>
                Team.findByIdAndUpdate(update.teamId, { totalPoints: update.totalPoints })
            )
        );

        res.status(200).json({ message: "Scores calculated and updated successfully." });
    } catch (error) {
        console.error('Error calculating scores:', error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

// Prize pool distribution logic (Helper Function Moved to Bottom)
function distributePrizePool(prizePool, numPlayers) {
    const distribution = [];
    if (numPlayers === 2) {
        distribution.push(prizePool * 0.44, prizePool * 0.06);
    } else if (numPlayers === 3) {
        distribution.push(prizePool * 0.44, prizePool * 0.04, prizePool * 0.02);
    } else if (numPlayers === 4) {
        distribution.push(prizePool * 0.44, prizePool * 0.03, prizePool * 0.04, prizePool * 0.02);
    } else if (numPlayers === 5) {
        distribution.push(
            prizePool * 0.44,
            prizePool * 0.03,
            prizePool * 0.015,
            prizePool * 0.01,
            prizePool * 0.005
        );
    }
    return distribution;
}

module.exports = { LeaderBoard, Finalize, CalculateScores };
