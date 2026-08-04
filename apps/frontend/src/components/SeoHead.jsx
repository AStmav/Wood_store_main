import { Helmet } from 'react-helmet-async';
import { absoluteUrl, SITE_NAME } from '../seo/seoConfig.js';

/**
 * Унифицированные meta / OG / JSON-LD для страниц.
 */
export default function SeoHead({
  title,
  description,
  path = '/',
  image,
  noindex = false,
  jsonLd,
}) {
  const fullTitle = title
    ? (title.includes(SITE_NAME) ? title : `${title} — ${SITE_NAME}`)
    : `${SITE_NAME} — детская мебель в Якутске`;
  const desc =
    description ||
    'Сказкин Дом — детская мебель и игрушки в Якутске. Доставка и сборка.';
  const canonical = absoluteUrl(path);
  const ogImage = image ? absoluteUrl(image) : absoluteUrl('/logo.png');
  const payloads = Array.isArray(jsonLd) ? jsonLd.filter(Boolean) : jsonLd ? [jsonLd] : [];

  return (
    <Helmet>
      <html lang="ru" />
      <title>{fullTitle}</title>
      <meta name="description" content={desc} />
      <link rel="canonical" href={canonical} />
      {noindex ? (
        <meta name="robots" content="noindex,nofollow" />
      ) : (
        <meta name="robots" content="index,follow" />
      )}
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={desc} />
      <meta property="og:url" content={canonical} />
      <meta property="og:image" content={ogImage} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={desc} />
      <meta name="twitter:image" content={ogImage} />
      {payloads.map((payload, index) => (
        <script key={index} type="application/ld+json">
          {JSON.stringify(payload)}
        </script>
      ))}
    </Helmet>
  );
}
