'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { type ResultData } from '@/actions/result-view';

interface DownloadButtonProps {
  resultData: ResultData;
}

export function DownloadButton({ resultData }: DownloadButtonProps) {
  const handleDownloadResult = () => {
    // You can implement PDF generation here using libraries like:
    // - jsPDF
    // - react-pdf
    // - puppeteer (server-side)
    // For now, this is a placeholder
    console.log('Downloading result PDF for:', resultData.student.name);

    // Example implementation:
    // const doc = new jsPDF();
    // doc.text(`Result for ${resultData.student.name}`, 20, 20);
    // doc.save(`result-${resultData.student.rollNumber}.pdf`);

    alert('PDF download functionality to be implemented');
  };

  return (
    <Button
      variant='secondary'
      onClick={handleDownloadResult}
      className='bg-white/20 hover:bg-white/30 text-white border-white/30'
    >
      <Download className='h-4 w-4 mr-2' />
      Download PDF
    </Button>
  );
}
