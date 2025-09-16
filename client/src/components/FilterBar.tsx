import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Home, Mountain, Waves, TreePine, Building, Flame, SlidersHorizontal, Map, Palmtree, Castle, Tent, Car } from "lucide-react";

interface Filters {
  priceRange: [number, number];
  propertyType: string;
  guests: string;
  bedrooms: string;
  amenities: string[];
}

interface FilterBarProps {
  filters?: Filters;
  onChange?: (filters: Filters) => void;
}

const categories = [
  { id: "all", label: "Todo", icon: Home },
  { id: "pools", label: "Piscinas increíbles", icon: Waves },
  { id: "cabins", label: "Cabañas", icon: Mountain },
  { id: "beachfront", label: "Frente al mar", icon: Palmtree },
  { id: "tiny-homes", label: "Casas pequeñas", icon: Home },
  { id: "treehouses", label: "Casas del árbol", icon: TreePine },
  { id: "design", label: "Diseño", icon: Building },
  { id: "trending", label: "Tendencia", icon: Flame },
  { id: "castles", label: "Castillos", icon: Castle },
  { id: "camping", label: "Camping", icon: Tent },
];

export default function FilterBar({ filters, onChange }: FilterBarProps) {
  const handleCategoryClick = (categoryId: string) => {
    if (onChange && filters) {
      onChange({
        ...filters,
        propertyType: categoryId
      });
    }
  };

  return (
    <section className="bg-white border-b border-gray-200 sticky top-20 z-30 shadow-sm" data-testid="filter-bar">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Category Filters */}
        <div className="flex items-center space-x-8 overflow-x-auto scrollbar-hide mb-6">
          {categories.map((category) => {
            const IconComponent = category.icon;
            const isSelected = filters?.propertyType === category.id;
            return (
              <button
                key={category.id}
                className={`flex flex-col items-center space-y-2 min-w-max px-4 py-4 rounded-lg transition-all duration-200 group hover:bg-gray-50 ${
                  isSelected 
                    ? "text-gray-900 bg-gray-50 border-b-2 border-black" 
                    : "text-gray-600 hover:text-gray-900"
                }`}
                onClick={() => handleCategoryClick(category.id)}
                data-testid={`button-category-${category.id}`}
              >
                <div className={`p-2 rounded-full transition-all duration-200 ${
                  isSelected 
                    ? "bg-red-100 text-red-600" 
                    : "bg-gray-100 text-gray-600 group-hover:bg-red-50 group-hover:text-red-500"
                }`}>
                  <IconComponent className="h-6 w-6" />
                </div>
                <span className={`text-xs font-medium transition-all duration-200 ${
                  isSelected ? "text-gray-900 font-semibold" : "text-gray-600 group-hover:text-gray-900"
                }`}>
                  {category.label}
                </span>
              </button>
            );
          })}
        </div>
        
        {/* Controls */}
        <div className="flex justify-between items-center">
          <button 
            className="flex items-center space-x-2 px-6 py-3 bg-white border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 shadow-sm hover:shadow-md"
            data-testid="button-filters"
          >
            <SlidersHorizontal className="h-4 w-4" />
            <span className="font-medium">Filtros</span>
          </button>
          
          <Link href="/map">
            <button className="flex items-center space-x-2 px-6 py-3 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-all duration-200 shadow-md hover:shadow-lg"
              data-testid="button-show-map"
            >
              <Map className="h-4 w-4" />
              <span className="font-medium">Mostrar mapa</span>
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
}
