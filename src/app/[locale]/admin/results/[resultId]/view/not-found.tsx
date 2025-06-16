import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div
      className='min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex
        items-center justify-center p-4'
    >
      <Card className='max-w-md w-full shadow-lg border-0 bg-white/80 backdrop-blur'>
        <CardHeader className='text-center'>
          <div className='mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4'>
            <AlertCircle className='h-8 w-8 text-red-600' />
          </div>
          <CardTitle className='text-2xl text-gray-900'>
            Result Not Found
          </CardTitle>
        </CardHeader>
        <CardContent className='text-center space-y-4'>
          <p className='text-gray-600'>
            The result you&#39;re looking for doesn&#39;t exist or may have been
            removed.
          </p>
          <div className='space-y-2'>
            <p className='text-sm text-gray-500'>Please check:</p>
            <ul className='text-sm text-gray-500 space-y-1'>
              <li>• The result ID is correct</li>
              <li>• The result has been published</li>
              <li>• You have permission to view this result</li>
            </ul>
          </div>
          <div className='pt-4'>
            <Link href='/results'>
              <Button className='w-full'>
                <ArrowLeft className='h-4 w-4 mr-2' />
                Back to Results
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
