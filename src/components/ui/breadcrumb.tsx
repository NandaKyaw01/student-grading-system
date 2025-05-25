import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { ChevronRight, MoreHorizontal } from 'lucide-react';
import Link from 'next/link';

import { cn } from '@/lib/utils';

interface BreadcrumbProps extends React.ComponentProps<'ol'> {
  path?: string;
}
interface RouteToNavigateProps {
  item?: string;
}

//--------------------------------------------------------------------------------
function Breadcrumb({ path, className, ...props }: BreadcrumbProps) {
  const routeArray = path?.split('/');
  console.log(routeArray);
  const findDashboardIndex = (): number => {
    if (!routeArray) {
      return -1;
    }

    return routeArray.findIndex((item) => item === 'Dashboard');
  };
  const findDestinationIndex = (desti: string): number => {
    if (!routeArray) {
      return -1;
    }
    return routeArray.findIndex((item) => item === desti);
  };
  const routeToNavigate = (link: string, routeArray: string[]): string => {
    let route = '';
    if (link === 'Dashboard') {
      route += '/dashboard';
    } else {
      const dashboardIndex = findDashboardIndex();
      const destinationIndex = findDestinationIndex(link);
      for (let i = dashboardIndex + 1; i < destinationIndex + 1; i++) {
        route += '/' + routeArray[i].toLowerCase();
      }
    }

    return route;
  };
  return (
    <ol
      data-slot='breadcrumb-list'
      className={cn(
        `text-muted-foreground flex flex-wrap items-center gap-1.5 text-sm break-words
        sm:gap-2.5`,
        className
      )}
      {...props}
    >
      {routeArray?.map((item, index) => (
        <React.Fragment key={index}>
          <BreadcrumbItem>
            {index !== routeArray.length - 1 ? ( //making bright color breadcrumb in last page
              item === 'Home' ? (
                <BreadcrumbLink asChild>
                  <Link href='/'>{item}</Link>
                </BreadcrumbLink>
              ) : (
                <BreadcrumbLink asChild>
                  <Link
                    // href='/admin/posts'
                    href={`/admin${routeToNavigate(item, routeArray)}`}
                    // onClick={() => routeToNavigate(item, routeArray)}
                  >
                    {item}
                  </Link>
                </BreadcrumbLink>
              )
            ) : (
              <BreadcrumbPage>{item}</BreadcrumbPage>
            )}
          </BreadcrumbItem>
          {index !== routeArray.length - 1 && <BreadcrumbSeparator />}
        </React.Fragment>
      ))}
    </ol>
  );
}
//--------------------------------------------------------------------------------
// function Breadcrumb({ ...props }: React.ComponentProps<'nav'>) {
//   return <nav aria-label='breadcrumb' data-slot='breadcrumb' {...props} />;
// }

function BreadcrumbList({ className, ...props }: React.ComponentProps<'ol'>) {
  return (
    <ol
      data-slot='breadcrumb-list'
      className={cn(
        `text-muted-foreground flex flex-wrap items-center gap-1.5 text-sm break-words
        sm:gap-2.5`,
        className
      )}
      {...props}
    />
  );
}

function BreadcrumbItem({ className, ...props }: React.ComponentProps<'li'>) {
  return (
    <li
      data-slot='breadcrumb-item'
      className={cn('inline-flex items-center gap-1.5', className)}
      {...props}
    />
  );
}

function BreadcrumbLink({
  asChild,
  className,
  ...props
}: React.ComponentProps<'a'> & {
  asChild?: boolean;
}) {
  const Comp = asChild ? Slot : 'a';

  return (
    <Comp
      data-slot='breadcrumb-link'
      className={cn('hover:text-foreground transition-colors', className)}
      {...props}
    />
  );
}

function BreadcrumbPage({ className, ...props }: React.ComponentProps<'span'>) {
  return (
    <span
      data-slot='breadcrumb-page'
      role='link'
      aria-disabled='true'
      aria-current='page'
      className={cn('text-foreground font-normal', className)}
      {...props}
    />
  );
}

function BreadcrumbSeparator({
  children,
  className,
  ...props
}: React.ComponentProps<'li'>) {
  return (
    <li
      data-slot='breadcrumb-separator'
      role='presentation'
      aria-hidden='true'
      className={cn('[&>svg]:size-3.5', className)}
      {...props}
    >
      {children ?? <ChevronRight />}
    </li>
  );
}

function BreadcrumbEllipsis({
  className,
  ...props
}: React.ComponentProps<'span'>) {
  return (
    <span
      data-slot='breadcrumb-ellipsis'
      role='presentation'
      aria-hidden='true'
      className={cn('flex size-9 items-center justify-center', className)}
      {...props}
    >
      <MoreHorizontal className='size-4' />
      <span className='sr-only'>More</span>
    </span>
  );
}

export {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbEllipsis
  // BreadcrumbTest
};
