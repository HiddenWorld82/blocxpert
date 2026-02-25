const toAbsoluteUrl = (url) => {
  if (!url) return null;

  try {
    return new URL(url, window.location.origin).toString();
  } catch (error) {
    console.warn('URL PDF invalide ignorée:', url, error);
    return null;
  }
};

const normalizeBaseUrl = (baseUrl) => {
  if (!baseUrl) return null;

  const absoluteUrl = toAbsoluteUrl(baseUrl.trim());
  if (!absoluteUrl) return null;

  return absoluteUrl.replace(/\/+$/, '');
};

const buildCandidateEndpointsFromBase = (baseUrl, { includeLegacyRoute = false } = {}) => {
  const normalizedBaseUrl = normalizeBaseUrl(baseUrl);
  if (!normalizedBaseUrl) return [];

  if (/\/api\/generate-pdf$/i.test(normalizedBaseUrl) || /\/generate-pdf$/i.test(normalizedBaseUrl)) {
    return [normalizedBaseUrl];
  }

  const candidates = [`${normalizedBaseUrl}/api/generate-pdf`];

  if (includeLegacyRoute) {
    candidates.push(`${normalizedBaseUrl}/generate-pdf`);
  }

  return candidates;
};

export const getPdfEndpointCandidates = () => {
  const explicitEndpoint =
    import.meta.env.VITE_PDF_ENDPOINT || import.meta.env.VITE_PDF_GENERATE_URL;

  const explicitUrl = toAbsoluteUrl(explicitEndpoint?.trim());
  if (explicitUrl) {
    return [explicitUrl];
  }

  const rawBaseUrls = [
    import.meta.env.VITE_PDF_URL,
    import.meta.env.VITE_API_BASE_URL,
    import.meta.env.VITE_API_URL,
    window.location.origin,
  ]
    .filter(Boolean)
    .map((baseUrl) => ({
      baseUrl,
      isWindowOrigin:
        normalizeBaseUrl(baseUrl) === normalizeBaseUrl(window.location.origin),
    }));

  const uniqueCandidates = [];

  rawBaseUrls.forEach(({ baseUrl, isWindowOrigin }) => {
    const candidates = buildCandidateEndpointsFromBase(baseUrl, {
      // Sur la même origine que le frontend, /generate-pdf est souvent une route SPA
      // qui renvoie index.html. On évite ce fallback trompeur par défaut.
      includeLegacyRoute: !isWindowOrigin,
    });
    candidates.forEach((candidate) => {
      if (candidate && !uniqueCandidates.includes(candidate)) {
        uniqueCandidates.push(candidate);
      }
    });
  });

  return uniqueCandidates;
};

const looksLikeHtmlResponse = (contentType, previewText) => {
  if (contentType.includes('text/html')) {
    return true;
  }

  const normalizedPreview = (previewText || '').trim().toLowerCase();
  return (
    normalizedPreview.startsWith('<!doctype html')
    || normalizedPreview.startsWith('<html')
  );
};

const looksLikeSpaFallback = (previewText) => {
  const normalizedPreview = (previewText || '').trim().toLowerCase();
  return (
    normalizedPreview.startsWith('<!doctype html')
    && normalizedPreview.includes('<html')
  );
};

const parseJsonErrorPayload = (previewText, uint8Array) => {
  const normalizedPreview = (previewText || '').trim();
  if (!normalizedPreview.startsWith('{')) {
    return null;
  }

  try {
    const fullText = new TextDecoder().decode(uint8Array);
    const parsed = JSON.parse(fullText);
    return parsed?.error || parsed?.message || null;
  } catch {
    return null;
  }
};

export const requestPdfWithFallback = async ({
  html,
  endpointCandidates = getPdfEndpointCandidates(),
}) => {
  if (!endpointCandidates.length) {
    throw new Error('Aucun endpoint PDF configuré. Définissez VITE_PDF_ENDPOINT (URL complète).');
  }
  
  let lastError;
  const attemptedEndpoints = [];

  for (let index = 0; index < endpointCandidates.length; index += 1) {
    const endpoint = endpointCandidates[index];
    const isLastEndpoint = index === endpointCandidates.length - 1;
    attemptedEndpoints.push(endpoint);

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/pdf',
        },
        body: JSON.stringify({ html }),
      });

      const contentType = response.headers.get('Content-Type') || '';
      const normalizedContentType = contentType.toLowerCase();
      const arrayBuffer = await response.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      const previewText = new TextDecoder().decode(uint8Array.slice(0, 80));
      const header = String.fromCharCode(...uint8Array.slice(0, 4));

      const isHtmlFallback = looksLikeHtmlResponse(normalizedContentType, previewText);
      const isPdfPayload = header === '%PDF';

      if (!response.ok || (!isPdfPayload && isHtmlFallback)) {
        const statusHint = `${response.status} ${response.statusText}`.trim();
        const responsePreview = previewText.trim().slice(0, 120);
        const jsonErrorMessage = parseJsonErrorPayload(responsePreview, uint8Array);
        const spaFallbackHint = looksLikeSpaFallback(responsePreview)
          ? ' Le serveur semble renvoyer la page HTML de l\'application. Vérifiez VITE_PDF_ENDPOINT (URL complète du backend PDF) côté frontend.'
          : '';
        const jsonErrorHint = jsonErrorMessage
          ? ` Détail backend: ${jsonErrorMessage}`
          : '';
        lastError = new Error(
          `Endpoint ${endpoint} a renvoyé une réponse non-PDF (${statusHint}, ${normalizedContentType || 'sans Content-Type'}, aperçu: ${JSON.stringify(responsePreview)}).${jsonErrorHint}${spaFallbackHint}`,
        );

        if (!isLastEndpoint) {
          console.warn('Endpoint PDF invalide, tentative du prochain endpoint...', {
            endpoint,
            status: response.status,
            contentType: normalizedContentType,
            previewText: responsePreview,
          });
          continue;
        }
      }

      if (!isPdfPayload) {
        const responsePreview = previewText.trim().slice(0, 120);
        const jsonErrorMessage = parseJsonErrorPayload(responsePreview, uint8Array);
        const jsonErrorHint = jsonErrorMessage ? `; détail backend: ${jsonErrorMessage}` : '';
        throw new Error(
          `En-tête PDF invalide: ${JSON.stringify(header)} (reçu: ${JSON.stringify(responsePreview)})${jsonErrorHint}`,
        );
      }

      return {
        endpoint,
        contentType,
        arrayBuffer,
      };
    } catch (error) {
      lastError = error;

      if (!isLastEndpoint) {
        console.warn('Erreur lors de la génération PDF, tentative du prochain endpoint...', {
          endpoint,
          error,
        });
        continue;
      }
    }
  }

  if (lastError) {
    const attemptsHint = attemptedEndpoints.length
      ? ` Endpoints testés: ${attemptedEndpoints.join(', ')}.`
      : '';
    throw new Error(`${lastError.message}${attemptsHint}`);
  }

  throw new Error('Aucun endpoint PDF disponible');
};
