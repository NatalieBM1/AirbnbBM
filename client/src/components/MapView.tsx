import { useEffect, useRef, useState } from "react";
import { Property } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { ZoomIn, ZoomOut, RotateCcw } from "lucide-react";

interface MapViewProps {
  properties: Property[];
  onMarkerClick?: (propertyId: string) => void;
  selectedPropertyId?: string;
}

export default function MapView({ properties, onMarkerClick, selectedPropertyId }: MapViewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [mapCenter, setMapCenter] = useState({ lat: 4.5709, lng: -74.2973 }); // Colombia center
  const [zoom, setZoom] = useState(6);
  const [tooltip, setTooltip] = useState<{ property: Property; x: number; y: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });

  // Convert lat/lng to canvas coordinates  
  const latLngToPixel = (lat: number, lng: number, canvasWidth: number, canvasHeight: number) => {
    const x = ((lng - mapCenter.lng) * zoom * 5) + (canvasWidth / 2);
    const y = (canvasHeight / 2) - ((lat - mapCenter.lat) * zoom * 5);
    return { x, y };
  };

  // Convert pixel to lat/lng
  const pixelToLatLng = (x: number, y: number, canvasWidth: number, canvasHeight: number) => {
    const lng = mapCenter.lng + ((x - canvasWidth / 2) / (zoom * 5));
    const lat = mapCenter.lat + ((canvasHeight / 2 - y) / (zoom * 5));
    return { lat, lng };
  };

  // Draw the map
  const drawMap = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const { width, height } = canvas;

    // Create ocean gradient background
    const oceanGradient = ctx.createLinearGradient(0, 0, 0, height);
    oceanGradient.addColorStop(0, '#1e3a8a'); // Deep blue top
    oceanGradient.addColorStop(0.5, '#3b82f6'); // Medium blue middle
    oceanGradient.addColorStop(1, '#1e40af'); // Darker blue bottom
    ctx.fillStyle = oceanGradient;
    ctx.fillRect(0, 0, width, height);

    // Add subtle wave pattern
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;
    for (let i = 0; i < width; i += 40) {
      for (let j = 0; j < height; j += 40) {
        ctx.beginPath();
        ctx.arc(i, j, 2, 0, 2 * Math.PI);
        ctx.stroke();
      }
    }

    // Draw Colombia landmass with gradient and shadow
    const landGradient = ctx.createRadialGradient(width/2, height/2, 0, width/2, height/2, Math.max(width, height)/2);
    landGradient.addColorStop(0, '#22c55e'); // Bright green center
    landGradient.addColorStop(0.6, '#16a34a'); // Medium green
    landGradient.addColorStop(1, '#15803d'); // Dark green edges
    
    // Improved Colombia outline with more detail
    const colombiaOutline = [
      { lat: 12.6, lng: -81.7 }, // San Andrés
      { lat: 12.1, lng: -71.3 }, // Guajira tip
      { lat: 11.2, lng: -72.2 }, // Guajira
      { lat: 10.9, lng: -74.8 }, // Barranquilla
      { lat: 10.4, lng: -75.5 }, // Cartagena
      { lat: 9.8, lng: -75.8 },  // Córdoba
      { lat: 8.8, lng: -76.3 },  // Antioquia coast
      { lat: 7.9, lng: -77.1 },  // Chocó north
      { lat: 6.8, lng: -77.7 },  // Chocó
      { lat: 5.9, lng: -77.3 },  // Valle
      { lat: 4.2, lng: -77.8 },  // Cauca
      { lat: 2.1, lng: -78.2 },  // Nariño
      { lat: 0.8, lng: -77.9 },  // Putumayo
      { lat: -1.0, lng: -69.9 }, // Amazonas south
      { lat: -0.5, lng: -68.1 }, // Amazonas east
      { lat: 1.2, lng: -66.8 },  // Vaupés
      { lat: 2.8, lng: -67.2 },  // Guainía
      { lat: 4.2, lng: -67.7 },  // Vichada
      { lat: 6.1, lng: -67.1 },  // Casanare
      { lat: 7.4, lng: -68.8 },  // Arauca
      { lat: 8.6, lng: -71.6 },  // Norte Santander
      { lat: 10.8, lng: -73.2 }, // Cesar
    ];

    // Draw shadow first
    ctx.save();
    ctx.translate(3, 3);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.beginPath();
    colombiaOutline.forEach((point, index) => {
      const pixel = latLngToPixel(point.lat, point.lng, width, height);
      if (index === 0) {
        ctx.moveTo(pixel.x, pixel.y);
      } else {
        ctx.lineTo(pixel.x, pixel.y);
      }
    });
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // Draw main landmass
    ctx.fillStyle = landGradient;
    ctx.strokeStyle = '#16a34a';
    ctx.lineWidth = 2;
    ctx.beginPath();
    colombiaOutline.forEach((point, index) => {
      const pixel = latLngToPixel(point.lat, point.lng, width, height);
      if (index === 0) {
        ctx.moveTo(pixel.x, pixel.y);
      } else {
        ctx.lineTo(pixel.x, pixel.y);
      }
    });
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Add subtle highlight on landmass
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Draw property markers with modern design
    properties.forEach((property) => {
      const lat = parseFloat(property.latitude || '0');
      const lng = parseFloat(property.longitude || '0');
      
      if (isNaN(lat) || isNaN(lng)) return;

      const { x, y } = latLngToPixel(lat, lng, width, height);
      
      // Skip if marker is outside visible canvas
      if (x < -50 || x > width + 50 || y < -50 || y > height + 50) return;

      const isSelected = selectedPropertyId === property.id;
      const markerSize = isSelected ? 24 : 18;
      
      // Draw marker shadow
      ctx.save();
      ctx.translate(2, 2);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
      ctx.beginPath();
      ctx.arc(x, y, markerSize + 2, 0, 2 * Math.PI);
      ctx.fill();
      ctx.restore();

      // Create marker gradient
      const markerGradient = ctx.createRadialGradient(x, y, 0, x, y, markerSize);
      if (isSelected) {
        markerGradient.addColorStop(0, '#fef2f2');
        markerGradient.addColorStop(0.7, '#ef4444');
        markerGradient.addColorStop(1, '#dc2626');
      } else {
        markerGradient.addColorStop(0, '#ffffff');
        markerGradient.addColorStop(0.7, '#ff385c');
        markerGradient.addColorStop(1, '#e11d48');
      }
      
      // Draw main marker circle
      ctx.fillStyle = markerGradient;
      ctx.strokeStyle = isSelected ? '#991b1b' : '#be123c';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(x, y, markerSize, 0, 2 * Math.PI);
      ctx.fill();
      ctx.stroke();

      // Add inner glow
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(x, y, markerSize - 3, 0, 2 * Math.PI);
      ctx.stroke();

      // Draw price text with better typography
      ctx.fillStyle = isSelected ? '#ffffff' : '#7f1d1d';
      ctx.font = `bold ${isSelected ? '13px' : '11px'} -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Inter", sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      const price = `$${Math.floor(parseFloat(property.pricePerNight))}`;
      
      // Add text shadow
      ctx.save();
      ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
      ctx.fillText(price, x + 1, y + 1);
      ctx.restore();
      
      // Draw main text
      ctx.fillStyle = isSelected ? '#ffffff' : '#ffffff';
      ctx.fillText(price, x, y);

      // Store marker bounds for interaction
      (property as any)._markerBounds = { 
        x: x - markerSize - 2, 
        y: y - markerSize - 2, 
        width: (markerSize + 2) * 2, 
        height: (markerSize + 2) * 2 
      };
    });
  };

  // Handle canvas click
  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (isDragging) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const clickY = event.clientY - rect.top;

    // Check if click is on a marker
    const clickedProperty = properties.find(property => {
      const bounds = (property as any)._markerBounds;
      if (!bounds) return false;
      const { x, y, width, height } = bounds;
      return clickX >= x && clickX <= x + width && 
             clickY >= y && clickY <= y + height;
    });

    if (clickedProperty && onMarkerClick) {
      onMarkerClick(clickedProperty.id);
    }
  };

  // Handle mouse events for dragging and tooltips
  const handleCanvasMouseDown = (event: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDragging(true);
    setLastMousePos({ x: event.clientX, y: event.clientY });
  };

  const handleCanvasMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    if (isDragging) {
      const deltaX = event.clientX - lastMousePos.x;
      const deltaY = event.clientY - lastMousePos.y;
      
      const latDelta = deltaY / (zoom * 5);
      const lngDelta = -deltaX / (zoom * 5);
      
      setMapCenter(prev => ({
        lat: prev.lat + latDelta,
        lng: prev.lng + lngDelta
      }));
      
      setLastMousePos({ x: event.clientX, y: event.clientY });
      return;
    }

    // Check for tooltip
    const hoveredProperty = properties.find(property => {
      const bounds = (property as any)._markerBounds;
      if (!bounds) return false;
      const { x, y, width, height } = bounds;
      return mouseX >= x && mouseX <= x + width && 
             mouseY >= y && mouseY <= y + height;
    });

    if (hoveredProperty) {
      setTooltip({
        property: hoveredProperty,
        x: mouseX,
        y: mouseY
      });
      canvas.style.cursor = 'pointer';
    } else {
      setTooltip(null);
      canvas.style.cursor = isDragging ? 'grabbing' : 'grab';
    }
  };

  const handleCanvasMouseUp = () => {
    setIsDragging(false);
  };

  // Zoom and reset functions
  const handleZoomIn = () => setZoom(prev => Math.min(prev * 1.4, 25));
  const handleZoomOut = () => setZoom(prev => Math.max(prev / 1.4, 3));
  const handleResetView = () => {
    setMapCenter({ lat: 4.5709, lng: -74.2973 });
    setZoom(6);
  };

  // Auto-center on properties when they change
  useEffect(() => {
    if (properties.length > 0) {
      const validProps = properties.filter(p => 
        p.latitude && p.longitude && 
        !isNaN(parseFloat(p.latitude)) && !isNaN(parseFloat(p.longitude))
      );
      
      if (validProps.length > 0) {
        const avgLat = validProps.reduce((sum, p) => sum + parseFloat(p.latitude!), 0) / validProps.length;
        const avgLng = validProps.reduce((sum, p) => sum + parseFloat(p.longitude!), 0) / validProps.length;
        setMapCenter({ lat: avgLat, lng: avgLng });
      }
    }
  }, [properties]);

  // Redraw when anything changes
  useEffect(() => {
    drawMap();
  }, [properties, mapCenter, zoom, selectedPropertyId]);

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden relative shadow-lg" data-testid="map-container">
      <div className="relative">
        <canvas
          ref={canvasRef}
          width={1000}
          height={600}
          onClick={handleCanvasClick}
          onMouseDown={handleCanvasMouseDown}
          onMouseMove={handleCanvasMouseMove}
          onMouseUp={handleCanvasMouseUp}
          onMouseLeave={() => {
            setTooltip(null);
            setIsDragging(false);
          }}
          className="block w-full h-auto cursor-grab active:cursor-grabbing"
          data-testid="map-canvas"
        />
        
        {/* Map Controls */}
        <div className="absolute top-4 right-4 flex flex-col space-y-2">
          <button
            onClick={handleZoomIn}
            className="w-10 h-10 bg-white hover:bg-gray-50 border border-gray-300 rounded-lg shadow-md flex items-center justify-center transition-all duration-200 hover:shadow-lg"
            data-testid="zoom-in-btn"
            title="Acercar"
          >
            <ZoomIn className="h-4 w-4 text-gray-600" />
          </button>
          <button
            onClick={handleZoomOut}
            className="w-10 h-10 bg-white hover:bg-gray-50 border border-gray-300 rounded-lg shadow-md flex items-center justify-center transition-all duration-200 hover:shadow-lg"
            data-testid="zoom-out-btn"
            title="Alejar"
          >
            <ZoomOut className="h-4 w-4 text-gray-600" />
          </button>
          <button
            onClick={handleResetView}
            className="w-10 h-10 bg-white hover:bg-gray-50 border border-gray-300 rounded-lg shadow-md flex items-center justify-center transition-all duration-200 hover:shadow-lg"
            data-testid="reset-view-btn"
            title="Centrar en Colombia"
          >
            <RotateCcw className="h-4 w-4 text-gray-600" />
          </button>
        </div>

        {/* Property Tooltip */}
        {tooltip && (
          <div 
            className="absolute bg-white border border-gray-200 rounded-xl p-4 shadow-2xl z-50 pointer-events-none max-w-sm backdrop-blur-sm"
            style={{
              left: Math.min(tooltip.x + 15, window.innerWidth - 280),
              top: tooltip.y - 120,
              background: 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
            }}
            data-testid="map-tooltip"
          >
            <div className="flex items-start justify-between mb-2">
              <h4 className="font-bold text-gray-900 text-sm leading-tight pr-2">{tooltip.property.title}</h4>
              <div className="flex items-center bg-green-100 px-2 py-1 rounded-full">
                <span className="text-green-800 text-xs font-semibold">⭐ {tooltip.property.rating}</span>
              </div>
            </div>
            
            <p className="text-xs text-gray-600 mb-2 flex items-center">
              <span className="mr-1">📍</span>
              {tooltip.property.location}
            </p>
            
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-1 text-xs text-gray-500">
                <span>👥 {tooltip.property.maxGuests}</span>
                <span>•</span>
                <span>🛏️ {tooltip.property.bedrooms}</span>
                <span>•</span>
                <span>🚿 {tooltip.property.bathrooms}</span>
              </div>
              <span className="text-xs text-gray-400">({tooltip.property.reviewCount} reseñas)</span>
            </div>
            
            <div className="border-t border-gray-100 pt-3">
              <div className="flex items-center justify-between">
                <span className="text-lg font-bold text-gray-900">
                  ${tooltip.property.pricePerNight}
                  <span className="text-sm font-normal text-gray-500">/noche</span>
                </span>
                <div className="flex items-center space-x-1">
                  {tooltip.property.amenities?.slice(0, 3).map((amenity, idx) => (
                    <span key={idx} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                      {amenity}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Map Legend */}
      <div className="p-4 border-t border-gray-200 bg-gradient-to-r from-gray-50 to-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-gradient-to-br from-white to-pink-500 rounded-full border-2 border-pink-600 shadow-sm"></div>
              <span className="text-gray-700 font-medium">Hospedajes ({properties.length})</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-gradient-to-br from-red-300 to-red-600 rounded-full border-2 border-red-700 shadow-sm"></div>
              <span className="text-gray-700 font-medium">Seleccionado</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-gradient-to-br from-green-400 to-green-600 rounded-sm"></div>
              <span className="text-gray-700 font-medium">Colombia</span>
            </div>
          </div>
          <div className="text-xs text-gray-500 bg-white px-3 py-1 rounded-full border border-gray-200">
            🖱️ Arrastra para navegar • 👆 Click para seleccionar
          </div>
        </div>
      </div>
    </div>
  );
}
