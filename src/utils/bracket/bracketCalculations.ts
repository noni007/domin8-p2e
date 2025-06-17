
export const calculateBracketStructure = (participantCount: number) => {
  const nextPowerOf2 = Math.pow(2, Math.ceil(Math.log2(participantCount)));
  const rounds = Math.log2(nextPowerOf2);
  const firstRoundMatches = Math.ceil(participantCount / 2);
  
  return {
    nextPowerOf2,
    rounds,
    firstRoundMatches
  };
};

export const calculateNextMatchPosition = (currentRound: number, bracketPosition: number) => {
  const nextRound = currentRound + 1;
  const nextPosition = Math.floor(bracketPosition / 2);
  
  return {
    nextRound,
    nextPosition
  };
};

export const isPlayer1Slot = (bracketPosition: number): boolean => {
  return bracketPosition % 2 === 0;
};
