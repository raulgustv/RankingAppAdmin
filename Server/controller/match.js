import Player from "../models/player.js";
import Match from "../models/match.js";
import Round from "../models/round.js";



export const generateFirstRound = async (req, res) =>{
    try {

        const {startDate} = req.body;

        if(!startDate) return res.status(400).json({error: 'Se requieren fecha de inicio'})   

        const now  = startDate ? new Date(startDate) : new Date();

        //calculo fecha final
        const day = now.getDay();
        const daysToMonday = (1+7 - day) % 7 || 7;
        const nextMonday = new Date(now);

        nextMonday.setDate(now.getDate()+ daysToMonday)
        nextMonday.setHours(0, 0, 0, 0);

        //domingo de las dos semanas
        const endDate = new Date(nextMonday);
        endDate.setDate(nextMonday.getDate() + 13)
        endDate.setHours(23, 59, 59, 999);

        //jugadores activos

        const players = await Player.find({active: true});

        if (players.length < 10) return res.status(400).json({error: 'Not enough players for the round'})

        const sorted = [...players].sort((a, b) => b.utrLevel - a.utrLevel)

        //assigning initial rank:
        for (let i = 0; i < sorted.length; i++){
            sorted[i].ranking = i + 1;
            await sorted[i].save()
        }

        const matches = [];
        const used = new Set();

        //match players closest UTR and gender
        for (let i = 0; i < sorted.length; i++){
            if (used.has(i)) continue;
            let player1 = sorted[i];
            let bestMatchIndex = -1;
            let bestDiff = Infinity;
            let bestGenderCompatible = true;

            for(let j = i + 1; j < sorted.length; j++){
                if(used.has(j)) continue;
                const player2 = sorted[j]
                const utrDiff  = Math.abs(player1.utrLevel - player2.utrLevel); 

                const genderCompatible = 
                    player1.gender === player2.gender ||
                    (player1.gender === "M" && player2.gender === "F" && player2.utrLevel >= player1.utrLevel) ||
                    (player1.gender === "F" && player2.gender === "M" && player1.utrLevel >= player2.utrLevel);

                if(genderCompatible && utrDiff < bestDiff){
                    bestDiff = utrDiff;
                    bestMatchIndex = j;
                    bestGenderCompatible = genderCompatible
                }
            }

            if(bestMatchIndex !== -1){
                used.add(i);
                used.add(bestMatchIndex);
                matches.push({
                    round: 1,
                    player1: player1._id,
                    player2: sorted[bestMatchIndex]._id,
                    utrDifference: bestDiff,
                    genderCompatible: true,
                    isBye: false
                });
            }
        }

        //bye players for odd
        const remaining = sorted.filter((_, idx) => !used.has(idx));

        if (remaining.length === 1){
            matches.push({
                round: 1,
                player1: remaining[0]._id,
                player2: remaining[0]._id,
                utrDifference: 0,
                genderCompatible: true,
                isBye: true,
                completed: true,
                winner: remaining[0]._id
            })
        }

        const savedMatches = await Match.insertMany(matches);

        await Round.create({
            roundNumber: 1,
            totalMatches: savedMatches.length,
            completed: false,
            startDate: nextMonday,
            endDate: endDate,
            winners: []
        })

        res.status(201).json({
            message:'Ronda #1 generada correctamente',
            startDate: nextMonday,
            endDate: endDate,
            totalPlayers: players.length,
            totalMatches: savedMatches.length,
            matches: savedMatches
        })


    } catch (error) {
        console.log(error)
        res.status(500).json({error: 'Error obteniendo jugadores'})
    }
}

