const axios = require("axios");
const Lineup = require("../models/Lineup.js");
const Team = require("../models/Team.js");
const { Match } = require("../models/matches.js");
require("dotenv").config();
const mongoose = require("mongoose");

const SPORTMONKS_API_KEY = process.env.API_KEY;


// const fetchAndStorePlayers = async (matchId, homeTeam, awayTeam) => {
const fetchAndStorePlayers = async (matchId) => {
    try {
        const existingPlayers = await Lineup.find({ matchId });
        if (existingPlayers.length > 0) {
            console.log("Players Already Exist in Database!");
            return existingPlayers;
        }

        // **Manually Set Team Names for Testing**
        const homeTeam = "85";  // Example: India 
        const awayTeam = "95";  // Example: Australia



        const homeResponse = await axios.get(`https://api.sportmonks.com/v3/football/players?api_token=${SPORTMONKS_API_KEY}&team=${homeTeam}`);

        const awayResponse = await axios.get(`https://api.sportmonks.com/v3/football/players?api_token=${SPORTMONKS_API_KEY}&team=${awayTeam}`);



        // console.log(" Home Team Players Data:", homeResponse.data);
        // console.log(" Home Team Players Data:", awayResponse.data);

        const homePlayers = homeResponse.data.data.map(player => ({
            matchId,
            // teamName: homeTeam
            teamName: "India",
            playerId: player.id,
            playerName: player.display_name,
            position: player.position?.name || "Unknown"
        }));

        const awayPlayers = awayResponse.data.data.map(player => ({
            matchId,
            // teamName: awayTeam,
            teamName: "Australia",
            playerId: player.id,
            playerName: player.display_name,
            position: player.position?.name || "Unknown"
        }));

        await Lineup.insertMany([...homePlayers, ...awayPlayers]);
        // console.log("Players Fetched & Stored in Database!");
        return [...homePlayers, ...awayPlayers];
    } catch (error) {
        console.error(" Error Fetching Players:", error);
        return [];
    }
};



//  Team Choose GET Route
const TeamChooseGet = async (req, res) => {


    const { matchId } = req.params;
    // const userId = req.user.id;
    // console.log(" Received Match ID:", matchId);

    try {

        if (!matchId) {
            return res.status(400).json({ success: false, message: "Match ID is required." });
            console.log("Match ID is missing!");
        }

        const match = await Match.findById(matchId);  // objectID fetch kerne ke liye 
        // const match = await Match.findOne({ _id: matchId });




        console.log("Match Data from Database:", match);

        if (!match) {
            console.log("Match not found in database!");
            return res.status(404).json({ success: false, message: "Match not found." });
        }

        console.log("Match Found:", match);

        // const { home_team, away_team } = match;
        // let homePlayers = await Lineup.find({ matchId, teamName: home_team });
        // let awayPlayers = await Lineup.find({ matchId, teamName: away_team });

        let homePlayers = await Lineup.find({ matchId, teamName: "India" });
        let awayPlayers = await Lineup.find({ matchId, teamName: "Australia" });

        if (homePlayers.length === 0 || awayPlayers.length === 0) {
            console.log("Fetching Data from API...");
            // await fetchAndStorePlayers(matchId, home_team, away_team);
            await fetchAndStorePlayers(matchId);
            // homePlayers = await Lineup.find({ matchId, teamName: home_team });
            // awayPlayers = await Lineup.find({ matchId, teamName: away_team });

            homePlayers = await Lineup.find({ matchId, teamName: "India" });
            awayPlayers = await Lineup.find({ matchId, teamName: "Australia" });
        }

        return res.status(200).json({
            success: true,
            // homeTeam: { teamName: home_team, players: homePlayers },
            // awayTeam: { teamName: away_team, players: awayPlayers }

            homeTeam: { teamName: "India", players: homePlayers },
            awayTeam: { teamName: "Australia", players: awayPlayers }
        });
    } catch (error) {
        console.error(" Error Fetching Lineup:", error);
        return res.status(500).json({ success: false, message: "Error fetching lineup", error: error.message });
    }
};

//  Team Choose POST Route
const TeamChoosePost = async (req, res) => {
    const { matchId } = req.params;
    const { selectedPlayers, selectedSubstitutes } = req.body;
    const userId = req.user.id;

    if (!matchId) {
        return res.status(400).json({ message: "Match ID is required." });
    }

    if (!Array.isArray(selectedPlayers) || !Array.isArray(selectedSubstitutes)) {
        return res.status(400).json({ message: "Selected players and substitutes must be arrays." });
    }

    if (selectedPlayers.length !== 12) {
        return res.status(400).json({ message: "You must select exactly 12 players." });
    }

    if (selectedSubstitutes.length !== 2) {
        return res.status(400).json({ message: "You must select exactly 2 substitutes." });
    }

    try {
        const existingTeams = await Team.countDocuments({ userId, matchId });
        if (existingTeams >= 10) {
            return res.status(400).json({ message: "You can create a maximum of 10 teams for this match." });
        }

        const existingTeam = await Team.findOne({ userId, matchId });
        if (existingTeam) {
            existingTeam.selectedPlayers = selectedPlayers;
            existingTeam.substitutes = selectedSubstitutes;
            await existingTeam.save();
            return res.status(200).json({ message: "Team updated successfully.", selectedPlayers, selectedSubstitutes });
        }

        const newTeam = new Team({
            userId,
            matchId,
            selectedPlayers,
            substitutes: selectedSubstitutes,
        });

        await newTeam.save();
        return res.status(201).json({ message: "Team created successfully.", selectedPlayers, selectedSubstitutes });
    } catch (error) {
        res.status(500).json({ message: "Error saving team", error: error.message });
    }
};

module.exports = { TeamChooseGet, TeamChoosePost };
