import { usePathname } from 'next/navigation';
import { Locale } from './i18n-config';

export function useSwitchLocaleHref() {
  const pathname = usePathname();

  const getSwitchLocaleHref = (locale: Locale) => {
    if (!pathname) return '/';
    const segments = pathname.split('/');
    segments[1] = locale;
    return segments.join('/');
  };

  return getSwitchLocaleHref;
}
