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

        res.status(200).json({
            message:'Round #1 generated correctly',
            startDate: nextMonday,
            endDate: endDate,
            totalPlayers: players.length,
            totalMatches: savedMatches.length,
            matches: savedMatches
        })


    } catch (error) {
        console.log(error)
        res.status(500).json({error: 'Error generando primera ronda'})
    }
}

export const recordMatchResult = async (req, res) => {
    try {
        const { matchId, sets } = req.body;

        const match = await Match.findById(matchId).populate("player1 player2");
        if (!match) return res.status(400).json({ error: "Match not found" });

        if (match.completed)
            return res.status(400).json({ error: "Match already completed" });

        if (!Array.isArray(sets) || sets.length === 0) {
            return res.status(400).json({ error: "Invalid or missing set scores" });
        }

        match.sets = sets;

        // Count sets won
        let p1SetsWon = 0,
            p2SetsWon = 0;
        for (const s of sets) {
            if (s.player1Games > s.player2Games) p1SetsWon++;
            else if (s.player2Games > s.player1Games) p2SetsWon++;
        }

        if (p1SetsWon === 0 && p2SetsWon === 0)
            return res
                .status(200)
                .json({ message: "Partial results not allowed" });

        let winner =
            p1SetsWon > p2SetsWon ? match.player1 : match.player2;

        if (p1SetsWon === p2SetsWon)
            return res.status(400).json({ error: "Invalid tie" });

        match.winner = winner._id;
        match.completed = true;
        await match.save();

        // ----------------------------------------------
        //   OBTAIN WINNER/DISER DOCUMENTS
        // ----------------------------------------------

        const loserId = match.player1._id.equals(winner._id)
            ? match.player2._id
            : match.player1._id;

        const winnerDoc = await Player.findById(winner._id);
        const loser = await Player.findById(loserId);

        const winnerOldRank = winnerDoc.ranking;
        const loserOldRank = loser.ranking;

        // ----------------------------------------------
        //   RANKING UPDATE — WINNER NEVER DROPS
        // ----------------------------------------------

        const loserNewRank = loserOldRank + 1;

        const rankingGap = winnerOldRank - loserOldRank;

        // Base limit by gap
        let gapLimit = 1;
        if (rankingGap >= 10) gapLimit = 3;
        else if (rankingGap >= 5) gapLimit = 2;

        const JUMP_LIMIT = 2;

        let winnerNewRank = Math.max(
            winnerOldRank - Math.min(gapLimit, JUMP_LIMIT),
            1
        );

        // ⛔ No entrar al top 3 desde abajo (posición >5)
        if (winnerNewRank < 3 && winnerOldRank > 5) {
            winnerNewRank = 3;
        }

        // ⛔ Si le gana a top 3, no entra directo al podio
        if (loserOldRank <= 3 && winnerNewRank < 4) {
            winnerNewRank = 4;
        }

        // ⚠️ Winner nunca baja
        winnerNewRank = Math.min(winnerNewRank, winnerOldRank);

        // ----------------------------------------------
        //   UPDATE OTHER PLAYERS BETWEEN RANKS
        // ----------------------------------------------

        await Player.updateMany(
            {
                ranking: { $gte: winnerNewRank, $lt: winnerOldRank },
                _id: { $ne: winnerDoc._id }
            },
            { $inc: { ranking: 1 } }
        );

        winnerDoc.ranking = winnerNewRank;
        loser.ranking = loserNewRank;

        // ----------------------------------------------
        // INTERNAL LEVEL (MISMA LÓGICA TUYA)
        // ----------------------------------------------

        const winnerLevel = Number(winnerDoc.internalLevel || 0);
        const loserLevel = Number(loser.internalLevel || 0);
        const diff = winnerLevel - loserLevel;
        const k = 0.25;

        let winnerChange = k * (1 - 1 / (1 + Math.exp(-diff)));
        let loserChange = -winnerChange * 0.8;

        if (diff > 1 && winnerDoc.internalLevel > loser.internalLevel) {
            winnerChange *= 0.2;
            loserChange *= 0.2;
        }

        winnerDoc.internalLevel = Math.max(
            0,
            winnerDoc.internalLevel + winnerChange
        );
        loser.internalLevel = Math.max(
            0,
            loser.internalLevel + loserChange
        );

        if (!winnerDoc.adjustmentHistory)
            winnerDoc.adjustmentHistory = [];
        if (!loser.adjustmentHistory)
            loser.adjustmentHistory = [];

        winnerDoc.adjustmentHistory.push({
            roundNumber: match.round,
            change: winnerChange,
            currentRank: winnerDoc.ranking,
            reason: `Gana contra ${loser.name}`,
        });

        loser.adjustmentHistory.push({
            roundNumber: match.round,
            change: loserChange,
            currentRank: loser.ranking,
            reason: `Pierde contra ${winnerDoc.name}`,
        });

        await winnerDoc.save();
        await loser.save();

        // ----------------------------------------------
        //   ROUND UPDATE
        // ----------------------------------------------

        await Round.updateOne(
            { roundNumber: match.round },
            {
                $addToSet: {
                    winners: winner._id,
                    players: {
                        $each: [match.player1._id, match.player2._id],
                    },
                },
            }
        );

        const matchesInRound = await Match.find({
            round: match.round,
        });
        const allCompleted = matchesInRound.every((m) => m.completed);

        if (allCompleted) {
            await Round.updateOne(
                { roundNumber: match.round },
                { completed: true }
            );
        }

        // -------------------------------------------------------
        // 🔄 FINAL FIX: REGENERAR RANKING GLOBAL SIN DUPLICADOS
        // -------------------------------------------------------

        const allPlayers = await Player.find().sort({ ranking: 1 });

        for (let i = 0; i < allPlayers.length; i++) {
            allPlayers[i].ranking = i + 1; // Ranking consecutivo
            await allPlayers[i].save();
        }

        // ----------------------------------------------
        //   RESPONSE
        // ----------------------------------------------

        res.status(201).json({
            message: "Match completed, winner saved and ranking updated",
            matchId: match._id,
            matchRound: match.round,
            winner: `${winnerDoc.name} ${winnerDoc.lastName}`,
            newRankingWinner: winnerDoc.ranking,
            newRankingLoser: loser.ranking,
            sets,
            roundsCompleted: allCompleted,
        });

    } catch (error) {
        console.log(error);
        res
            .status(500)
            .json({ error: "Internal error updating match result" });
    }
};

