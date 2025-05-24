import React from 'react';
import { Card, CardContent, CardHeader } from './ui/card';
import { Skeleton } from './ui/skeleton';

export default function FormCardSkeleton() {
  return (
    <Card className='mx-auto w-full'>
      <CardHeader>
        <Skeleton className='h-8 w-48' />
      </CardHeader>
      <CardContent>
        <div className='space-y-8'>
          {/* Image upload area skeleton */}
          {/* <div className='space-y-6'>
            <Skeleton className='h-4 w-16' /> 
            <Skeleton className='h-32 w-full rounded-lg' /> 
          </div> */}

          {/* Grid layout for form fields */}
          <div className='grid grid-cols-1 gap-6'>
            {Array.from({ length: 3 }).map((_, i) => (
              <div className='space-y-2' key={i}>
                <Skeleton className='h-4 w-24' />
                <Skeleton className='h-10 w-full' />
              </div>
            ))}
          </div>

          {/* Description field */}
          {/* <div className='space-y-2'>
            <Skeleton className='h-4 w-24' />
            <Skeleton className='h-32 w-full' />
          </div> */}

          {/* Submit button */}
          <Skeleton className='h-10 w-28' />
        </div>
      </CardContent>
    </Card>
  );
}
