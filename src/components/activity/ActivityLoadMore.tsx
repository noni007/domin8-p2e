
import { Button } from "@/components/ui/button";

interface ActivityLoadMoreProps {
  hasMorePersonal: boolean;
  hasMoreFriends: boolean;
  onLoadMorePersonal: () => void;
  onLoadMoreFriends: () => void;
}

export const ActivityLoadMore = ({
  hasMorePersonal,
  hasMoreFriends,
  onLoadMorePersonal,
  onLoadMoreFriends
}: ActivityLoadMoreProps) => {
  if (!hasMorePersonal && !hasMoreFriends) return null;

  return (
    <div className="flex gap-2 justify-center pt-4">
      {hasMorePersonal && (
        <Button
          variant="outline"
          size="sm"
          onClick={onLoadMorePersonal}
          className="bg-gray-800 border-gray-600 text-white hover:bg-gray-700"
        >
          Load More Personal
        </Button>
      )}
      {hasMoreFriends && (
        <Button
          variant="outline"
          size="sm"
          onClick={onLoadMoreFriends}
          className="bg-gray-800 border-gray-600 text-white hover:bg-gray-700"
        >
          Load More Friends
        </Button>
      )}
    </div>
  );
};
