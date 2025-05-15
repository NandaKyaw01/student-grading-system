'use client';

import Link, { LinkProps } from 'next/link';
import { usePathname } from 'next/navigation';
import { ReactNode } from 'react';

type LocalizedLinkProps = LinkProps & {
  children: ReactNode;
  className?: string;
};

export default function NavLink({
  href,
  children,
  className,
  ...props
}: LocalizedLinkProps) {
  const pathname = usePathname();
  const currentLang = pathname.split('/')[1]; // extract locale from path

  // Ensure href is a string (not URL object) and doesn't already include locale
  const finalHref =
    typeof href === 'string' && !href.startsWith(`/${currentLang}`)
      ? `/${currentLang}${href.startsWith('/') ? '' : '/'}${href}`
      : href;

  return (
    <Link href={finalHref} className={className} {...props}>
      {children}
    </Link>
  );
}
