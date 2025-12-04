import Admin from "../models/admin.js";
import jwt from 'jsonwebtoken';
import bcrypt from "bcryptjs";
import Player from "../models/player.js";
// import Match from "../models/match.js";
import Round from "../models/round.js";
import { normalizeRankings } from "../utils/normalizeRanking.js";


const generateToken = (id) =>{
    return jwt.sign({id}, process.env.JWT_SECRET, {expiresIn: '30d'})
}

//registro admin
export const adminRegister = async(req, res) =>{

    try{
        const {name, lastName, email, password} = req.body;

        const adminExists = await Admin.findOne({email});
        if (adminExists) return res.status(400).json({message: 'Este administrador ya existe'});

        const admin = new Admin({name, lastName, email, password});

        await admin.save();

        res.status(201).json({
            _id: admin._id,
            name: admin.name,
            lastName: admin.lastName,
            email: admin.email,
            token: generateToken(admin._id)
        })

    } catch(error){
        console.error(error)
        res.status(500).json({error: 'Error de registro de administrador'})
    }
}

export const adminLogin = async(req, res) =>{

    try {
        const {email, password} = req.body;

        const admin = await Admin.findOne({email})

        if(!admin) return res.status(400).json({error: "Credenciales incorrectos"})

        const passwordValid = await bcrypt.compare(password, admin.password)

        if(!passwordValid) return res.status(401).json({error: 'Credenciales incorrectos'})

        //create token
        const token = jwt.sign(
            {id: admin._id, isAdmin: true}, 
            process.env.JWT_SECRET,
            {expiresIn: '1d'}
        )

        res.status(201).json({
            message: 'Login successful',
            token, 
            admin: {id: admin._id, name: admin.name, email: admin.email, role: admin.level}
        })

   
    } catch (error) {
        console.error(error)
        res.status(error.statusCode || 500).json({error: error.message ||  'Internal server error'})
    }
}

export const reactivatePlayer = async(req, res) =>{
    try {
        const {idPlayer} = req.params;

        const player = await Player.findById(idPlayer);
        const highestRankedPlayer = await Player.findOne({active: true})
            .sort({ranking: -1})
            .select("ranking");

    
    if (!player) return res.status(400).json({error: "Jugador no encontrado"});
    if(player.suspended === true){
        return res.status(400).json({error: 'Un jugador suspendido no puede ser reactivado'}) 
    } 

    const newRank =  highestRankedPlayer && highestRankedPlayer.ranking
        ? highestRankedPlayer.ranking + 1
        : 1;


    player.active = true;
    player.ranking = newRank

    await player.save();

    return res.status(201).json({
        message: `${player.name} ${player.lastName} has been reactivated`,
        active: true,
        ranking: newRank
    })

    } catch (error) {
        console.log(error)
        res.status(500).json('Error reactivando jugador')
    }
}

export const deactivePlayer = async(req, res) =>{
    try {

        const {idPlayer} = req.params;

        const player = await Player.findById(idPlayer);

        if (!player) return res.status(400).json({error: "Jugador no encontrado"});

        player.active = false;
        player.ranking = null;        

        await player.save();

        normalizeRankings();

        res.status(201).json({
            message: `${player.name} ${player.lastName} has been removed from the ranking`,
            active: player.active,
            ranking: player.ranking

        });     




        
    } catch (error) {
        console.log(error)
        res.status(500).json({error: "Error interno desactivando jugador"})
    }
}

export const allPlayers = async(req, res) =>{
    try {

        const players = await Player.find().select("-password -tempPassword");

        if(!players) return res.status(400).json({error: 'No hay jugadores disponibles'})

        return res.status(200).json(players)
        
    } catch (error) {
        console.log(error)
        res.status(500).json({error: "Error leyendo jugadores"})
    }
}

export const activePlayers = async(req, res) =>{
    try {

        const players = await Player.find({active: true})

        if(!players) return res.status(400).json({error: 'No hay jugadores disponibles'})

        return res.status(200).json({
           players
        })
        
    } catch (error) {
        console.log(error)
        res.status(500).json({error: "Error leyendo jugadores"})
    }
}



export const allRounds = async(req, res) =>{

    try {

        const allRounds = await Round.find().select("-_id")
            .populate("players", "name lastName -_id")
            .populate("winners", "name lastName -_id")

        res.status(200).json(allRounds)
        
    } catch (error) {
        console.log(error)
        res.status(500).json({error: "No se han podido obtener las rondas"})
    }

}

export const roundCount = async(req, res) =>{
    try {

        const rounds = await Round.countDocuments();

        res.json({rounds})
        
    } catch (error) {
        console.log(error)
        res.status(500).json({
            error: 'Internal error counting rounds'
        })
    }
}


