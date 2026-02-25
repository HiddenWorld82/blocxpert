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
