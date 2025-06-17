
import { Clock } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

type Tournament = Tables<'tournaments'>;

interface TournamentScheduleProps {
  tournament: Tournament;
}

export const TournamentSchedule = ({ tournament }: TournamentScheduleProps) => {
  return (
    <div className="p-4 bg-blue-900/20 rounded-lg border border-blue-800/30">
      <div className="flex items-center gap-2 mb-2">
        <Clock className="h-4 w-4 text-blue-400" />
        <h4 className="text-white font-semibold">Tournament Schedule</h4>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
        <div>
          <span className="text-gray-400">Registration Deadline:</span>
          <br />
          <span className="text-white">
            {new Date(tournament.registration_deadline).toLocaleString()}
          </span>
        </div>
        <div>
          <span className="text-gray-400">Tournament Start:</span>
          <br />
          <span className="text-white">
            {new Date(tournament.start_date).toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
};
