
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/common/Skeleton";

export const TournamentCardSkeleton = () => {
  return (
    <Card className="bg-black/40 border-blue-800/30 backdrop-blur-sm">
      <CardContent className="p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex-1 space-y-3">
            <div className="flex items-center gap-3">
              <Skeleton className="h-6 w-48" />
              <Skeleton variant="button" className="h-6 w-20" />
            </div>
            <Skeleton variant="text" lines={2} />
            <div className="flex flex-wrap gap-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-4 w-20" />
              ))}
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Skeleton variant="button" className="w-24" />
            <Skeleton variant="button" className="w-32" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
