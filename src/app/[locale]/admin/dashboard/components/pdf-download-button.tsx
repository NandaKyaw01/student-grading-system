'use client';

import { generateDashboardPDF } from '@/actions/generate-pdf';
import { Button } from '@/components/ui/button';
import { Download, Loader2 } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { useTransition } from 'react';

export function DashboardPDFDownload({
  contentRef
}: {
  contentRef: React.RefObject<HTMLDivElement | null>
}) {
  const searchParams = useSearchParams();
  const year = searchParams.get('year') || 'current';
  const [isPending, startTransition] = useTransition();

  const downloadPDF = async () => {
    if (!contentRef.current) return;
    startTransition(async () => {
      try {
        // Get the HTML of the dashboard
        const html = `
          <!DOCTYPE html>
          <html>
           <head>
        <script src="https://cdn.tailwindcss.com"></script>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap');
          body { 
            font-family: 'Inter', sans-serif; 
            min-width: 1024px !important; /* Force desktop minimum width */
          }
        </style>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
      </head>
            <body class="p-10 mt-8">
              <h1 class="text-2xl font-bold mb-4">Dashboard Report</h1>
              <div class="mb-6">
                <p class="text-sm text-gray-500">Academic Year: ${year}</p>
                <p class="text-sm text-gray-500">Generated on: ${new Date().toLocaleDateString()}</p>
              </div>
              ${contentRef.current!.innerHTML}
            </body>
          </html>
        `;

        const pdf = await generateDashboardPDF(html);


        const blob = new Blob([pdf as BlobPart], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `dashboard-report-${year}.pdf`;
        document.body.appendChild(a);
        a.click();
        a.remove();
      } catch (error) {
        console.error('Failed to generate PDF:', error);
        alert('Failed to generate PDF. Please try again.');
      }
    })

  };

  return (
    <Button onClick={downloadPDF} variant="outline">
      {isPending ? <Loader2 className='animate-spin' /> : <Download />}
    </Button>
  );
}