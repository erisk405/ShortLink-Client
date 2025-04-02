import React, { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

export interface LocationData {
  country: string;
  city: string;
  latitude: number;
  longitude: number;
  count: number;
}

interface SimpleMapProps {
  locations: LocationData[];
}

export const SimpleMap = ({ locations }: SimpleMapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);

  // ใส่ Mapbox Access Token ของคุณที่นี่
  mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_API;

  useEffect(() => {
    if (!mapContainer.current) return;

    // Initialize map
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12', // สามารถเปลี่ยน style ได้
      center: [0, 20], // เริ่มต้นที่จุดกึ่งกลางโลก
      zoom: 1.5,
    });

    // Add navigation control (zoom buttons)
    map.current.addControl(new mapboxgl.NavigationControl());

    // Cleanup on unmount
    return () => {
      map.current?.remove();
    };
  }, []);

  useEffect(() => {
    if (!map.current) return;

    // Remove existing markers
    document.querySelectorAll('.custom-marker').forEach(marker => marker.remove());

    // Add markers for each location
    locations.forEach((loc) => {
      const markerColor = loc.count >= 10 ? '#ef4444' : 
                        loc.count >= 5 ? '#f97316' : 
                        '#3b82f6';

      const markerSize = loc.count >= 10 ? 30 : 
                       loc.count >= 5 ? 24 : 
                       18;

      // Create custom marker element
      const el = document.createElement('div');
      el.className = 'custom-marker';
      el.style.backgroundColor = markerColor;
      el.style.width = `${markerSize}px`;
      el.style.height = `${markerSize}px`;
      el.style.borderRadius = '50%';
      el.style.cursor = 'pointer';
      el.style.display = 'flex';
      el.style.alignItems = 'center';
      el.style.justifyContent = 'center';
      el.style.color = 'white';
      el.style.fontSize = '12px';
      el.style.fontWeight = 'bold';
      el.innerHTML = `${loc.count}`;

      // Add popup
      const popup = new mapboxgl.Popup({ offset: 25 })
        .setHTML(`
          <div class="p-2">
            <h3 class="font-bold">${loc.city || 'Unknown'}, ${loc.country}</h3>
            <p>Clicks: ${loc.count}</p>
          </div>
        `);

      // Add marker to map
      new mapboxgl.Marker(el)
        .setLngLat([loc.longitude, loc.latitude])
        .setPopup(popup)
        .addTo(map.current!);

      // Auto-fit bounds
      const bounds = new mapboxgl.LngLatBounds();
      locations.forEach(loc => {
        bounds.extend([loc.longitude, loc.latitude]);
      });
      map.current?.fitBounds(bounds, { 
        padding: 50,
        maxZoom: 15,
        duration: 1000 
      });
    });
  }, [locations]);

  return (
    <div className="w-full h-96 rounded-md overflow-hidden relative">
      <div ref={mapContainer} className="w-full h-full" />
    </div>
  );
};

export default SimpleMap;