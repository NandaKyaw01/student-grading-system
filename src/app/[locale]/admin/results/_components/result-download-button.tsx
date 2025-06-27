'use client';

import React, { useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Loader } from 'lucide-react';
import { type ResultData } from '@/actions/result-view';

interface ResultDownloadButtonProps {
  resultData: ResultData;
}

export function ResultDownloadButton({
  resultData
}: ResultDownloadButtonProps) {
  const [isPending, startTransition] = useTransition();
  const generateWordFromTemplate = () => {
    startTransition(async () => {
      try {
        const { createReport } = await import('docx-templates');

        // Load template file
        const templateResponse = await fetch('/templates/result_template.docx');
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
          totalCrd: resultData.result.totalCredits,
          totalGp: resultData.result.totalGp.toFixed(2),

          // Grades array for table iteration
          grades: resultData.grades.map((grade, index) => ({
            no: index + 1,
            subjectName: grade.subject.name,
            crdUnit: grade.subject.creditHours,
            grade: grade.grade,
            score: grade.gp.toFixed(2),
            point: (grade.gp * grade.subject.creditHours).toFixed(2),
            examMark: grade.examMark,
            assignMark: grade.assignMark,
            finalMark: grade.finalMark
          })),

          gradeDesc1: resultData.gradeScales.gradeDescRow1,
          gradeDesc2: resultData.gradeScales.gradeDescRow2,
          gradeScore1: resultData.gradeScales.gradeScoreRow1,
          gradeScore2: resultData.gradeScales.gradeScoreRow2,

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
        alert(
          'Failed to generate document. Please ensure template file exists.'
        );
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
      Download
    </Button>
  );
}
