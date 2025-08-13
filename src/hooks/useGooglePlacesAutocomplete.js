import { useEffect, useRef } from 'react';

const useGooglePlacesAutocomplete = (onPlaceSelected, options = {}) => {
  const inputRef = useRef(null);

  useEffect(() => {
    let autocomplete;

    const initAutocomplete = () => {
      if (!inputRef.current || !window.google?.maps?.places) return;

      autocomplete = new window.google.maps.places.Autocomplete(inputRef.current, {
        types: ['address'],
        ...options,
      });

      if (onPlaceSelected) {
        autocomplete.addListener('place_changed', () => {
          const place = autocomplete.getPlace();
          onPlaceSelected(place);
        });
      }
    };

    const scriptId = 'google-maps-script';

    if (!window.google?.maps?.places) {
      let script = document.getElementById(scriptId);
      if (!script) {
        script = document.createElement('script');
        script.id = scriptId;
        script.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}&libraries=places&v=beta`;
        script.async = true;
        document.head.appendChild(script);
      }
      script.addEventListener('load', initAutocomplete);
    } else {
      initAutocomplete();
    }

    return () => {
      if (autocomplete) {
        window.google.maps.event.clearInstanceListeners(autocomplete);
      }
    };
  }, [onPlaceSelected]);

  return inputRef;
};

export default useGooglePlacesAutocomplete;
