import { useRef, useEffect } from 'react';
import * as maptilersdk from '@maptiler/sdk';
import '@maptiler/sdk/dist/maptiler-sdk.css';

export default function ClusterMap({
  data,
  apiKey,
  className = '',
  ...props
}) {
  const mapContainer = useRef(null);
  const mapInstance = useRef(null);

  useEffect(() => {
    if (!mapContainer.current || !data?.features?.length) return;

    if (apiKey) {
      maptilersdk.config.apiKey = apiKey;
    } else if (import.meta.env.VITE_MAPTILER_API_KEY) {
      maptilersdk.config.apiKey = import.meta.env.VITE_MAPTILER_API_KEY;
    }

    const map = new maptilersdk.Map({
      container: mapContainer.current,
      style: maptilersdk.MapStyle.BRIGHT,
      center: [-63.875738, -31.675234],
      zoom: 7,
    });

    mapInstance.current = map;

    map.on('load', () => {
      map.addSource('bibliotecas', {
        type: 'geojson',
        data: data,
        cluster: true,
        clusterMaxZoom: 14,
        clusterRadius: 50,
      });

      map.addLayer({
        id: 'clusters',
        type: 'circle',
        source: 'bibliotecas',
        filter: ['has', 'point_count'],
        paint: {
          'circle-color': [
            'step',
            ['get', 'point_count'],
            '#EA580C',
            10,
            '#A33900',
            30,
            '#1C1917',
          ],
          'circle-radius': ['step', ['get', 'point_count'], 18, 10, 24, 30, 30],
          'circle-stroke-width': 2,
          'circle-stroke-color': 'rgba(255, 255, 255, 0.8)',
        },
      });

      map.addLayer({
        id: 'cluster-count',
        type: 'symbol',
        source: 'bibliotecas',
        filter: ['has', 'point_count'],
        layout: {
          'text-field': '{point_count_abbreviated}',
          'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
          'text-size': 12,
        },
        paint: {
          'text-color': '#ffffff',
        },
      });

      map.addLayer({
        id: 'unclustered-point',
        type: 'circle',
        source: 'bibliotecas',
        filter: ['!', ['has', 'point_count']],
        paint: {
          'circle-color': '#EA580C',
          'circle-radius': 8,
          'circle-stroke-width': 2,
          'circle-stroke-color': '#fff',
        },
      });

      map.on('click', 'clusters', async (e) => {
        const features = map.queryRenderedFeatures(e.point, {
          layers: ['clusters'],
        });
        const clusterId = features[0].properties.cluster_id;
        const zoom = await map
          .getSource('bibliotecas')
          .getClusterExpansionZoom(clusterId);
        map.easeTo({
          center: features[0].geometry.coordinates,
          zoom,
        });
      });

      map.on('click', 'unclustered-point', (e) => {
        const { popUpMarkup } = e.features[0].properties;
        const coordinates = e.features[0].geometry.coordinates.slice();

        while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
          coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
        }

        new maptilersdk.Popup({ offset: 15 })
          .setLngLat(coordinates)
          .setHTML(popUpMarkup)
          .addTo(map);
      });

      map.on('mouseenter', 'clusters', () => {
        map.getCanvas().style.cursor = 'pointer';
      });

      map.on('mouseleave', 'clusters', () => {
        map.getCanvas().style.cursor = '';
      });

      map.on('mouseenter', 'unclustered-point', () => {
        map.getCanvas().style.cursor = 'pointer';
      });

      map.on('mouseleave', 'unclustered-point', () => {
        map.getCanvas().style.cursor = '';
      });
    });

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, [data, apiKey]);

  return (
    <div
      ref={mapContainer}
      className={`w-full h-[400px] rounded-xl ${className}`}
      {...props}
    />
  );
}
