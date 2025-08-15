export type SiteConfig = typeof siteConfig;

export const siteConfig = {
  name: 'SmartGrade UCSH',
  description: 'Grading Certificate Information System',
  url: process.env.APP_URL as string
};
