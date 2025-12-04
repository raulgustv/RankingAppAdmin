import mongoose from "mongoose";

export const penaltyReasons = [     
    'No show', 'Late cancellations', 'Rejects challenges',
    'Unsportsmanship conduct', 'Cheating', 'No result reporting'
]

const penaltySchema = new mongoose.Schema({
    player: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Player",
        required: true
    },
    reason: {
        type: String,
        required: true,
        enum: penaltyReasons
    },
    points:{
        type: Number,
        required: true,
        default: 1
    },
    note:{
        type: String,
        required: false
    },
     issuedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Admin",
        required: true
    },
}, {timestamps: true})

export default mongoose.model("Penalty", penaltySchema);