export const generateNextRound = async (req, res) => {
  try {
    // ----------------------------------------------
    // VALIDAR START DATE
    // ----------------------------------------------
    const { startDate } = req.body || {};

    if (!startDate)
      return res.status(400).json({ error: "Start date is required" });

    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // No puede ser antes de hoy
    if (start < today)
      return res
        .status(400)
        .json({ error: "Start date must not be earlier than today" });

    // Debe ser lunes
    if (start.getDay() !== 1)
      return res
        .status(400)
        .json({ error: "Start date must be a Monday" });

    // ----------------------------------------------
    // OBTENER ÚLTIMA RONDA
    // ----------------------------------------------
    const latestRound = await Round.findOne().sort({ roundNumber: -1 });

    if (!latestRound)
      return res.status(400).json({ error: "Round does not exist" });

    if (!latestRound.completed)
      return res
        .status(400)
        .json({ error: "Last round has not been completed" });

    // startDate NO puede ser antes ni igual a latestRound.endDate
    const lastEnd = new Date(latestRound.endDate);
    lastEnd.setHours(0, 0, 0, 0);

    if (start <= lastEnd)
      return res.status(400).json({
        error: "Start date must be after the previous round's end date",
      });

    const nextRoundNumber = latestRound.roundNumber + 1;

    // ----------------------------------------------
    // JUGADORES ACTIVOS
    // ----------------------------------------------
    const returningPlayers = await Player.find({
      _id: { $in: latestRound.players },
      active: true,
    });

    const newEligilePlayers = await Player.find({
      active: true,
      joinedRound: { $lte: nextRoundNumber },
      _id: { $nin: latestRound.players },
    });

    const playerMap = new Map();

    for (const p of [...returningPlayers, ...newEligilePlayers]) {
      playerMap.set(p._id.toString(), p);
    }

    const players = Array.from(playerMap.values());

    if (players.length < 10)
      return res.status(400).json({
        error: "There are not enough active players to start new round min(10)",
      });

    // ----------------------------------------------
    // EVITAR REPETICIONES
    // ----------------------------------------------
    const previousMatches = await Match.find({});
    const previousPairs = new Set(
      previousMatches
        .map((m) => [
          `${m.player1.toString()}-${m.player2.toString()}`,
          `${m.player2.toString()}-${m.player1.toString()}`,
        ])
        .flat()
    );

    const recentMatches = await Match.find({})
      .sort({ round: -1 })
      .limit(40);

    const recentPairs = new Set(
      recentMatches
        .map((m) => [
          `${m.player1.toString()}-${m.player2.toString()}`,
          `${m.player2.toString()}-${m.player1.toString()}`,
        ])
        .flat()
    );

    // ----------------------------------------------
    // ORDENAR
    // ----------------------------------------------
    const sorted = [...players].sort(
      (a, b) => a.ranking - b.ranking || b.internalLevel - a.internalLevel
    );

    let available = [...sorted];
    const matches = [];

    // ----------------------------------------------
    // EMPAREJAMIENTO
    // ----------------------------------------------
    while (available.length > 1) {
      const player1 = available.shift();

      let bestMatchIndex = -1;
      let bestDiff = Infinity;

      for (let i = 0; i < available.length; i++) {
        const p2 = available[i];
        const k1 = `${player1._id}-${p2._id}`;
        const k2 = `${p2._id}-${player1._id}`;

        if (!previousPairs.has(k1) && !previousPairs.has(k2)) {
          const diff = Math.abs(player1.internalLevel - p2.internalLevel);
          if (diff < bestDiff) {
            bestDiff = diff;
            bestMatchIndex = i;
          }
        }
      }

      if (bestMatchIndex === -1) {
        for (let i = 0; i < available.length; i++) {
          const p2 = available[i];
          const k1 = `${player1._id}-${p2._id}`;
          const k2 = `${p2._id}-${player1._id}`;

          if (!recentPairs.has(k1) && !recentPairs.has(k2)) {
            const diff = Math.abs(player1.internalLevel - p2.internalLevel);
            if (diff < bestDiff) {
              bestDiff = diff;
              bestMatchIndex = i;
            }
          }
        }
      }

      if (bestMatchIndex === -1) {
        let worstDiff = -Infinity;

        for (let i = 0; i < available.length; i++) {
          const p2 = available[i];
          const diff = Math.abs(player1.internalLevel - p2.internalLevel);

          if (diff > worstDiff) {
            worstDiff = diff;
            bestMatchIndex = i;
          }
        }
      }

      const player2 = available.splice(bestMatchIndex, 1)[0];

      matches.push({
        round: nextRoundNumber,
        player1: player1._id,
        player2: player2._id,
        utrDifference: Math.abs(player1.internalLevel - player2.internalLevel),
        isBye: false,
      });
    }

    if (available.length === 1) {
      const lastRemaining = available[0];

      matches.push({
        round: nextRoundNumber,
        player1: lastRemaining._id,
        player2: lastRemaining._id,
        utrDifference: 0,
        isBye: true,
        completed: true,
        winner: lastRemaining._id,
      });
    }

    // ----------------------------------------------
    // GENERAR END DATE (DOMINGO)
    // ----------------------------------------------
    const end = new Date(start);
    end.setDate(start.getDate() + 14);

    const day = end.getDay(); // 0 = domingo

    if (day !== 0) {
      end.setDate(end.getDate() + (7 - day));
    }

    end.setHours(23, 59, 59, 999);

    // ----------------------------------------------
    // GUARDAR
    // ----------------------------------------------
    const savedMatches = await Match.insertMany(matches);

    await Round.create({
      roundNumber: nextRoundNumber,
      totalMatches: savedMatches.length,
      completed: false,
      winners: [],
      startDate: start,
      endDate: end,
    });

    res.status(201).json({
      message: `Ronda ${nextRoundNumber} generada correctamente`,
      totalPlayers: sorted.length,
      newPlayersAdded: newEligilePlayers.map((p) => p.name),
      totalMatches: savedMatches.length,
      matches: savedMatches,
    });

  } catch (error) {
    console.error("Error al generar siguiente ronda:", error);
    res.status(500).json({ error: error.message });
  }
};


