import { MetadataRoute } from 'next';

const locales = ['en', 'mm'];

const disallowPaths = locales.map((locale) => `/${locale}/admin/`);

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.APP_URL;

  if (!baseUrl) {
    throw new Error('APP_URL environment variable is not defined');
  }

  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/'],
        disallow: disallowPaths
      }
    ],
    sitemap: [`${baseUrl}/sitemap.xml`]
  };
}
