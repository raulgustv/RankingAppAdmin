// REGAL: determinar quién ganó un set
const winnerOfSet = (p1, p2) => {
  if (p1 === null || p2 === null) return null;

  // 6-x siempre que x <= 4
  if (p1 === 6 && p2 <= 4) return "p1";
  if (p2 === 6 && p1 <= 4) return "p2";

  // 7-5 o 7-6
  if (p1 === 7 && (p2 === 5 || p2 === 6)) return "p1";
  if (p2 === 7 && (p1 === 5 || p1 === 6)) return "p2";

  return null;
};

export const validateTennisSets = (sets) => {
  // === VALIDACIÓN POR SET ===
  for (let i = 0; i < sets.length; i++) {
    const p1 = sets[i].player1Games;
    const p2 = sets[i].player2Games;

    if (p1 === null || p2 === null) continue;

    // Regla simple: NO puede existir 6–5 o 5–6
    if ((p1 === 6 && p2 === 5) || (p2 === 6 && p1 === 5)) {
      return `Set ${i + 1}: 6-5 or 5-6 is not a valid score`;
    }

    // Alguien debe llegar a 6 o 7
    if (p1 < 6 && p2 < 6) {
      return `Set ${i + 1}: 6 games must be played to win a set`;
    }

    // Si aparece un 7, debe ser 7-5 o 7-6
    if (p1 === 7 || p2 === 7) {
      if (!(
        (p1 === 7 && (p2 === 5 || p2 === 6)) ||
        (p2 === 7 && (p1 === 5 || p1 === 6))
      )) {
        return `Set ${i + 1}: 7 can only be allowed in a score: 7-5 o 7-6.`;
      }
    }

    // Prohibido 6–6
    if (p1 === 6 && p2 === 6) {
      return `Set ${i + 1}: 6-6 is not allowed, for a tie break add a 7-6`;
    }
  }

  // === VALIDACIÓN DEL TERCER SET ===
  const w1 = winnerOfSet(sets[0].player1Games, sets[0].player2Games);
  const w2 = winnerOfSet(sets[1].player1Games, sets[1].player2Games);
  const w3 = winnerOfSet(sets[2].player1Games, sets[2].player2Games);

  // Si Set 3 existe, debe haber sido 1–1
  const set3Filled =
    sets[2].player1Games !== null || sets[2].player2Games !== null;

  if (set3Filled) {
    if (!(w1 && w2 && w1 !== w2)) {
      return "Third set can only be played if two first sets are tied";
    }
  }

  // Si un jugador ganó los primeros dos sets → no debe existir set 3
  if (w1 && w2 && w1 === w2 && w3 !== null) {
    return "Two first sets are already won by one player, 3rd set cannot be allowed";
  }

  return null;
};
