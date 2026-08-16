import { useRef, useEffect } from 'react';
import * as maptilersdk from '@maptiler/sdk';
import '@maptiler/sdk/dist/maptiler-sdk.css';

export default function ShowPageMap({
  coordinates,
  title,
  locationText,
  zoom = 12,
  className = '',
  ...props
}) {
  const mapContainer = useRef(null);
  const mapInstance = useRef(null);

  useEffect(() => {
    if (!mapContainer.current || !coordinates?.length) return;

    if (import.meta.env.VITE_MAPTILER_API_KEY) {
      maptilersdk.config.apiKey = import.meta.env.VITE_MAPTILER_API_KEY;
    }

    const [longitude, latitude] = coordinates;

    const map = new maptilersdk.Map({
      container: mapContainer.current,
      style: maptilersdk.MapStyle.BRIGHT,
      center: [longitude, latitude],
      zoom: zoom,
    });

    mapInstance.current = map;

    const marker = new maptilersdk.Marker()
      .setLngLat([longitude, latitude])
      .setPopup(
        new maptilersdk.Popup({ offset: 25 }).setHTML(
          `<div class="p-2">
            <h3 class="font-bold text-gray-900">${title || ''}</h3>
            ${locationText ? `<p class="text-gray-600 text-sm">${locationText}</p>` : ''}
          </div>`
        )
      )
      .addTo(map);

    return () => {
      marker.remove();
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, [coordinates, title, locationText, zoom]);

  return (
    <div
      ref={mapContainer}
      className={`w-full h-[400px] rounded-lg ${className}`}
      {...props}
    />
  );
}
