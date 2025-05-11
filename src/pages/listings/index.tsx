
import { useListingsPage } from "@/hooks/listings/useListingsPage";
import MainLayout from "@/components/layout/MainLayout";
import { ListingContent } from "@/components/listings";
import { ListingFiltersContainer } from "@/components/listings/ListingFiltersContainer";

const ListingsPage = () => {
  const {
    listings,
    isLoading,
    error,
    totalCount,
    currentPage,
    pageSize,
    highestBids,
    handlePageChange,
    handleClearFilters,
    refetch
  } = useListingsPage();
  
  return (
    <MainLayout>
      <div className="container py-8">
        <h1 className="text-3xl font-bold mb-8">Browse Listings</h1>

        {/* Filters section */}
        <ListingFiltersContainer onClearFilters={handleClearFilters} />
        
        {/* Listings content */}
        <ListingContent
          listings={listings}
          isLoading={isLoading}
          error={error}
          totalCount={totalCount}
          pageSize={pageSize}
          currentPage={currentPage}
          highestBids={highestBids}
          onPageChange={handlePageChange}
          onRetry={refetch}
        />
      </div>
    </MainLayout>
  );
};

export default ListingsPage;
