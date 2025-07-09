import { useState, useCallback, useEffect } from 'react';

const containerStyle = {
  width: '100%',
  height: '400px'
};

const defaultCenter = {
  lat: -26.2041,
  lng: 28.0473
};

type Props = {
  onLocationSelect?: (location: { lat: number; lng: number }) => void;
  initialLocation?: { lat: number; lng: number };
  readOnly?: boolean;
};

let scriptPromise: Promise<void> | null = null;

const loadGoogleMapsScript = () => {
  if (scriptPromise) return scriptPromise;
  
  scriptPromise = new Promise((resolve) => {
    if (window.google && window.google.maps) {
      resolve();
      return;
    }

    window.initMap = () => {
      if (!import.meta.env.VITE_GOOGLE_MAPS_API_KEY) {
        throw new Error('Missing Google Maps API key. Please check your .env file.');
      }
      window.googleMapsLoaded = true;
      resolve();
    };

    const script = document.createElement('script');
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=initMap`;
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);
  });

  return scriptPromise;
};

export default function Map({ onLocationSelect, initialLocation, readOnly = false }: Props) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [mapInstance, setMapInstance] = useState<google.maps.Map | null>(null);
  const [marker, setMarker] = useState<{ lat: number; lng: number } | null>(
    initialLocation || null
  );

  useEffect(() => {
    loadGoogleMapsScript().then(() => {
      setIsLoaded(true);
    });
  }, []);

  const onLoad = useCallback((map: google.maps.Map) => {
    setMapInstance(map);
  }, []);

  const onUnmount = useCallback(() => {
    setMapInstance(null);
  }, []);

  const handleMapClick = useCallback((e: google.maps.MapMouseEvent) => {
    if (readOnly || !e.latLng) return;

    const newLocation = {
      lat: e.latLng.lat(),
      lng: e.latLng.lng()
    };

    setMarker(newLocation);
    onLocationSelect?.(newLocation);
  }, [onLocationSelect, readOnly]);

  if (!isLoaded) {
    return <div>Loading map...</div>;
  }

  return (
    <div id="map" style={containerStyle}>
      {isLoaded && mapInstance && (
        <google.maps.Map
          mapContainerStyle={containerStyle}
          center={marker || initialLocation || defaultCenter}
          zoom={12}
          onLoad={onLoad}
          onUnmount={onUnmount}
          onClick={handleMapClick}
          options={{
            zoomControl: true,
            streetViewControl: false,
            mapTypeControl: false,
            fullscreenControl: false
          }}
        >
          {marker && (
            <google.maps.Marker
              position={marker}
              draggable={!readOnly}
              onDragEnd={(e) => {
                if (e.latLng) {
                  const newLocation = {
                    lat: e.latLng.lat(),
                    lng: e.latLng.lng()
                  };
                  setMarker(newLocation);
                  onLocationSelect?.(newLocation);
                }
              }}
            />
          )}
        </google.maps.Map>
      )}
    </div>
  );
}