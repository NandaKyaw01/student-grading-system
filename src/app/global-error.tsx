'use client';
import { Button } from '@/components/ui/button';

// Error boundaries must be Client Components

export default function GlobalError({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body>
        <div
          className='absolute top-1/2 left-1/2 mb-16 -translate-x-1/2 -translate-y-1/2 items-center
            justify-center text-center'
        >
          <span
            className='from-foreground bg-linear-to-b to-transparent bg-clip-text text-[10rem]
              leading-none font-extrabold text-transparent'
          >
            ERROR!
          </span>
          <h2 className='font-heading my-2 text-2xl font-bold'>
            Something went wrong!
          </h2>
          <p>{error.message}</p>
          <div className='mt-8 flex justify-center gap-2'>
            <Button onClick={() => reset()} variant='default' size='lg'>
              Try again
            </Button>
          </div>
        </div>
      </body>
    </html>
  );
}
