const mongoose = require('mongoose');

const ContestSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    entryFee: {
        type: Number,
        required: true
    },
    maxPlayers: {
        type: Number,
        required: true
    },
    prizePool: {
        type: Number,
        required: true
    },
    playersJoined: {
        type: Number,
        default: 0
    },
    matchId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Match', required: true
    }, // Association with Match
    teams: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Team'
    }], // Teams participating
}, { timestamps: true });

const Contest = mongoose.model('Contest', ContestSchema);
module.exports = Contest;
