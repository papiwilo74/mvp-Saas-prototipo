import { Helmet } from 'react-helmet-async';

export function SEOHead({ title, description, image }) {
  const siteName = 'FastFood SaaS';
  const fullTitle = title ? `${title} - ${siteName}` : siteName;
  const desc = description || 'App de pedidos online para restaurantes. Pide tu comida favorita desde el celular.';
  const ogImage = image || '';

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={desc} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={desc} />
      <meta property="og:type" content="website" />
      {ogImage && <meta property="og:image" content={ogImage} />}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={desc} />
      {ogImage && <meta name="twitter:image" content={ogImage} />}
    </Helmet>
  );
}
