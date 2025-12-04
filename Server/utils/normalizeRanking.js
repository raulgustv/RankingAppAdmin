import Player from "../models/player.js";

export const normalizeRankings = async() =>{
    const activePlayers = await Player.find({active: true}).sort({ranking: 1});

    let rank  = 1;
    for(const player of activePlayers) {
        player.ranking = rank ++;
        await player.save();
    }
}