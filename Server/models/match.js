import mongoose, { mongo } from "mongoose";


const setSchema = new mongoose.Schema({
    player1Games: {
        type: Number,
        required: true,
        min: [0, "Marcador mínimo es 0"],
        max: [7, "Marcador máximo es 7"]
    },
    player2Games: {
        type: Number,
        required: true,
        min: [0, "Marcador mínimo es 0"],
        max: [7, "Marcador máximo es 7"]
    }
}, {_id: false})

const matchSchema = new mongoose.Schema({
    round:{
        type: Number,
        required: true,
        default: 1
    }, 
    player1:{
        type: mongoose.Schema.Types.ObjectId, 
        ref: "Player", 
        required: true
    },
    player2:{
        type: mongoose.Schema.Types.ObjectId, 
        ref: "Player", 
        required: true
    },
    sets: [setSchema],
    winner: {
        type: mongoose.Schema.Types.ObjectId, ref: "Player", default: null
    },
    utrDifference: {
        type: Number,
        required: true
    },
    genderCompatible:{
        type: Boolean,
        default: true
    },
    completed: {
        type: Boolean,
        default: false
    },
    isBye: {
        type: Boolean,
        default: false
    }
}, {timestamps: true});

export default mongoose.model("Match", matchSchema)