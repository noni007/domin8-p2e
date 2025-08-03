
import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ActivityPaginationProps {
  currentPage: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  loading?: boolean;
}

export const ActivityPagination = ({
  currentPage,
  totalItems,
  itemsPerPage,
  onPageChange,
  loading = false
}: ActivityPaginationProps) => {
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const [visiblePages, setVisiblePages] = React.useState<number[]>([]);

  React.useEffect(() => {
    const generateVisiblePages = () => {
      const pages: number[] = [];
      const maxVisible = 5;
      
      if (totalPages <= maxVisible) {
        for (let i = 1; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        const start = Math.max(1, currentPage - 2);
        const end = Math.min(totalPages, start + maxVisible - 1);
        
        for (let i = start; i <= end; i++) {
          pages.push(i);
        }
        
        if (start > 1) {
          pages.unshift(1);
          if (start > 2) {
            pages.splice(1, 0, -1); // -1 represents ellipsis
          }
        }
        
        if (end < totalPages) {
          if (end < totalPages - 1) {
            pages.push(-1); // -1 represents ellipsis
          }
          pages.push(totalPages);
        }
      }
      
      setVisiblePages(pages);
    };

    generateVisiblePages();
  }, [currentPage, totalPages]);

  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center space-x-2 mt-6">
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1 || loading}
        className="bg-gray-800 border-gray-600 text-white hover:bg-gray-700"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      {visiblePages.map((page, index) => (
        page === -1 ? (
          <span key={`ellipsis-${index}`} className="text-gray-400 px-2">
            ...
          </span>
        ) : (
          <Button
            key={page}
            variant={currentPage === page ? "default" : "outline"}
            size="sm"
            onClick={() => onPageChange(page)}
            disabled={loading}
            className={
              currentPage === page
                ? "bg-blue-600 text-white"
                : "bg-gray-800 border-gray-600 text-white hover:bg-gray-700"
            }
          >
            {page}
          </Button>
        )
      ))}

      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages || loading}
        className="bg-gray-800 border-gray-600 text-white hover:bg-gray-700"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
};
