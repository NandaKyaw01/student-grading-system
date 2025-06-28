import { AcademicYearResultViewWithDetails } from '@/actions/academic-result';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  AlertTriangle,
  Award,
  BookOpen,
  Calendar,
  GraduationCap,
  Plus,
  TrendingUp,
  Trophy,
  User
} from 'lucide-react';
import Link from 'next/link';
import { AcademicResultDownloadButton } from './academic-year-result-download-button';

interface Props {
  data: AcademicYearResultViewWithDetails;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'PASS':
      return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800';
    case 'FAIL':
      return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800';
    default:
      return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800';
  }
};

const getGpaColor = (gpa: number) => {
  if (gpa >= 3.5) return 'text-green-600 dark:text-green-400';
  if (gpa >= 3.0) return 'text-blue-600 dark:text-blue-400';
  if (gpa >= 2.5) return 'text-yellow-600 dark:text-yellow-400';
  return 'text-red-600 dark:text-red-400';
};

const getGradeColor = (grade: string) => {
  switch (grade) {
    case 'A+':
    case 'A':
    case 'A-':
      return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800';
    case 'B+':
    case 'B':
    case 'B-':
      return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800';
    case 'C+':
    case 'C':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800';
    case 'D':
      return 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800';
    case 'F':
      return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700';
  }
};

