import React from 'react';
import { notFound } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Trophy, BookOpen, Calendar, User, GraduationCap } from 'lucide-react';
import { getResultById, type ResultData } from '@/actions/result-view';
import { DownloadButton } from '../../_components/download-button';
import { ContentLayout } from '@/components/admin-panel/content-layout';
import { ActiveBreadcrumb } from '@/components/active-breadcrumb';

const getGradeColor = (grade: string) => {
  switch (grade) {
    case 'A+':
      return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800';
    case 'A':
      return 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800';
    case 'A-':
      return 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800';
    case 'B+':
      return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800';
    case 'B':
      return 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800';
    case 'B-':
      return 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800';
    case 'C+':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800';
    case 'C':
      return 'bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800';
    case 'D':
      return 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800';
    case 'F':
      return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700';
  }
};

const getGpaColor = (gpa: number) => {
  if (gpa >= 3.5) return 'text-green-600 dark:text-green-400';
  if (gpa >= 3.0) return 'text-blue-600 dark:text-blue-400';
  if (gpa >= 2.5) return 'text-yellow-600 dark:text-yellow-400';
  return 'text-red-600 dark:text-red-400';
};

export const metadata = {
  title: 'Results : Result View'
};

type PageProps = {
  params: Promise<{ resultId: string }>;
};

