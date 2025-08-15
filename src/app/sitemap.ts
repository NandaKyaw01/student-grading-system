import { MetadataRoute } from 'next';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.APP_URL;
  if (!baseUrl) {
    throw new Error('APP_URL environment variable is not defined');
  }

  const routes = ['', '/en', '/mm', '/en/search', '/mm/search'].map(
    (route) => ({
      url: `${baseUrl}${route}`,
      lastModified: new Date().toISOString()
    })
  );

  return [...routes];
}
