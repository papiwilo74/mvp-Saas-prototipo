import { Helmet } from 'react-helmet-async';

function sanitizeText(text) {
  if (typeof text !== 'string') return '';
  return text
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .trim()
    .slice(0, 300);
}

function sanitizeUrl(url) {
  if (typeof url !== 'string') return '';
  const trimmed = url.trim();
  if (trimmed.length > 2048) return '';
  try {
    const parsed = new URL(trimmed);
    if (['http:', 'https:'].includes(parsed.protocol)) {
      return trimmed;
    }
  } catch {
    // URL inválida
  }
  return '';
}

export function SEOHead({ title, description, image, siteName }) {
  const defaultSiteName = 'TuTienda SaaS';

  const safeSiteName = sanitizeText(siteName) || defaultSiteName;
  const safeTitle = sanitizeText(title);
  const safeDescription = sanitizeText(description) || 'Plataforma de pedidos online para tu negocio. Vende tus productos desde el celular.';
  const safeImage = sanitizeUrl(image);

  const fullTitle = safeTitle ? `${safeTitle} - ${safeSiteName}` : safeSiteName;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={safeDescription} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={safeDescription} />
      <meta property="og:type" content="website" />
      {safeImage && <meta property="og:image" content={safeImage} />}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={safeDescription} />
      {safeImage && <meta name="twitter:image" content={safeImage} />}
    </Helmet>
  );
}
