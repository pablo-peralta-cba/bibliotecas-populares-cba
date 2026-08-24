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

    const markerColor = '#EA580C';

    const marker = new maptilersdk.Marker({ color: markerColor })
      .setLngLat([longitude, latitude])
      .setPopup(
        new maptilersdk.Popup({ offset: 25, className: 'lumina-popup' }).setHTML(
          `<div style="padding:8px;">
            <h3 style="font-weight:600;color:#1C1917;margin:0 0 4px;">${title || ''}</h3>
            ${locationText ? `<p style="color:#78716c;font-size:13px;margin:0;">${locationText}</p>` : ''}
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
