import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Home, Mountain, Waves, TreePine, Building, Flame, SlidersHorizontal, Map } from "lucide-react";

const categories = [
  { id: "pools", label: "Amazing pools", icon: Waves },
  { id: "cabins", label: "Cabins", icon: Mountain },
  { id: "beachfront", label: "Beachfront", icon: Waves },
  { id: "tiny-homes", label: "Tiny homes", icon: Home },
  { id: "treehouses", label: "Treehouses", icon: TreePine },
  { id: "design", label: "Design", icon: Building },
  { id: "trending", label: "Trending", icon: Flame },
];

export default function FilterBar() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  return (
    <section className="bg-background border-b border-border sticky top-20 z-30" data-testid="filter-bar">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        {/* Category Filters */}
        <div className="flex items-center space-x-6 overflow-x-auto scrollbar-hide mb-4">
          {categories.map((category) => {
            const IconComponent = category.icon;
            return (
              <Button
                key={category.id}
                variant="ghost"
                className={`flex flex-col items-center space-y-2 min-w-max px-4 py-3 ${
                  selectedCategory === category.id 
                    ? "text-foreground border-b-2 border-foreground" 
                    : "text-muted-foreground hover:text-foreground"
                }`}
                onClick={() => setSelectedCategory(
                  selectedCategory === category.id ? null : category.id
                )}
                data-testid={`button-category-${category.id}`}
              >
                <IconComponent className="h-5 w-5" />
                <span className="text-xs font-medium">{category.label}</span>
              </Button>
            );
          })}
        </div>
        
        {/* Controls */}
        <div className="flex justify-between items-center">
          <Button 
            variant="outline" 
            className="flex items-center space-x-2 rounded-lg"
            data-testid="button-filters"
          >
            <SlidersHorizontal className="h-4 w-4" />
            <span>Filters</span>
          </Button>
          
          <Button 
            asChild
            variant="outline"
            className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
            data-testid="button-show-map"
          >
            <Link href="/map">
              <Map className="h-4 w-4 mr-2" />
              Show map
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
