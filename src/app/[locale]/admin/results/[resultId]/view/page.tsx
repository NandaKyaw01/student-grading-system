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
import {
  Trophy,
  BookOpen,
  Calendar,
  User,
  GraduationCap,
  Award
} from 'lucide-react';
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
      <div className='max-w-6xl mx-auto space-y-4 sm:space-y-6 px-4 sm:px-6'>
        {/* Header */}
        <div className='text-center space-y-2'>
          <h1 className='text-2xl sm:text-3xl font-bold text-foreground'>
            Exam Result
          </h1>
          <p className='text-sm sm:text-base text-muted-foreground'>
            View academic performance and semester results
          </p>
        </div>

        {/* Result Display */}
        <div className='space-y-4 sm:space-y-6'>
          {/* Student Info */}
          <Card className='shadow-lg border-0 bg-card/80 backdrop-blur pt-0'>
            <CardHeader className='bg-primary text-primary-foreground py-4 sm:py-6 rounded-t-lg'>
              <div className='flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4'>
                <div className='min-w-0 flex-1'>
                  <CardTitle className='text-xl sm:text-2xl flex items-center gap-2 break-words'>
                    <User className='h-5 w-5 sm:h-6 sm:w-6 flex-shrink-0' />
                    <span className='truncate'>{resultData.student.name}</span>
                  </CardTitle>
                  <CardDescription className='text-primary-foreground/80 text-sm sm:text-base'>
                    Roll Number: {resultData.student.rollNumber}
                  </CardDescription>
                </div>
                <div className='flex-shrink-0'>
                  <DownloadButton resultData={resultData} />
                </div>
              </div>
            </CardHeader>
            <CardContent className='p-4 sm:p-6'>
              <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
                <div className='flex items-center gap-3'>
                  <GraduationCap className='h-5 w-5 text-primary flex-shrink-0' />
                  <div className='min-w-0 flex-1'>
                    <p className='text-sm text-muted-foreground'>Class</p>
                    <p className='font-medium text-foreground truncate'>
                      {`${resultData.enrollment.class} (${
                        resultData.enrollment.departmentCode
                      })`}
                    </p>
                  </div>
                </div>
                <div className='flex items-center gap-3'>
                  <Calendar className='h-5 w-5 text-primary flex-shrink-0' />
                  <div className='min-w-0 flex-1'>
                    <p className='text-sm text-muted-foreground'>Semester</p>
                    <p className='font-medium text-foreground'>
                      {resultData.enrollment.semester}
                    </p>
                  </div>
                </div>
                <div className='flex items-center gap-3 sm:col-span-2 lg:col-span-1'>
                  <BookOpen className='h-5 w-5 text-primary flex-shrink-0' />
                  <div className='min-w-0 flex-1'>
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
          <div className='grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6'>
            <Card
              className='shadow-lg border-0 bg-gradient-to-br from-green-50 to-emerald-50
                dark:from-green-950/50 dark:to-emerald-950/50'
            >
              <CardContent className='pt-4 sm:pt-6 p-3 sm:p-6'>
                <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2'>
                  <div className='min-w-0 flex-1'>
                    <p className='text-xs sm:text-sm text-muted-foreground'>
                      Current GPA
                    </p>
                    <p
                      className={`text-xl sm:text-3xl font-bold ${getGpaColor(resultData.result.gpa)}`}
                    >
                      {resultData.result.gpa.toFixed(2)}
                    </p>
                  </div>
                  <div className='p-2 sm:p-3 bg-green-100 dark:bg-green-900/50 rounded-full self-end sm:self-auto'>
                    <GraduationCap className='h-4 w-4 sm:h-6 sm:w-6 text-green-600 dark:text-green-400' />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card
              className='shadow-lg border-0 bg-gradient-to-br from-blue-50 to-cyan-50
                dark:from-blue-950/50 dark:to-cyan-950/50'
            >
              <CardContent className='pt-4 sm:pt-6 p-3 sm:p-6'>
                <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2'>
                  <div className='min-w-0 flex-1'>
                    <p className='text-xs sm:text-sm text-muted-foreground'>
                      Total Credits
                    </p>
                    <p className='text-xl sm:text-3xl font-bold text-blue-600 dark:text-blue-400'>
                      {resultData.result.totalCredits}
                    </p>
                  </div>
                  <div className='p-2 sm:p-3 bg-blue-100 dark:bg-blue-900/50 rounded-full self-end sm:self-auto'>
                    <BookOpen className='h-4 w-4 sm:h-6 sm:w-6 text-blue-600 dark:text-blue-400' />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card
              className='shadow-lg border-0 bg-gradient-to-br from-orange-50 to-amber-50
                dark:from-orange-950/50 dark:to-amber-950/50'
            >
              <CardContent className='pt-4 sm:pt-6 p-3 sm:p-6'>
                <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2'>
                  <div className='min-w-0 flex-1'>
                    <p className='text-xs sm:text-sm text-muted-foreground'>
                      Total GP
                    </p>
                    <p className='text-xl sm:text-3xl font-bold text-orange-600 dark:text-orange-400'>
                      {resultData.result.totalGp}
                    </p>
                  </div>
                  <div
                    className='p-2 sm:p-3 bg-orange-100 dark:bg-orange-900/50 rounded-full self-end
                      sm:self-auto'
                  >
                    <Award className='h-4 w-4 sm:h-6 sm:w-6 text-orange-600 dark:text-orange-400' />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card
              className='shadow-lg border-0 bg-gradient-to-br from-purple-50 to-pink-50
                dark:from-purple-950/50 dark:to-pink-950/50'
            >
              <CardContent className='pt-4 sm:pt-6 p-3 sm:p-6'>
                <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2'>
                  <div className='min-w-0 flex-1'>
                    <p className='text-xs sm:text-sm text-muted-foreground'>
                      Class Rank
                    </p>
                    <p className='text-xl sm:text-3xl font-bold text-purple-600 dark:text-purple-400'>
                      {resultData.result.rank
                        ? `#${resultData.result.rank}`
                        : 'N/A'}
                    </p>
                  </div>
                  <div
                    className='p-2 sm:p-3 bg-purple-100 dark:bg-purple-900/50 rounded-full self-end
                      sm:self-auto'
                  >
                    <Trophy className='h-4 w-4 sm:h-6 sm:w-6 text-purple-600 dark:text-purple-400' />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Grades Table */}
          <Card className='shadow-lg border-0 bg-card/80 backdrop-blur'>
            <CardHeader className='p-4 sm:p-6'>
              <CardTitle className='text-lg sm:text-xl text-foreground'>
                Subject-wise Results
              </CardTitle>
              <CardDescription className='text-sm sm:text-base text-muted-foreground'>
                Detailed breakdown of marks and grades for each subject
              </CardDescription>
            </CardHeader>
            <CardContent className='p-4 sm:p-6 pt-0'>
              {/* Mobile View - Card Layout */}
              <div className='block sm:hidden space-y-4'>
                {resultData.grades.map((grade, index) => (
                  <Card key={index} className='border border-border/50'>
                    <CardContent className='p-4'>
                      <div className='space-y-3'>
                        <div className='flex justify-between items-start'>
                          <div className='min-w-0 flex-1'>
                            <p className='font-semibold text-foreground text-sm'>
                              {grade.subject.id}
                            </p>
                            <p className='text-xs text-muted-foreground truncate'>
                              {grade.subject.name}
                            </p>
                          </div>
                          <Badge
                            className={`${getGradeColor(grade.grade)} ml-2 flex-shrink-0`}
                          >
                            {grade.grade}
                          </Badge>
                        </div>

                        <div className='grid grid-cols-2 gap-2 text-xs'>
                          <div>
                            <span className='text-muted-foreground'>
                              Credits:{' '}
                            </span>
                            <span className='font-medium text-foreground'>
                              {grade.subject.creditHours}
                            </span>
                          </div>
                          <div>
                            <span className='text-muted-foreground'>GP: </span>
                            <span className='font-medium text-foreground'>
                              {grade.gp.toFixed(1)}
                            </span>
                          </div>
                          <div>
                            <span className='text-muted-foreground'>
                              Exam:{' '}
                            </span>
                            <span className='font-medium text-foreground'>
                              {Number(grade.examMark).toFixed(1)}
                            </span>
                          </div>
                          <div>
                            <span className='text-muted-foreground'>
                              Assignment:{' '}
                            </span>
                            <span className='font-medium text-foreground'>
                              {Number(grade.assignMark).toFixed(1)}
                            </span>
                          </div>
                        </div>

                        <div className='pt-2 border-t border-border/50'>
                          <span className='text-muted-foreground text-xs'>
                            Final Mark:{' '}
                          </span>
                          <span className='font-bold text-foreground'>
                            {Number(grade.finalMark).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Desktop View - Table Layout */}
              <div className='hidden sm:block overflow-x-auto'>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className='text-foreground min-w-[100px]'>
                        Subject Code
                      </TableHead>
                      <TableHead className='text-foreground min-w-[200px]'>
                        Subject Name
                      </TableHead>
                      <TableHead className='text-center text-foreground min-w-[80px]'>
                        Credits
                      </TableHead>
                      <TableHead className='text-center text-foreground min-w-[100px]'>
                        Exam Mark
                      </TableHead>
                      <TableHead className='text-center text-foreground min-w-[120px]'>
                        Assignment Mark
                      </TableHead>
                      <TableHead className='text-center text-foreground min-w-[100px]'>
                        Final Mark
                      </TableHead>
                      <TableHead className='text-center text-foreground min-w-[80px]'>
                        Grade
                      </TableHead>
                      <TableHead className='text-center text-foreground min-w-[100px]'>
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
                          {Number(grade.examMark).toFixed(1)}
                        </TableCell>
                        <TableCell className='text-center text-foreground'>
                          {Number(grade.assignMark).toFixed(1)}
                        </TableCell>
                        <TableCell className='text-center font-medium text-foreground'>
                          {Number(grade.finalMark).toFixed(2)}
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
              <div className='mt-4 sm:mt-6 pt-4 border-t border-border'>
                <div className='flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4'>
                  <div className='text-base sm:text-lg font-semibold text-foreground'>
                    Overall Summary:
                  </div>
                  <div className='grid grid-cols-2 sm:flex sm:gap-8 gap-2 text-xs sm:text-sm'>
                    <span className='text-muted-foreground'>
                      Total GP:{' '}
                      <span className='font-bold text-foreground'>
                        {resultData.result.totalGp}
                      </span>
                    </span>
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
