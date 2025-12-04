import mongoose from "mongoose";

const playerSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password:{
        type: String,
        required: false
    },
    age: {
        type: Number,
        required: true,
        min: [18, 'Age must be +18'],
        max: [79, 'Age cannot be over 79']
    },
    gender: {
        type: String,
        required: true,
        enum: ["M", "F"]
    },
    contactNumber: {
        type: String,
        required: true,
        match: [/^[0-9+\-\s()]{6,20}$/, "Invalid phone number format"],
    },
    utrLevel: {
        type: Number,
        required: true,
        min:[1.0, 'UTR must be at least 1.0'],
        max: [17, 'UTR cannot be over 17']
    },
    internalLevel:{
        type: Number,
        default: function(){
            this.utrLevel
        }
    },
    adjustmentHistory:[
        {
            round: Number,
            change: Number,
            reason: String,
            currentRank: Number,
            date: {type: Date, default: Date.now}
        }
    ],
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Admin",
        required: true
    },
    active: {
        type: Boolean,
        default: true
    },
    ranking: {
        type: Number,
        default: null
    },
    level:{
        type: String,
        enum: ['Admin', 'Player'],
        default: 'Player',
        required: true
    },
    joinedRound: {
        type: Number,
        default: 1
    },
    /* Esto se tiene que borrar ya en prod */
    tempPassword: {
        type: String,
    },
    suspended: {
        type: Boolean,
        default: false
    }, 
    suspendedNotes: {
        type: [
             {
                message: {type: String, required: true},
                level: {type: Number, required: true},
                date: {type: Date, default: Date.now}
            },
        ], default: []
    },
    firstLogin: {
        type: Boolean,
        default: true
    }
}, {timestamps: true})

export default mongoose.model("Player", playerSchema)