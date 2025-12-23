
    import mongoose from "mongoose";
    import Penalty, { penaltyReasons } from "../models/penalty.js";
    import Player from "../models/player.js";
    import { normalizeRankings } from "../utils/normalizeRanking.js";
import player from "../models/player.js";


    export const addPenalty = async(req, res) =>{

        const {idPlayer} = req.params;

        const {reason,  note} = req.body;
        const issuedBy = req.admin?._id;    

        if(!mongoose.Types.ObjectId.isValid(idPlayer)){
            return res.status(400).json({
                error: 'Id del jugador no es válido'
            })
        }
        

        try {
            const player = await Player.findById(idPlayer).select('-password');

            if (!penaltyReasons.includes(reason) || !reason){
                return res.status(400).json({error: 'Motivo de penalty no válido'})
            }

            if(!player){
                return res.status(400).json({error: 'Jugador no encontrado'});
            }

            if(!note || note.trim === ""){
                return res.status(400).json({error: 'Se necesita añadir una nota'})
            }

            const penalty = await Penalty.create({ 
                player: player.id,
                reason,
                issuedBy, 
                note
            });

            const penaltyCount = await Penalty.countDocuments({player: idPlayer})

            //determinar suspensión
            let suspensionMessage = null;
            let suspensionLevel = null;

            if(penaltyCount === 3){
                suspensionMessage = "Suspendido 1 semana",
                suspensionLevel = 1
            }
            if(penaltyCount === 4){
                suspensionMessage = "Suspendido 1 mes",
                suspensionLevel = 2
            }
            if(penaltyCount === 5){
                suspensionMessage = "Suspension indefinida",
                suspensionLevel = 3
            };

            //aplicar suspensión
            if(suspensionMessage){
                player.suspended = true;
                player.active = false;
                player.ranking = null;
               
                const alreadyHasLevel = player.suspendedNotes.some(
                    n => n.level === suspensionLevel
                )

                if(!alreadyHasLevel){
                    player.suspendedNotes.push({
                        message: suspensionMessage,
                        level: suspensionLevel
                    })
                }
                await player.save();

                 normalizeRankings()
            }

            return res.status(201).json({
                msg: "Penalty added correctly",
                penalty,
                suspensionApplied: suspensionMessage || 'None'
            });

            
        } catch (error) {
            console.log(error);
            return res.status(500).json({error: 'Unable to add penalty to player'})
        }

        
    } 

    export const addSuspension = async(req, res) =>{
        const {idPlayer} = req.params;
        const {message} = req.body;

         if(!mongoose.Types.ObjectId.isValid(idPlayer)){
            return res.status(400).json({
                error: 'Id del jugador no es válido'
            })
        }

        if(!message) return res.status(400).json({error: 'Mensaje requerido'})

        try {

            const player = await Player.findById(idPlayer).select('-password');

            if(!player) return res.status(400).json({error: 'Jugador no encontrado'});

            if(player.suspended){
                return res.status(400).json({error: 'Jugador ya se encuentra suspendido'});
            } 

            const defaultSuspensionLevel = 3

            player.suspensionLevel = defaultSuspensionLevel
            player.suspensionMessage = message

            player.active = false
            player.ranking = null
            player.suspended = true

            player.suspendedNotes.push({
                message,
                level: defaultSuspensionLevel,
                date: new Date()
            });

            await player.save();

             normalizeRankings()

            return res.status(200).json({
                message: 'Player has been suspended',
                player
            })
            
        } catch (error) {
            console.log(error)
            return res.status(500).json({error: 'Internal error adding suspension'})
            
        }

    }

    export const removeSuspension = async(req,res) =>{

        const {idPlayer} = req.params;

         if(!mongoose.Types.ObjectId.isValid(idPlayer)){
            return res.status(400).json({
                error: 'Id del jugador no es válido'
            })
        }

        try {

            const player = await Player.findById(idPlayer).select('-password');

            if(!player) return res.status(400).json({error: 'Jugador no encontrado'});

            if(!player.suspended){
                return res.status(400).json({error: 'Jugador no se encuentra suspendido'});
            } 

            const highestRankedPlayer = await Player.findOne({active: true})
                        .sort({ranking: -1})
                        .select("ranking");

            
            const newRank =  highestRankedPlayer && highestRankedPlayer.ranking
                ? highestRankedPlayer.ranking + 1
                : 1;      
                
            player.active = true
            player.suspended = false
            player.ranking = newRank

            await player.save();

              return res.status(200).json({
                message: `Player ${player.name} ${player.lastName} has been reactivated from suspension`,
                player
        })


            
        } catch (error) {
            console.log(error)
            return res.status(500).json({error: 'Internal error removing suspension'})
        }

        
    }

    export const getPenalties = async(req, res) =>{
        try {

            const {idPlayer} = req.params;

            const penalty = await Penalty.find({player: idPlayer})
                                    .populate("player", "name lastName")
                                    .populate("issuedBy", "name lastName")

            return res.status(200).json(penalty)
        } catch (error) {
            console.log(error)
            return res.status(500).json({
                error: "Unable to obtain penalty data"
            })
        }
    }