export const currentMatches = async(req, res) =>{
        try {

        const matches = await Match.find({completed: false}).select("")
            .populate("player1", "name lastName")
            .populate("player2", "name lastName")
            .populate("winner", "name lastName")

        res.status(200).json({
            matches
        })
        
    } catch (error) {
       console.log(error)
       res.status(500).json({error: "Error leyendo las partidas"}) 
    }
}

export const allMatches = async(req, res) =>{
    try {

        const matches = await Match.find().select()
            .populate("player1", "name lastName ranking contactNumber -_id")
            .populate("player2", "name lastName ranking contactNumber -_id")
            .populate("winner", "name lastName -_id")

        res.status(200).json({
            matches
        })
        
    } catch (error) {
       console.log(error)
       res.status(500).json({error: "Error leyendo las partidas"}) 
    }
}

export const updateRoundEndDate = async(req, res) =>{
    try {

        const {id} = req.params;
        const {endDate} = req.body;

        const round = await Round.findOne({_id: id, completed: false})

        if(!endDate) return res.status(400).json({error: "End date is required for updating the round"});
        if(!round) return res.status(400).json({error: "Round end date not found"});
        
        const roundEndDate= new Date(round.endDate);
        const newEndDate = new Date(endDate);   

        if(newEndDate <= roundEndDate ) return res.status(400).json({error: "End date must be after current round end date"});

        round.endDate = newEndDate;

        await round.save();

        return res.status(200).json(round);

    } catch (error) {
        console.log(error)
        res.status(500).json({error: "End date cannot be updated"})
    }
}


