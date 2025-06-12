
import { Card, CardContent } from "@/components/ui/card";

export const BracketLoadingState = () => {
  return (
    <Card className="bg-black/40 border-blue-800/30 backdrop-blur-sm">
      <CardContent className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-600 rounded w-1/4"></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="h-20 bg-gray-600 rounded"></div>
            <div className="h-20 bg-gray-600 rounded"></div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
