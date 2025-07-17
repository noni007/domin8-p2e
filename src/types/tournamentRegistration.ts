
export interface RegistrationResult {
  success: boolean;
  message: string;
  requiresExternalAction?: boolean;
  transactionHash?: string;
}

export interface TournamentRegistrationParams {
  tournamentId: string;
  entryFee: number;
}

export interface WalletTransactionParams {
  walletId: string;
  userId: string;
  tournamentId: string;
  entryFee: number;
  description: string;
}
