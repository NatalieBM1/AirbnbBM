import { useEffect, useRef } from "react";
import { Property } from "@shared/schema";
import { MapMarker } from "@/lib/types";

interface MapViewProps {
  properties: Property[];
  onMarkerClick?: (propertyId: string) => void;
  selectedPropertyId?: string;
}

export default function MapView({ properties, onMarkerClick, selectedPropertyId }: MapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // This is a placeholder for map integration
    // In a real implementation, you would:
    // 1. Load Google Maps or Mapbox
    // 2. Initialize the map
    // 3. Add property markers
    // 4. Handle marker clicks
    
    console.log("Map would be initialized here with properties:", properties);
  }, [properties]);

  // Convert properties to map markers
  const markers: MapMarker[] = properties
    .filter(p => p.latitude && p.longitude)
    .map(p => ({
      id: p.id,
      latitude: parseFloat(p.latitude!),
      longitude: parseFloat(p.longitude!),
      price: p.pricePerNight,
      title: p.title,
    }));

  return (
    <div 
      ref={mapRef} 
      className="w-full h-full bg-gray-200 relative"
      data-testid="map-container"
    >
      {/* Map placeholder */}
      <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
        <div className="text-center">
          <div className="text-4xl mb-4">🗺️</div>
          <p className="text-lg font-medium">Interactive Map</p>
          <p className="text-sm">Integration with Google Maps/Mapbox API</p>
          <p className="text-xs mt-2">{markers.length} properties shown</p>
        </div>
      </div>
      
      {/* Property Markers with Price Overlays */}
      {markers.slice(0, 4).map((marker, index) => {
        const positions = [
          { top: "25%", left: "25%" },
          { top: "50%", right: "33%" },
          { bottom: "33%", left: "50%" },
          { top: "33%", right: "25%" },
        ];
        
        const position = positions[index] || positions[0];
        
        return (
          <div
            key={marker.id}
            className={`absolute bg-primary text-primary-foreground px-3 py-2 rounded-full text-sm font-semibold shadow-lg cursor-pointer hover:bg-primary/90 transition-colors ${
              selectedPropertyId === marker.id ? "ring-2 ring-white" : ""
            }`}
            style={position}
            onClick={() => onMarkerClick?.(marker.id)}
            data-testid={`marker-${marker.id}`}
          >
            ${Math.floor(parseFloat(marker.price))}
          </div>
        );
      })}
    </div>
  );
}