export default async function ViewResultPage({ params }: PageProps) {
  const { resultId } = await params;

  let resultData: ResultData | null;

  try {
    resultData = await getResultById(resultId);
  } catch (error) {
    console.error('Error loading result:', error);
    notFound();
  }

  if (!resultData) {
    notFound();
  }

  return (
    <ContentLayout
      title='Results'
      breadcrumb={
        <ActiveBreadcrumb
          path={[
            {
              name: 'Home',
              link: '/'
            },
            {
              name: 'Results',
              link: '/admin/results'
            },
            {
              name: resultId,
              link: ''
            }
          ]}
        />
      }
    >
      <div className='max-w-6xl mx-auto space-y-6'>
        {/* Header */}
        <div className='text-center space-y-2'>
          <h1 className='text-3xl font-bold text-foreground'>Exam Result</h1>
          <p className='text-muted-foreground'>
            View academic performance and semester results
          </p>
        </div>

        {/* Result Display */}
        <div className='space-y-6'>
          {/* Student Info */}
          <Card className='shadow-lg border-0 bg-card/80 backdrop-blur pt-0'>
            <CardHeader className='bg-primary text-primary-foreground py-6 rounded-t-lg'>
              <div className='flex justify-between items-center'>
                <div>
                  <CardTitle className='text-2xl flex items-center gap-2'>
                    <User className='h-6 w-6' />
                    {resultData.student.name}
                  </CardTitle>
                  <CardDescription className='text-primary-foreground/80'>
                    Roll Number: {resultData.student.rollNumber}
                  </CardDescription>
                </div>
                <DownloadButton resultData={resultData} />
              </div>
            </CardHeader>
            <CardContent>
              <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                <div className='flex items-center gap-3'>
                  <GraduationCap className='h-5 w-5 text-primary' />
                  <div>
                    <p className='text-sm text-muted-foreground'>Class</p>
                    <p className='font-medium text-foreground'>
                      {`${resultData.enrollment.class} (${
                        resultData.enrollment.departmentCode
                      })`}
                    </p>
                  </div>
                </div>
                <div className='flex items-center gap-3'>
                  <Calendar className='h-5 w-5 text-primary' />
                  <div>
                    <p className='text-sm text-muted-foreground'>Semester</p>
                    <p className='font-medium text-foreground'>
                      {resultData.enrollment.semester}
                    </p>
                  </div>
                </div>
                <div className='flex items-center gap-3'>
                  <BookOpen className='h-5 w-5 text-primary' />
                  <div>
                    <p className='text-sm text-muted-foreground'>
                      Academic Year
                    </p>
                    <p className='font-medium text-foreground'>
                      {resultData.enrollment.academicYear}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Summary Cards */}
          <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
            <Card
              className='shadow-lg border-0 bg-gradient-to-br from-green-50 to-emerald-50
                dark:from-green-950/50 dark:to-emerald-950/50'
            >
              <CardContent className='pt-6'>
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='text-sm text-muted-foreground'>Current GPA</p>
                    <p
                      className={`text-3xl font-bold ${getGpaColor(resultData.result.gpa)}`}
                    >
                      {resultData.result.gpa.toFixed(2)}
                    </p>
                  </div>
                  <div className='p-3 bg-green-100 dark:bg-green-900/50 rounded-full'>
                    <GraduationCap className='h-6 w-6 text-green-600 dark:text-green-400' />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card
              className='shadow-lg border-0 bg-gradient-to-br from-blue-50 to-cyan-50
                dark:from-blue-950/50 dark:to-cyan-950/50'
            >
              <CardContent className='pt-6'>
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='text-sm text-muted-foreground'>
                      Total Credits
                    </p>
                    <p className='text-3xl font-bold text-blue-600 dark:text-blue-400'>
                      {resultData.result.totalCredits}
                    </p>
                  </div>
                  <div className='p-3 bg-blue-100 dark:bg-blue-900/50 rounded-full'>
                    <BookOpen className='h-6 w-6 text-blue-600 dark:text-blue-400' />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card
              className='shadow-lg border-0 bg-gradient-to-br from-purple-50 to-pink-50
                dark:from-purple-950/50 dark:to-pink-950/50'
            >
              <CardContent className='pt-6'>
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='text-sm text-muted-foreground'>Class Rank</p>
                    <p className='text-3xl font-bold text-purple-600 dark:text-purple-400'>
                      {resultData.result.rank
                        ? `#${resultData.result.rank}`
                        : 'N/A'}
                    </p>
                  </div>
                  <div className='p-3 bg-purple-100 dark:bg-purple-900/50 rounded-full'>
                    <Trophy className='h-6 w-6 text-purple-600 dark:text-purple-400' />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Grades Table */}
          <Card className='shadow-lg border-0 bg-card/80 backdrop-blur'>
            <CardHeader>
              <CardTitle className='text-foreground'>
                Subject-wise Results
              </CardTitle>
              <CardDescription className='text-muted-foreground'>
                Detailed breakdown of marks and grades for each subject
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className='overflow-x-auto'>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className='text-foreground'>
                        Subject Code
                      </TableHead>
                      <TableHead className='text-foreground'>
                        Subject Name
                      </TableHead>
                      <TableHead className='text-center text-foreground'>
                        Credits
                      </TableHead>
                      <TableHead className='text-center text-foreground'>
                        Exam Mark
                      </TableHead>
                      <TableHead className='text-center text-foreground'>
                        Assignment Mark
                      </TableHead>
                      <TableHead className='text-center text-foreground'>
                        Final Mark
                      </TableHead>
                      <TableHead className='text-center text-foreground'>
                        Grade
                      </TableHead>
                      <TableHead className='text-center text-foreground'>
                        Grade Points
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {resultData.grades.map((grade, index) => (
                      <TableRow key={index} className='hover:bg-muted/50'>
                        <TableCell className='font-medium text-foreground'>
                          {grade.subject.id}
                        </TableCell>
                        <TableCell className='text-foreground'>
                          {grade.subject.name}
                        </TableCell>
                        <TableCell className='text-center text-foreground'>
                          {grade.subject.creditHours}
                        </TableCell>
                        <TableCell className='text-center text-foreground'>
                          {grade.examMark}
                        </TableCell>
                        <TableCell className='text-center text-foreground'>
                          {grade.assignMark}
                        </TableCell>
                        <TableCell className='text-center font-medium text-foreground'>
                          {grade.finalMark}
                        </TableCell>
                        <TableCell className='text-center'>
                          <Badge className={getGradeColor(grade.grade)}>
                            {grade.grade}
                          </Badge>
                        </TableCell>
                        <TableCell className='text-center font-medium text-foreground'>
                          {grade.gp.toFixed(1)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Summary Row */}
              <div className='mt-6 pt-4 border-t border-border'>
                <div className='flex justify-between items-center'>
                  <div className='text-lg font-semibold text-foreground'>
                    Overall Summary:
                  </div>
                  <div className='flex gap-8 text-sm'>
                    <span className='text-muted-foreground'>
                      Total Credits:{' '}
                      <span className='font-bold text-foreground'>
                        {resultData.result.totalCredits}
                      </span>
                    </span>
                    <span className='text-muted-foreground'>
                      GPA:{' '}
                      <span
                        className={`font-bold ${getGpaColor(resultData.result.gpa)}`}
                      >
                        {resultData.result.gpa.toFixed(2)}
                      </span>
                    </span>
                    <span className='text-muted-foreground'>
                      Rank:{' '}
                      <span className='font-bold text-foreground'>
                        {resultData.result.rank
                          ? `#${resultData.result.rank}`
                          : 'N/A'}
                      </span>
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </ContentLayout>
  );
}
