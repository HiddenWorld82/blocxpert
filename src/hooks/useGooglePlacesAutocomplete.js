import { useEffect, useRef } from 'react';

const useGooglePlacesAutocomplete = (onPlaceSelected, options = {}) => {
  const inputRef = useRef(null);

  useEffect(() => {
    const initAutocomplete = () => {
      if (!inputRef.current || !window.google) return;
      const autocomplete = new window.google.maps.places.Autocomplete(inputRef.current, {
        types: ['address'],
        ...options,
      });
      autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace();
        onPlaceSelected && onPlaceSelected(place);
      });
    };

    if (!window.google) {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}&libraries=places`;
      script.async = true;
      script.onload = initAutocomplete;
      document.head.appendChild(script);
    } else {
      initAutocomplete();
    }
  }, [onPlaceSelected, options]);

  return inputRef;
};

export default useGooglePlacesAutocomplete;
