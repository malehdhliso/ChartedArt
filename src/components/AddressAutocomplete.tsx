import { useEffect, useRef, useState } from 'react';

type ShippingAddress = {
  street: string;
  suburb: string;
  city: string;
  province: string;
  postal_code: string;
};

type Props = {
  onAddressSelect: (address: ShippingAddress) => void;
  defaultValue?: string;
};

let scriptPromise: Promise<void> | null = null;
let scriptLoaded = false;

const loadGoogleMapsScript = () => {
  if (scriptPromise) return scriptPromise;
  if (scriptLoaded) return Promise.resolve();
  
  scriptPromise = new Promise((resolve) => {
    if (window.google?.maps) {
      scriptLoaded = true;
      resolve();
      return;
    }

    window.initMap = () => {
      if (!import.meta.env.VITE_GOOGLE_MAPS_API_KEY) {
        throw new Error('Missing Google Maps API key. Please check your .env file.');
      }
      scriptLoaded = true;
      resolve();
    };

    const script = document.createElement('script');
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=initMap`;
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);
  });

  return scriptPromise;
};

export default function AddressAutocomplete({ onAddressSelect, defaultValue }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const initAutocomplete = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        await loadGoogleMapsScript();

        if (!mounted || !inputRef.current) return;

        if (autocompleteRef.current) {
          google.maps.event.clearInstanceListeners(autocompleteRef.current);
        }

        const autocomplete = new window.google.maps.places.Autocomplete(inputRef.current, {
          componentRestrictions: { country: 'za' },
          fields: ['address_components', 'formatted_address'],
          types: ['address']
        });

        autocompleteRef.current = autocomplete;

        autocomplete.addListener('place_changed', () => {
          const place = autocomplete.getPlace();
          
          if (!place.address_components) {
            console.warn('No address components found in place result');
            return;
          }

          const addressData: ShippingAddress = {
            street: '',
            suburb: '',
            city: '',
            province: '',
            postal_code: ''
          };

          place.address_components.forEach(component => {
            const type = component.types[0];
            
            if (type === 'street_number') {
              addressData.street = component.long_name;
            }
            else if (type === 'route') {
              addressData.street += (addressData.street ? ' ' : '') + component.long_name;
            }
            else if (type === 'sublocality_level_1') {
              addressData.suburb = component.long_name;
            }
            else if (type === 'locality') {
              addressData.city = component.long_name;
            }
            else if (type === 'administrative_area_level_1') {
              addressData.province = component.long_name;
            }
            else if (type === 'postal_code') {
              addressData.postal_code = component.long_name;
            }
          });

          onAddressSelect(addressData);
        });

        setIsLoading(false);
      } catch (error) {
        console.error('Error initializing Google Maps:', error);
        setError('Failed to load address autocomplete. Please try again later.');
        setIsLoading(false);
      }
    };

    initAutocomplete();

    return () => {
      mounted = false;
      if (autocompleteRef.current) {
        google.maps.event.clearInstanceListeners(autocompleteRef.current);
      }
    };
  }, [onAddressSelect]);

  return (
    <div className="relative">
      <input
        ref={inputRef}
        type="text"
        defaultValue={defaultValue}
        placeholder="Enter your address"
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sage-400 focus:border-transparent"
        disabled={isLoading}
      />
      {isLoading && (
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-sage-400"></div>
        </div>
      )}
      {error && (
        <p className="mt-2 text-sm text-red-500">{error}</p>
      )}
    </div>
  );
}