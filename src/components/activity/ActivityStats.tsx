
interface ActivityStatsProps {
  totalItems: number;
  displayedItems: number;
  maxItems?: number;
}

export const ActivityStats = ({ totalItems, displayedItems, maxItems }: ActivityStatsProps) => {
  if (!maxItems || totalItems <= maxItems) return null;

  return (
    <div className="text-center pt-4">
      <p className="text-sm text-gray-400">
        Showing {Math.min(displayedItems, maxItems)} of {totalItems} activities
      </p>
    </div>
  );
};
