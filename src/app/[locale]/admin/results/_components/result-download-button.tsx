'use client';

import { type ResultData } from '@/actions/result-view';
import { Button } from '@/components/ui/button';
import { Download, Loader } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useTransition } from 'react';
import { toast } from 'sonner';

interface ResultDownloadButtonProps {
  resultData: ResultData;
}

export function ResultDownloadButton({
  resultData
}: ResultDownloadButtonProps) {
  const [isPending, startTransition] = useTransition();
  const t = useTranslations(
    'ResultsBySemester.ResultView.result_download_button'
  );

  const generateWordFromTemplate = () => {
    startTransition(async () => {
      try {
        const { createReport } = await import('docx-templates');

        // Load template file
        const templateResponse = await fetch(
          '/templates/result-template-default.docx'
        );
        const templateBuffer = await templateResponse.arrayBuffer();

        // Convert ArrayBuffer to Uint8Array
        const templateUint8Array = new Uint8Array(templateBuffer);

        // Prepare data for template
        const templateData = {
          // Student Information
          studentName: resultData.student.name,
          rollNumber: resultData.student.rollNumber,
          className: resultData.enrollment.class,
          departmentCode: resultData.enrollment.departmentCode,
          semester: resultData.enrollment.semester,
          academicYear: resultData.enrollment.academicYear,

          // Results
          gpa: resultData.result.gpa.toFixed(2),
          totalCredit: resultData.result.totalCredits.toFixed(2),
          totalGp: resultData.result.totalGp.toFixed(2),

          // Grades array for table iteration
          grades: resultData.grades.map((grade, index) => ({
            no: index + 1,
            subjectName: grade.subject.name,
            creditUnit: grade.subject.creditHours.toFixed(2),
            grade: grade.grade,
            score: grade.score.toFixed(2),
            point: grade.gp.toFixed(2),
            baseMark: grade.baseMark,
            examMark: grade.examMark,
            assignMark: grade.assignMark,
            finalMark: grade.finalMark
          })),

          gradeScales: resultData.gradeScales,

          // Current date
          currentDate: new Date().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })
        };

        // Generate document from template
        const report = await createReport({
          template: templateUint8Array, // Use Uint8Array instead of ArrayBuffer
          data: templateData,
          cmdDelimiter: ['{', '}'] // Use {variableName} in template
        });

        // Download the generated document
        const blob = new Blob([report], {
          type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${resultData.student.name}_${resultData.student.rollNumber}_Result.docx`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      } catch (error) {
        console.error('Error generating document from template:', error);
        toast.error(t('errors.generation_error'));
      }
    });
  };

  return (
    <Button
      variant='secondary'
      disabled={isPending}
      onClick={generateWordFromTemplate}
      className='bg-white/20 hover:bg-white/30 text-white border-white/30'
    >
      {isPending ? (
        <Loader className='mr-2 size-4 animate-spin' aria-hidden='true' />
      ) : (
        <Download className='h-4 w-4 mr-2' />
      )}
      {isPending ? t('button.exporting') : t('button.export')}
    </Button>
  );
}
