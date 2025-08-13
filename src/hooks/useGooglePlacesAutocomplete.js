import { useEffect, useRef } from 'react';

const useGooglePlacesAutocomplete = (onPlaceSelected, options = {}) => {
  const inputRef = useRef(null);

  useEffect(() => {
    const initAutocomplete = () => {
      if (!inputRef.current || !window.google) return;

      const { maps } = window.google;

      // Prefer the new PlaceAutocompleteElement when available
      if (maps.places?.PlaceAutocompleteElement) {
        const element = new maps.places.PlaceAutocompleteElement();
        // Attach the web component to the existing input element
        element.inputElement = inputRef.current;
        // Apply options such as componentRestrictions
        Object.assign(element, { types: ['address'], ...options });

        element.addEventListener('gmpx-placechange', () => {
          const place = element.getPlace();
          onPlaceSelected && onPlaceSelected(place);
        });
      } else if (maps.places?.Autocomplete) {
        // Fallback to the older Autocomplete API
        const autocomplete = new maps.places.Autocomplete(inputRef.current, {
          types: ['address'],
          ...options,
        });
        autocomplete.addListener('place_changed', () => {
          const place = autocomplete.getPlace();
          onPlaceSelected && onPlaceSelected(place);
        });
      }
    };

    if (!window.google) {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}&libraries=places&v=beta`;
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
