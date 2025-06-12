
import { CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy } from "lucide-react";

export const BracketHeader = () => {
  return (
    <CardHeader>
      <CardTitle className="text-white flex items-center gap-2">
        <Trophy className="h-5 w-5" />
        Tournament Bracket
        <Badge className="bg-green-600 text-white text-xs">
          Live Updates
        </Badge>
      </CardTitle>
    </CardHeader>
  );
};
