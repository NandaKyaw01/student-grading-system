import { routing } from '@/i18n/routing';
import messages from '@/i18n/dictionaries/en.json';

declare module 'next-intl' {
  interface AppConfig {
    Locale: (typeof routing.locales)[number];
    Messages: typeof messages;
  }
}
