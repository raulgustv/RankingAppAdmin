import Player from "../models/player.js";
import Round from "../models/round.js";
import bcrypt from 'bcrypt'
import crypto from 'crypto'
import jwt from "jsonwebtoken";
import Match from "../models/match.js";

export const createPlayer = async(req, res) =>{
    try {

        const {name, lastName, email, age, gender, contactNumber, utrLevel} = req.body;

        if (!name || !lastName || !email || !age || !gender || !contactNumber || !utrLevel) {
            return res.status(400).json({ error: "All fields are required" });
        }

        //obtener ultima ronda
        const latestRound = await Round.findOne().sort({roundNumber: -1});

        let newRank = null;

        if(latestRound){
            const highestRank = await Player.findOne().sort({ranking: -1});
            newRank = highestRank ? highestRank.ranking + 1 : 1
        }

        const joinedRound = latestRound ? latestRound.roundNumber + 1 : 1;

        const rawPass = crypto.randomBytes(6).toString("base64").replace(/\+/g, "0").slice(0, 10);

        //hash
        const saltRounds = 10
        const hashed  = await bcrypt.hash(rawPass, saltRounds)
        
        const player = new Player({
            name,
            lastName,
            email,
            password: hashed,
            age,
            gender,
            contactNumber,
            utrLevel,
            internalLevel: utrLevel,
            ranking: newRank,
            joinedRound,
            role: "Player",
            tempPassword: rawPass, //esto se tiene que borrar 
            createdBy: req.admin?._id || null
        });

        //save DB
        await player.save();

        res.status(201).json({
            message: 'Player successfully created',
            player,
            rawPass
        });


    } catch (error) {
        res.status(400).json({
            error: error.message,
            errors: error.errors || null
        })
    }
}

export const loginPlayer = async(req, res) =>{
    try {

        const {email, password} = req.body;

        if(!email || !password) return res.status(400).json({error: 'Debe introducir un email y password válidos'})

        const player = await Player.findOne({email});

        if(!player) return res.status(400).json({error: 'No existe un  email asociado a este usuario'})
        if(!player.active) return res.status(400).json({error: 'Este usuario ha sido desactivado por el administrador'})
        
        const valid = await bcrypt.compare(password, player.password)
        if(!valid) return res.status(401).json({error: 'Email o contraseña no son válidos'})

        //generar token
        const token = jwt.sign({
            id: player._id,
            name: player.name,
            email: player.email,
            isAdmin: false
        }, 
            process.env.JWT_SECRET,
            {expiresIn: '7d'}
        );

        res.status(200).json({
            message: `Login successfull. Welcome ${player.name}`,
            token,
            firstLogin: player.firstLogin,
            id: player._id,
            name: player.name
        });        


        
        
    } catch (error) {
        console.log(error)
        res.status(500).json({error: 'Error iniciando sesión'})
    }
}

export const playerProfile = async(req, res) =>{
    try {

        const user = req.user;

        if(!user) return res.status(401).json({error: 'No se puede leer el perfil de usuario'})

        const player = await Player.findOne({email: user.email})
        const matches = await Match.find({
            $or: [{player1: player._id}, {player2: player._id}]
        })
            .populate("player1", "name lastName")
            .populate("player2", "name lastname")
            .populate("winner", "name lastname")
            .sort({createdAt: -1})
            .lean()

        const matchesFinal = matches.map((m) =>({
            player1:{
                name: m.player1.name,
                lastname: m.player1.lastName,
            },
            player2:{
                name: m.player1.name,
                lastname: m.player1.lastName,
            },
             winner:{
                name: m.winner.name,
                lastname: m.winner.lastName,
            },
            sets: m.sets
            
        }))

        res.status(200).json({
            name: player.name,
            lastName: player.lastName,
            email: player.email,
            ranking: player.ranking,
            level: player.internalLevel,
            contactNumber: player.contactNumber,
            history: player.adjustmentHistory, 
            matchesFinal 
        });

        
    } catch (error) {
        console.log(error)
        return res.status(500).json({error: 'Error leyendo perfile de usuario'})
    }
}

export const updatePassword = async(req, res) =>{
    try {

        const user = req.user;
        const {password} = req.body; 

        if(!password) return res.status(400).json({error: 'Se requiere una contraseña'});        

        const player = await Player.findById(user.id)
        if(!player) return res.status(400).json({error: 'Usuario no encontrado'});        

        const hashed = await bcrypt.hash(password, 10);

        player.password = hashed;
        player.tempPassword = null;
        player.firstLogin = false;

        await player.save();

        return res.status(200).json({
            message: 'Contraseña actualizada',
            name: player.name,
            lastName: player.lastName,
            firstLogin: player.firstLogin
        });
        
    } catch (error) {
        console.log(error)
        return res.status(500).json({error: 'Internal error updating password'})
    }
}





// export const generateFirstRound = async(req, res) =>{
    
//     try{

//         const players = await Player.find({active: true}).lean()

//         if (players.length < 10) return res.status(400).json({error: 'Not enough players to start ranking'})

//         //sort UTR asc

//         const sorted = [...players].sort((a, b) => a.utrLevel - b.utrLevel)
//         const matches = []
//         const byePlayers = []

//         const used = new Set();

//         for (let i = 0; i < sorted.length; i++) {
//             if(used.has(i)) continue;

//             let player1 = sorted[i];
//             let bestMatchIndex  = -1;
//             let bestDiff = Infinity;

//             for(let j = i + 1; j < sorted.length; j++){
//                 if(used.has(j)) continue;

//                 const player2  = sorted[j];

//                 const utrDif = Math.abs(player1.utrLevel - player2.utrLevel)

//                 //gender rule

//                 const genderCompatible = 
//                     player1.gender === player2.gender ||
//                     (player1.gender === "M" && player2.gender === "F" && player2.utrLevel >= player1.utrLevel) ||
//                     (player1.gender === "F" && player2.gender === "M" && player1.utrLevel >= player2.utrLevel); 

//                 if (genderCompatible && utrDif < bestDiff){
//                     bestDiff = utrDif;
//                     bestMatchIndex = j
//                 }
//             }

//             if(bestMatchIndex !== -1){
//                 used.add(i)
//                 used.add(bestMatchIndex)
//                 matches.push({player1, player2: sorted[bestMatchIndex]})
//             }
//         }

//         sorted.forEach((p, idx) =>{
//             if(!used.has(idx)) byePlayers.push(p)
//         })

//             res.status(200).json({
//             message: "First round generated by UTR and gender balance",
//             totalPlayers: players.length,
//             totalMatches: matches.length,
//             byePlayers: byePlayers.map(p => `${p.name} ${p.lastName}`),
//             matches: matches.map(m => ({
//                 player1: `${m.player1.name} (${m.player1.gender}, ${m.player1.utrLevel})`,
//                 player2: `${m.player2.name} (${m.player2.gender}, ${m.player2.utrLevel})`
//             }))
//         });
//     }
    
//     catch(error){
//         res.status(500).json({ error: error.message });
//     }

// }