export default function AcademicYearResultView({ data }: Props) {
  // Find missing semesters
  const allSemesters = data.academicYear.semesters;
  const completedSemesterIds = data.semesterResults.map(
    (result) => result.enrollment.semester.id
  );
  const missingSemesters = allSemesters.filter(
    (semester) => !completedSemesterIds.includes(semester.id)
  );

  return (
    <div className='max-w-6xl mx-auto space-y-4 sm:space-y-6 px-4 sm:px-6'>
      {/* Header */}
      <div className='text-center space-y-2'>
        <h1 className='text-2xl sm:text-3xl font-bold text-foreground'>
          Academic Year Result
        </h1>
        <p className='text-sm sm:text-base text-muted-foreground'>
          Comprehensive academic performance for {data.academicYear.yearRange}
        </p>
      </div>

      {/* Student Info & Overview */}
      <Card className='shadow-lg border-0 bg-card/80 backdrop-blur pt-0'>
        <CardHeader className='bg-primary text-primary-foreground py-4 sm:py-6 rounded-t-lg'>
          <div className='flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4'>
            <div className='min-w-0 flex-1'>
              <CardTitle className='text-xl sm:text-2xl flex items-center gap-2 break-words'>
                <User className='h-5 w-5 sm:h-6 sm:w-6 flex-shrink-0' />
                <span className='truncate'>{data.student.studentName}</span>
              </CardTitle>
              <CardDescription className='text-primary-foreground/80 text-sm sm:text-base'>
                Admission ID: {data.student.admissionId}
              </CardDescription>
            </div>
            <div className='flex-shrink-0'>
              <AcademicResultDownloadButton resultData={data} />
            </div>
          </div>
        </CardHeader>
        <CardContent className='p-4 sm:p-6'>
          <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4'>
            <div className='flex items-center gap-3'>
              <Calendar className='h-5 w-5 text-primary flex-shrink-0' />
              <div className='min-w-0 flex-1'>
                <p className='text-sm text-muted-foreground'>Academic Year</p>
                <p className='font-medium text-foreground truncate'>
                  {data.academicYear.yearRange}
                </p>
              </div>
            </div>
            <div className='flex items-center gap-3'>
              <TrendingUp className='h-5 w-5 text-primary flex-shrink-0' />
              <div className='min-w-0 flex-1'>
                <p className='text-sm text-muted-foreground'>Overall GPA</p>
                <p className={`font-medium ${getGpaColor(data.overallGpa)}`}>
                  {data.overallGpa}
                  {!data.isComplete && (
                    <span className='text-xs text-muted-foreground ml-1'>
                      (Partial)
                    </span>
                  )}
                </p>
              </div>
            </div>
            <div className='flex items-center gap-3'>
              <BookOpen className='h-5 w-5 text-primary flex-shrink-0' />
              <div className='min-w-0 flex-1'>
                <p className='text-sm text-muted-foreground'>Total Credits</p>
                <p className='font-medium text-foreground'>
                  {data.totalCredits}
                </p>
              </div>
            </div>
            <div className='flex items-center gap-3'>
              <Award className='h-5 w-5 text-primary flex-shrink-0' />
              <div className='min-w-0 flex-1'>
                <p className='text-sm text-muted-foreground'>Total GP</p>
                <p className='font-medium text-foreground'>{data.totalGp}</p>
              </div>
            </div>
            <div className='flex items-center gap-3'>
              <Trophy className='h-5 w-5 text-primary flex-shrink-0' />
              <div className='min-w-0 flex-1'>
                <p className='text-sm text-muted-foreground'>Status</p>
                <Badge className={getStatusColor(data.status)}>
                  {data.status}
                </Badge>
              </div>
            </div>
          </div>
          {data.yearRank && (
            <div className='mt-4 pt-4 border-t border-border'>
              <div className='flex items-center gap-2 text-sm text-muted-foreground'>
                <Trophy className='h-4 w-4' />
                Academic Year Rank: #{data.yearRank}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className='grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-6'>
        <Card
          className='shadow-lg border-0 bg-gradient-to-br from-green-50 to-emerald-50
            dark:from-green-950/50 dark:to-emerald-950/50'
        >
          <CardContent className='pt-4 sm:pt-6 p-3 sm:p-6'>
            <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2'>
              <div className='min-w-0 flex-1'>
                <p className='text-xs sm:text-sm text-muted-foreground'>
                  Overall GPA
                </p>
                <p
                  className={`text-3xl sm:text-3xl font-bold ${getGpaColor(data.overallGpa)}`}
                >
                  {data.overallGpa}
                </p>
              </div>
              <div className='p-2 sm:p-3 bg-green-100 dark:bg-green-900/50 rounded-full self-end sm:self-auto'>
                <TrendingUp className='h-10 w-10 sm:h-6 sm:w-6 text-green-600 dark:text-green-400' />
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
                <p className='text-3xl sm:text-3xl font-bold text-blue-600 dark:text-blue-400'>
                  {data.totalCredits}
                </p>
              </div>
              <div className='p-2 sm:p-3 bg-blue-100 dark:bg-blue-900/50 rounded-full self-end sm:self-auto'>
                <BookOpen className='h-10 w-10 sm:h-6 sm:w-6 text-blue-600 dark:text-blue-400' />
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
                  Completion
                </p>
                <p className='text-3xl sm:text-3xl font-bold text-purple-600 dark:text-purple-400'>
                  {Math.round(
                    (data.semesterResults.length / allSemesters.length) * 100
                  )}
                  %
                </p>
              </div>
              <div
                className='p-2 sm:p-3 bg-purple-100 dark:bg-purple-900/50 rounded-full self-end
                  sm:self-auto'
              >
                <Calendar className='h-10 w-10 sm:h-6 sm:w-6 text-purple-600 dark:text-purple-400' />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Missing Results Alert */}
      {missingSemesters.length > 0 && (
        <Alert
          className='border-yellow-200 bg-yellow-50/80 dark:border-yellow-800 dark:bg-yellow-950/30
            backdrop-blur'
        >
          <AlertTriangle className='h-4 w-4' />
          <AlertTitle className='text-yellow-800 dark:text-yellow-200'>
            Missing Semester Results
          </AlertTitle>
          <AlertDescription className='text-yellow-700 dark:text-yellow-300 mt-2'>
            <p className='mb-4'>
              The following semester results are missing for this academic year:
            </p>
            <div className='space-y-3'>
              {missingSemesters.map((semester) => (
                <div
                  key={semester.id}
                  className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-3
                    bg-yellow-100/80 dark:bg-yellow-900/30 rounded-lg backdrop-blur'
                >
                  <div>
                    <p className='font-medium text-yellow-800 dark:text-yellow-200'>
                      {semester.semesterName}
                    </p>
                    <p className='text-sm text-yellow-700 dark:text-yellow-300'>
                      Result not yet created for this semester
                    </p>
                  </div>
                  <Button
                    asChild
                    size='sm'
                    className='w-full sm:w-auto bg-yellow-600 hover:bg-yellow-700 text-white'
                  >
                    <Link
                      href={`/admin/results/new/?semesterId=${semester.id}&studentId=${data.studentId}&academicYearId=${data.academicYearId}`}
                    >
                      <Plus className='h-4 w-4 mr-2' />
                      Create Result
                    </Link>
                  </Button>
                </div>
              ))}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Semester Results */}
      <Card className='shadow-lg border-0 bg-card/80 backdrop-blur'>
        <CardHeader className='p-4 sm:p-6'>
          <CardTitle className='text-lg sm:text-xl text-foreground flex items-center gap-2'>
            <Calendar className='h-5 w-5' />
            Semester Results ({data.semesterResults.length} of{' '}
            {allSemesters.length})
          </CardTitle>
          <CardDescription className='text-sm sm:text-base text-muted-foreground'>
            Detailed semester-wise academic performance breakdown
          </CardDescription>
        </CardHeader>
        <CardContent className='p-4 sm:p-6 pt-0'>
          {data.semesterResults.length === 0 ? (
            <div className='text-center py-12'>
              <Calendar className='h-12 w-12 text-muted-foreground mb-4 mx-auto' />
              <h3 className='text-lg font-semibold text-muted-foreground mb-2'>
                No Results Available
              </h3>
              <p className='text-sm text-muted-foreground mb-4'>
                No semester results have been created for this academic year
                yet.
              </p>
              <Button asChild>
                <Link
                  href={`/results/create?academicYearId=${data.academicYearId}&studentId=${data.studentId}`}
                >
                  <Plus className='h-4 w-4 mr-2' />
                  Create First Result
                </Link>
              </Button>
            </div>
          ) : (
            <div className='space-y-6'>
              {data.semesterResults.map((semesterResult, index) => (
                <div key={semesterResult.enrollmentId}>
                  <Card className='border border-border/50'>
                    <CardHeader className='pb-4'>
                      <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2'>
                        <CardTitle className='text-lg flex items-center gap-2'>
                          <GraduationCap className='h-5 w-5' />
                          {semesterResult.enrollment.semester.semesterName}
                        </CardTitle>
                        <div className='flex items-center gap-2'>
                          <Badge
                            className={getStatusColor(semesterResult.status)}
                          >
                            {semesterResult.status}
                          </Badge>
                          <span
                            className={`font-semibold ${getGpaColor(semesterResult.gpa)}`}
                          >
                            GPA: {semesterResult.gpa}
                          </span>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className='grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4'>
                        <div className='flex items-center gap-3'>
                          <GraduationCap className='h-4 w-4 text-primary flex-shrink-0' />
                          <div className='min-w-0 flex-1'>
                            <p className='text-sm text-muted-foreground'>
                              Class
                            </p>
                            <p className='font-medium text-foreground'>
                              {semesterResult.enrollment.class.className} (
                              {semesterResult.enrollment.class.departmentCode})
                            </p>
                          </div>
                        </div>
                        <div className='flex items-center gap-3'>
                          <User className='h-4 w-4 text-primary flex-shrink-0' />
                          <div className='min-w-0 flex-1'>
                            <p className='text-sm text-muted-foreground'>
                              Roll Number
                            </p>
                            <p className='font-medium text-foreground'>
                              {semesterResult.enrollment.rollNumber}
                            </p>
                          </div>
                        </div>
                        <div className='flex items-center gap-3'>
                          <BookOpen className='h-4 w-4 text-primary flex-shrink-0' />
                          <div className='min-w-0 flex-1'>
                            <p className='text-sm text-muted-foreground'>
                              Credits
                            </p>
                            <p className='font-medium text-foreground'>
                              {semesterResult.totalCredits}
                            </p>
                          </div>
                        </div>
                      </div>

                      <Separator className='my-4' />

                      {/* Subject Grades - Mobile View */}
                      <div className='block sm:hidden space-y-4'>
                        <h4 className='font-medium text-foreground'>
                          Subject Grades
                        </h4>
                        {semesterResult.enrollment.grades.map((grade) => (
                          <Card
                            key={grade.id}
                            className='border border-border/50'
                          >
                            <CardContent className='p-4'>
                              <div className='space-y-3'>
                                <div className='flex justify-between items-start'>
                                  <div className='min-w-0 flex-1'>
                                    <p className='font-semibold text-foreground text-sm'>
                                      {grade.classSubject.subject.id}
                                    </p>
                                    <p className='text-xs text-muted-foreground truncate'>
                                      {grade.classSubject.subject.subjectName}
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
                                      {grade.classSubject.subject.creditHours}
                                    </span>
                                  </div>
                                  <div>
                                    <span className='text-muted-foreground'>
                                      GP:{' '}
                                    </span>
                                    <span className='font-medium text-foreground'>
                                      {grade.gp}
                                    </span>
                                  </div>
                                </div>

                                <div className='pt-2 border-t border-border/50'>
                                  <span className='text-muted-foreground text-xs'>
                                    Final Mark:{' '}
                                  </span>
                                  <span className='font-bold text-foreground'>
                                    {grade.finalMark}
                                  </span>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>

                      {/* Subject Grades - Desktop View */}
                      <div className='hidden sm:block'>
                        <h4 className='font-medium text-foreground mb-4'>
                          Subject Grades
                        </h4>
                        <div className='space-y-3'>
                          {semesterResult.enrollment.grades.map((grade) => (
                            <div
                              key={grade.id}
                              className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-4
                                rounded-lg border border-border/50 bg-muted/30'
                            >
                              <div className='flex-1 min-w-0'>
                                <p className='font-medium text-foreground'>
                                  {grade.classSubject.subject.subjectName}
                                </p>
                                <p className='text-sm text-muted-foreground'>
                                  {grade.classSubject.subject.id} •{' '}
                                  {grade.classSubject.subject.creditHours}{' '}
                                  credits
                                </p>
                              </div>
                              <div className='flex items-center gap-6 text-sm'>
                                <div className='text-center'>
                                  <p className='text-muted-foreground'>
                                    Final Mark
                                  </p>
                                  <p className='font-medium text-foreground'>
                                    {grade.finalMark}
                                  </p>
                                </div>
                                <div className='text-center'>
                                  <p className='text-muted-foreground'>Grade</p>
                                  <Badge className={getGradeColor(grade.grade)}>
                                    {grade.grade}
                                  </Badge>
                                </div>
                                <div className='text-center'>
                                  <p className='text-muted-foreground'>GP</p>
                                  <p className='font-medium text-foreground'>
                                    {grade.gp}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Semester Summary */}
                      <div className='mt-4 pt-4 border-t border-border'>
                        <div className='flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4'>
                          <div className='text-base sm:text-lg font-semibold text-foreground'>
                            Semester Summary:
                          </div>
                          <div className='grid grid-cols-2 sm:flex sm:gap-6 gap-2 text-xs sm:text-sm'>
                            <span className='text-muted-foreground'>
                              Credits:{' '}
                              <span className='font-bold text-foreground'>
                                {semesterResult.totalCredits}
                              </span>
                            </span>
                            <span className='text-muted-foreground'>
                              GPA:{' '}
                              <span
                                className={`font-bold ${getGpaColor(semesterResult.gpa)}`}
                              >
                                {semesterResult.gpa}
                              </span>
                            </span>
                            <span className='text-muted-foreground'>
                              Status:{' '}
                              <span className='font-bold text-foreground'>
                                {semesterResult.status}
                              </span>
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  {index < data.semesterResults.length - 1 && (
                    <Separator className='my-4' />
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
