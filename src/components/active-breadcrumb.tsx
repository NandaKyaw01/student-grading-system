import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from '@/components/ui/breadcrumb';
import Link from 'next/link';
import React from 'react';

interface BreadcrumbProps {
  name?: string;
  link?: string;
}

interface ActiveBreadcrumbProps {
  path?: Array<BreadcrumbProps>;
}

export function ActiveBreadcrumb({ path }: ActiveBreadcrumbProps) {
  return (
    <Breadcrumb>
      <BreadcrumbList>
        {path?.map((item, index) =>
          index !== path.length - 1 ? (
            <React.Fragment key={index}>
              <BreadcrumbItem className='hidden md:block'>
                <BreadcrumbLink asChild>
                  <Link href={`${item.link}`}>{item.name}</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className='hidden md:block' />
            </React.Fragment>
          ) : (
            <React.Fragment key={index}>
              <BreadcrumbItem>
                <BreadcrumbPage>{item.name}</BreadcrumbPage>
              </BreadcrumbItem>
            </React.Fragment>
          )
        )}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
