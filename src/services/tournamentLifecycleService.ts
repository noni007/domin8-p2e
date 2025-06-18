
import { TournamentStatusService } from './tournament/tournamentStatusService';
import { TournamentBracketService } from './tournament/tournamentBracketService';
import { TournamentRefundService } from './tournament/tournamentRefundService';

export class TournamentLifecycleService {
  static async startTournament(tournamentId: string): Promise<void> {
    return TournamentStatusService.startTournament(tournamentId);
  }

  static async generateBracket(tournamentId: string): Promise<void> {
    return TournamentBracketService.generateBracket(tournamentId);
  }

  static async completeTournament(tournamentId: string, winnerId: string): Promise<void> {
    return TournamentStatusService.completeTournament(tournamentId, winnerId);
  }

  static async cancelTournament(tournamentId: string): Promise<void> {
    return TournamentRefundService.cancelTournament(tournamentId);
  }

  static async getNextMatches(tournamentId: string) {
    return TournamentBracketService.getNextMatches(tournamentId);
  }

  static async checkTournamentCompletion(tournamentId: string): Promise<boolean> {
    return TournamentStatusService.checkTournamentCompletion(tournamentId);
  }
}