export const recordMatchResult = async(req, res) =>{
    try {
        const {matchId, sets} = req.body;

        const match  = await Match.findById(matchId).populate("player1 player2");

        if(!match) return res.status(400).json({error: "Match not found"})
        
        if(match.completed) return res.status(400).json({error: "Match already completed"})
        

        if(!Array.isArray(sets) || sets.length === 0){
            return res.status(400).json({error: 'Invalid or missing set scores'})
        }

        match.sets = sets; 

        //count sets won
        let p1SetsWon = 0, p2SetsWon = 0;
        for (const s of sets){
            if(s.player1Games > s.player2Games) p1SetsWon++
            else if (s.player2Games > s.player1Games) p2SetsWon++
        }

        if(p1SetsWon === 0 && p2SetsWon === 0){
            await match.save();
            return res.status(200).json({message: "Partial results saved"})
        }

        let winner;
        if(p1SetsWon > p2SetsWon) winner = match.player1;
        else if (p2SetsWon > p1SetsWon) winner = match.player2;
        else return res.status(400).json({error: "Invalid tie"});

        match.winner = winner._id;
        match.completed = true

        await match.save();

 

        //update ranking after match
        const loserId = match.player1._id.equals(winner._id) ? match.player2._id : match.player1._id;
        const loser = await Player.findById(loserId);
        const winnerDoc = await Player.findById(winner._id)


        // Const diff

        const winnerLevel = Number(winnerDoc.internalLevel || 0)
        const loserLevel = Number(loser.internalLevel || 0)
        const diff = winnerLevel-loserLevel;
        const k = 0.25; //sensibilidad

        //ganador si tenía menos nivel
        let winnerChange = k * (1-1 / (1 + Math.exp(-diff)));
        let loserChange = -winnerChange * 0.8;

        //diferencia era grande y gano el más fuerte
        if(diff > 1 && winnerDoc.internalLevel > loser.internalLevel){
            winnerChange *= 0.2;
            loserChange *= 0.2
        }

        //aplicar cambios

        winnerDoc.internalLevel = Math.max(0, winnerDoc.internalLevel + winnerChange)
        loser.internalLevel = Math.max(0, loser.internalLevel + loserChange);

        //historial
        if(!winnerDoc.adjustmentHistory) winnerDoc.adjustmentHistory = [];
        if(!loser.adjustmentHistory) loser.adjustmentHistory = [];

        //winner 
        winnerDoc.adjustmentHistory.push({
            roundNumber: match.round,
            change: winnerChange,
            reason: `Gana contra ${loser.name}`
        })

        //loser
        loser.adjustmentHistory.push({
            roundNumber: match.round,
            change: loserChange,
            reason: `Pierde contra ${winnerDoc.name}`
        })

        await winnerDoc.save();
        await loser.save();

        //actualizar ronda correspondiente
        await Round.updateOne(
            {roundNumber: match.round},
            {$addToSet: {winners: winner._id}}
        );

        //confirmacion ronda finalizada
        const matchesInRound = await Match.find({round: match.round});
        const allCompleted =  matchesInRound.every(m=> m.completed)

        if(allCompleted){
            await Round.updateOne(
                {roundNumber: match.round},
                {completed: true}
            )
        } 

        res.status(201).json({
            message: "Match completed, winner saved and ranking updated",
            matchId: match._id,
            matchRound: match.round,
            winner: `${winnerDoc.name} ${winnerDoc.lastName}`,
            internalLevelWinner: winnerDoc.internalLevel.toFixed(2), 
            internalLoserWinner: winnerDoc.internalLevel.toFixed(2),
            sets,
            roundsCompleted: allCompleted
        })

    } catch (error) {
        console.log(error);
        res.status(500).json({error: "Internal error updating match result"})
    }
}

