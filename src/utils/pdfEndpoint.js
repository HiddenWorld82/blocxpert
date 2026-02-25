const toAbsoluteUrl = (url) => {
  if (!url) return null;

  try {
    return new URL(url, window.location.origin).toString();
  } catch (error) {
    console.warn('URL PDF invalide ignorée:', url, error);
    return null;
  }
};

export const getPdfEndpointCandidates = () => {
  const explicitEndpoint =
    import.meta.env.VITE_PDF_ENDPOINT || import.meta.env.VITE_PDF_GENERATE_URL;

  const explicitUrl = toAbsoluteUrl(explicitEndpoint?.trim());
  if (explicitUrl) {
    return [explicitUrl];
  }

  const baseUrl = (import.meta.env.VITE_PDF_URL || window.location.origin).trim();
  const trimmedBaseUrl = baseUrl.replace(/\/+$/, '');
  const hasGeneratePath = /\/generate-pdf$/i.test(trimmedBaseUrl);
  const primaryEndpoint = hasGeneratePath
    ? trimmedBaseUrl
    : `${trimmedBaseUrl}/api/generate-pdf`;

  const fallbackEndpoint = primaryEndpoint.replace(/\/api\/generate-pdf$/i, '/generate-pdf');

  return primaryEndpoint === fallbackEndpoint
    ? [primaryEndpoint]
    : [primaryEndpoint, fallbackEndpoint];
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

export const requestPdfWithFallback = async ({
  html,
  endpointCandidates = getPdfEndpointCandidates(),
}) => {
  let lastError;

  for (let index = 0; index < endpointCandidates.length; index += 1) {
    const endpoint = endpointCandidates[index];
    const isLastEndpoint = index === endpointCandidates.length - 1;

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
      const arrayBuffer = await response.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      const previewText = new TextDecoder().decode(uint8Array.slice(0, 80));
      const header = String.fromCharCode(...uint8Array.slice(0, 4));

      const isHtmlFallback = looksLikeHtmlResponse(contentType, previewText);
      const isPdfPayload = header === '%PDF';

      if (!response.ok || (!isPdfPayload && isHtmlFallback)) {
        const statusHint = `${response.status} ${response.statusText}`.trim();
        const responsePreview = previewText.trim().slice(0, 120);
        lastError = new Error(
          `Endpoint ${endpoint} a renvoyé une réponse non-PDF (${statusHint}, ${contentType || 'sans Content-Type'}, aperçu: ${JSON.stringify(responsePreview)})`,
        );

        if (!isLastEndpoint) {
          console.warn('Endpoint PDF invalide, tentative du prochain endpoint...', {
            endpoint,
            status: response.status,
            contentType,
            previewText: responsePreview,
          });
          continue;
        }
      }

      if (!isPdfPayload) {
        const responsePreview = previewText.trim().slice(0, 120);
        throw new Error(
          `En-tête PDF invalide: ${JSON.stringify(header)} (reçu: ${JSON.stringify(responsePreview)})`,
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

  throw lastError || new Error('Aucun endpoint PDF disponible');
};
