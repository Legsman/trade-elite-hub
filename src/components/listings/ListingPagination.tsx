
import React from "react";
import { 
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface ListingPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export const ListingPagination: React.FC<ListingPaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
}) => {
  if (totalPages <= 1) return null;
  
  return (
    <Pagination className="mt-8">
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            href={currentPage > 1 ? `?page=${currentPage - 1}` : undefined}
            onClick={(e) => {
              if (currentPage > 1) {
                e.preventDefault();
                onPageChange(currentPage - 1);
              }
            }}
          />
        </PaginationItem>
        
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNumber) => (
          <PaginationItem key={pageNumber}>
            {currentPage === pageNumber ? (
              <PaginationLink href={`?page=${pageNumber}`} isActive>
                {pageNumber}
              </PaginationLink>
            ) : (
              <PaginationLink 
                href={`?page=${pageNumber}`} 
                onClick={(e) => {
                  e.preventDefault();
                  onPageChange(pageNumber);
                }}
              >
                {pageNumber}
              </PaginationLink>
            )}
          </PaginationItem>
        ))}
        
        <PaginationItem>
          <PaginationNext
            href={currentPage < totalPages ? `?page=${currentPage + 1}` : undefined}
            onClick={(e) => {
              if (currentPage < totalPages) {
                e.preventDefault();
                onPageChange(currentPage + 1);
              }
            }}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
};