export const generateNextRound = async(req, res) =>{
   try {
  // Obtener la última ronda
  const latestRound = await Round.findOne().sort({ roundNumber: -1 });


  if (!latestRound)
    return res.status(400).json({ error: "No existe ronda" });

  if (!latestRound.completed)
    return res.status(400).json({ error: "Ronda anterior no ha sido completada" });

   const nextRoundNumber = latestRound.roundNumber + 1;

  // Obtener todos los jugadores activos
  const returningPlayers = await Player.find({
    _id: {$in: latestRound.players},
    active: true 
   });

   const newEligilePlayers = await Player.find({
      active: true,
      joinedRound: {$lte: nextRoundNumber},
      _id:{$nin: latestRound.players}
   })

   const playerMap = new Map();

   for(const p of [...returningPlayers, ...newEligilePlayers]){
      playerMap.set(p._id.toString(), p)
   }

   const players = Array.from(playerMap.values())

  if (players.length < 2)
    return res
      .status(400)
      .json({ error: "No hay suficientes jugadores activos para generar una nueva ronda" });


    const allActivePlayers = await Player.find({ active: true }).sort({
    internalLevel: -1,
  });

  let rank = 1;

  for(const player of allActivePlayers){
    player.ranking = rank ++
    await player.save()
  }

  // Evitar repeticiones
  const previousMatches = await Match.find({});
  const previousPairs = new Set(
    previousMatches
      .map((m) => [
        `${m.player1.toString()}-${m.player2.toString()}`,
        `${m.player2.toString()}-${m.player1.toString()}`,
      ])
      .flat()
  );

  // Calcular fechas de la nueva ronda
  const lastEndDate = new Date(latestRound.endDate);
  const nextMonday = new Date(lastEndDate);
  nextMonday.setDate(
    lastEndDate.getDate() + ((1 + 7 - lastEndDate.getDay()) % 7 || 7)
  );
  nextMonday.setHours(0, 0, 0, 0);

  const nextEndDate = new Date(nextMonday);
  nextEndDate.setDate(nextMonday.getDate() + 13);
  nextEndDate.setHours(23, 59, 59, 999);

  // Ordenar jugadores por ranking y UTR
  const sorted = [...players].sort(
    (a, b) => a.ranking - b.ranking || b.internalLevel - a.internalLevel
  );

  const matches = [];

  // Copia de jugadores disponibles
  let available = [...sorted];

  // Emparejar jugadores hasta que queden menos de 2
  while (available.length > 1) {
    const player1 = available.shift();

    // Buscar el mejor match posible (mínima diferencia de UTR, que no hayan jugado)
    let bestMatchIndex = -1;
    let bestDiff = Infinity;

    for (let j = 0; j < available.length; j++) {
      const player2 = available[j];
      const key1 = `${player1._id}-${player2._id}`;
      const key2 = `${player2._id}-${player1._id}`;
      if (previousPairs.has(key1) || previousPairs.has(key2)) continue;

      const levelDiff = Math.abs(player1.internalLevel - player2.internalLevel);
      if (levelDiff < bestDiff) {
        bestDiff = levelDiff;
        bestMatchIndex = j;
      }
    }

    // Si no se encuentra un match nuevo, usar el primero disponible
    if (bestMatchIndex === -1) bestMatchIndex = 0;

    const player2 = available.splice(bestMatchIndex, 1)[0];

    matches.push({
      round: latestRound.roundNumber + 1,
      player1: player1._id,
      player2: player2._id,
      utrDifference: Math.abs(player1.internalLevel - player2.internalLevel),
      isBye: false,
    });
  }

  // Si queda un jugador libre, asignar BYE
  if (available.length === 1) {
    const lastRemaining = available[0];
    console.log(`Jugador asignado como BYE: ${lastRemaining.name}`);
    matches.push({
      round: latestRound.roundNumber + 1,
      player1: lastRemaining._id,
      player2: lastRemaining._id,
      utrDifference: 0,
      isBye: true,
      completed: true,
      winner: lastRemaining._id,
    });
  }

  // Guardar los partidos generados
  const savedMatches = await Match.insertMany(matches);

  // Crear la nueva ronda
  await Round.create({
    roundNumber: latestRound.roundNumber + 1,
    totalMatches: savedMatches.length,
    completed: false,
    winners: [],
    startDate: nextMonday,
    endDate: nextEndDate,
  });

  // Respuesta final
  res.status(201).json({
    message: `Ronda ${latestRound.roundNumber + 1} generada correctamente`,
    totalPlayers: sorted.length,
    newPlayersAdded: newEligilePlayers.map((p) => p.name),
    totalMatches: savedMatches.length,
    matches: savedMatches,
  });

} catch (error) {
  console.error("Error al generar siguiente ronda:", error);
  res.status(500).json({ error: error.message });
}

}