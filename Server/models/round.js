import mongoose from "mongoose";

const roundSchema = new mongoose.Schema({
    roundNumber:{
        type: Number,
        required: true
    },
    totalMatches: {
        type: Number,
        required: true,
    },
    completed: {
        type: Boolean,
        default: false
    },
    winners: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Player"
    }],
    players: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Player",
            default: []
        }
    ],
    startDate:{
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    }
}, {timestamps: true})

export default mongoose.model("Round", roundSchema);
