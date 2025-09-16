import { useQuery } from "@tanstack/react-query";
import { propertyApi } from "@/services/api";
import PropertyCard from "@/components/PropertyCard";
import FilterBar from "@/components/FilterBar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export default function Home() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["/api/properties"],
    queryFn: () => propertyApi.getProperties(),
  });

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-4">Unable to load properties</h2>
          <p className="text-muted-foreground">Please try again later.</p>
        </div>
      </div>
    );
  }

  return (
    <main data-testid="home-page">
      <FilterBar />
      
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className="space-y-3">
                <Skeleton className="h-64 w-full rounded-xl" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-1/4" />
              </div>
            ))}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {data?.properties.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>

            {data?.properties.length === 0 && (
              <div className="text-center py-12">
                <h3 className="text-lg font-medium text-foreground mb-2">No properties found</h3>
                <p className="text-muted-foreground">Try adjusting your search criteria.</p>
              </div>
            )}

            {data?.properties && data.properties.length > 0 && (
              <div className="text-center mt-12">
                <Button 
                  variant="outline" 
                  className="px-8 py-3"
                  data-testid="button-load-more"
                >
                  Continue exploring amazing places
                </Button>
              </div>
            )}
          </>
        )}
      </section>
    </main>
  );
}
