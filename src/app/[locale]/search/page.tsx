import { getSearchFilters, searchResults as searchResultsAction, type ResultData } from '@/actions/public-result-view';
import { ActiveBreadcrumb } from '@/components/active-breadcrumb';
import { ContentLayout } from '@/components/admin-panel/content-layout';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Award, BookOpen, Calendar, GraduationCap, Search, User } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { getTranslations } from 'next-intl/server';
import SearchForm from './_components/filter-search';

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
  title: 'Results : Search Results'
};

type SearchParams = {
  academicYear?: string;
  semester?: string;
  class?: string;
  studentName?: string;
  admissionId?: string;
  rollNumber?: string;
};

type PageProps = {
  searchParams: Promise<SearchParams>;
};

export default async function SearchResultsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const t = await getTranslations('ResultsBySemester.ResultView');
  const tSearch = await getTranslations('SearchPage');

  const filterOptions = await getSearchFilters();

  const requiredFields = ['academicYear', 'semester', 'class', 'studentName', 'admissionId', 'rollNumber'];
  const missingFields = requiredFields.filter(
    (field) => !params[field as keyof SearchParams] || params[field as keyof SearchParams] === 'all'
  );

  let searchResult: ResultData | null = null;
  let validationError = '';

  if (Object.keys(params).length > 0) {
    if (missingFields.length > 0) {
      validationError = tSearch('validation_error', { fields: missingFields.join(', ') });
    } else {
      searchResult = await searchResultsAction(params); // This will now return single result
    }
  }

  return (
    <ContentLayout
      title={tSearch('breadcrumb')}
      breadcrumb={<ActiveBreadcrumb path={[{ name: t('breadcrumbs.home'), link: '/' }, { name: tSearch("breadcrumb"), link: '' }]} />}
    >
      <div className='max-w-6xl mx-auto space-y-4 sm:space-y-6 px-4 sm:px-6'>
        {/* Header */}
        <div className='space-y-2'>
          <h1 className='text-2xl sm:text-2xl font-bold text-foreground'>{tSearch('header')}</h1>
          <p className='text-sm sm:text-base text-muted-foreground'>{tSearch('description')}</p>
          <Separator />
        </div>

        {/* Search Filters */}
        <Card className='shadow-lg border-0 bg-card/80 backdrop-blur'>
          <CardHeader>
            <CardTitle className='text-lg sm:text-xl flex items-center gap-2'>
              <Search className='h-5 w-5' />
              {tSearch('search_filters')}
            </CardTitle>
            <CardDescription>{tSearch('search_filters_description')}</CardDescription>
          </CardHeader>
          <CardContent>
            <SearchForm filterOptions={filterOptions} params={params} />
          </CardContent>
        </Card>

        {validationError && (
          <Card className='shadow-lg border-0 bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800'>
            <CardContent className='pt-6'>
              <div className='text-center py-4'>
                <p className='text-red-600 dark:text-red-400 font-medium'>{validationError}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {!validationError && searchResult && (
          <div className='space-y-4'>
            <ResultCard resultData={searchResult} t={t} />
          </div>
        )}

        {!validationError && Object.keys(params).length > 0 && !searchResult && !validationError && (
          <div className='text-center py-8'>
            <p className='text-muted-foreground'>{tSearch('no_results')}</p>
          </div>
        )}
      </div>
    </ContentLayout>
  );
}

// Component to display individual result
function ResultCard({
  resultData,
  t
}: {
  resultData: ResultData;
  t: ReturnType<typeof useTranslations<'ResultsBySemester.ResultView'>>;
}) {
  const sortedGrades = resultData.grades.sort(
    (a, b) => a.subject.priority! - b.subject.priority!
  );

  return (
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
                {t('student.roll_number', {
                  number: resultData.student.rollNumber
                })}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className='p-4 sm:p-6'>
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
            <div className='flex items-center gap-3'>
              <GraduationCap className='h-5 w-5 text-primary flex-shrink-0' />
              <div className='min-w-0 flex-1'>
                <p className='text-sm text-muted-foreground'>
                  {t('enrollment.class')}
                </p>
                <p className='font-medium text-foreground truncate'>
                  {t('enrollment.class_format', {
                    name: resultData.enrollment.class,
                    code: resultData.enrollment.departmentCode
                  })}
                </p>
              </div>
            </div>
            <div className='flex items-center gap-3'>
              <Calendar className='h-5 w-5 text-primary flex-shrink-0' />
              <div className='min-w-0 flex-1'>
                <p className='text-sm text-muted-foreground'>
                  {t('enrollment.semester')}
                </p>
                <p className='font-medium text-foreground'>
                  {resultData.enrollment.semester}
                </p>
              </div>
            </div>
            <div className='flex items-center gap-3 sm:col-span-2 lg:col-span-1'>
              <BookOpen className='h-5 w-5 text-primary flex-shrink-0' />
              <div className='min-w-0 flex-1'>
                <p className='text-sm text-muted-foreground'>
                  {t('enrollment.academic_year')}
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
      <div className='grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-6'>
        <Card
          className='shadow-lg border-0 bg-gradient-to-br from-green-50 to-emerald-50
            dark:from-green-950/50 dark:to-emerald-950/50'
        >
          <CardContent className='pt-4 sm:pt-6 p-3 sm:p-6'>
            <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2'>
              <div className='min-w-0 flex-1'>
                <p className='text-xs sm:text-sm text-muted-foreground'>
                  {t('summary.current_gpa')}
                </p>
                <p
                  className={`text-3xl sm:text-3xl font-bold ${getGpaColor(resultData.result.gpa)}`}
                >
                  {resultData.result.gpa}
                </p>
              </div>
              <div className='p-2 sm:p-3 bg-green-100 dark:bg-green-900/50 rounded-full self-end sm:self-auto'>
                <GraduationCap className='h-10 w-10 sm:h-6 sm:w-6 text-green-600 dark:text-green-400' />
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
                  {t('summary.total_credits')}
                </p>
                <p className='text-3xl sm:text-3xl font-bold text-blue-600 dark:text-blue-400'>
                  {resultData.result.totalCredits}
                </p>
              </div>
              <div className='p-2 sm:p-3 bg-blue-100 dark:bg-blue-900/50 rounded-full self-end sm:self-auto'>
                <BookOpen className='h-10 w-10 sm:h-6 sm:w-6 text-blue-600 dark:text-blue-400' />
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
                  {t('summary.total_gp')}
                </p>
                <p className='text-3xl sm:text-3xl font-bold text-orange-600 dark:text-orange-400'>
                  {resultData.result.totalGp}
                </p>
              </div>
              <div
                className='p-2 sm:p-3 bg-orange-100 dark:bg-orange-900/50 rounded-full self-end
                  sm:self-auto'
              >
                <Award className='h-10 w-10 sm:h-6 sm:w-6 text-orange-600 dark:text-orange-400' />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Grades Table */}
      <Card className='shadow-lg border-0 bg-card/80 backdrop-blur'>
        <CardHeader className='p-4 sm:p-6 pb-0 sm:pb-2'>
          <CardTitle className='text-lg sm:text-xl text-foreground'>
            {t('grades.title')}
          </CardTitle>
          <CardDescription className='text-sm sm:text-base text-muted-foreground'>
            {t('grades.description')}
          </CardDescription>
        </CardHeader>
        <CardContent className='p-4 sm:p-6 pt-0 sm:pt-2'>
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

                    <div className='grid grid-cols-3 gap-2 text-xs'>
                      <div>
                        <span className='text-muted-foreground'>
                          {t('grades.mobile.credits')}
                        </span>
                        <span className='font-medium text-foreground'>
                          {grade.subject.creditHours}
                        </span>
                      </div>
                      <div>
                        <span className='text-muted-foreground'>
                          {t('grades.mobile.score')}
                        </span>
                        <span className='font-medium text-foreground'>
                          {grade.score}
                        </span>
                      </div>
                      <div>
                        <span className='text-muted-foreground'>
                          {t('grades.mobile.gp')}
                        </span>
                        <span className='font-medium text-foreground'>
                          {grade.gp}
                        </span>
                      </div>
                      <div>
                        <span className='text-muted-foreground'>
                          {t('grades.mobile.exam')}
                        </span>
                        <span className='font-medium text-foreground'>
                          {grade.examMark}
                        </span>
                      </div>
                      <div className='col-span-2'>
                        <span className='text-muted-foreground'>
                          {t('grades.mobile.assessment')}
                        </span>
                        <span className='font-medium text-foreground'>
                          {grade.assignMark}
                        </span>
                      </div>
                    </div>

                    <div className='pt-2 border-t border-border/50'>
                      <span className='text-muted-foreground text-xs'>
                        {t('grades.mobile.final_mark')}
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

          {/* Desktop View - Table Layout */}
          <div className='hidden sm:block overflow-x-auto'>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className='text-foreground min-w-[100px]'>
                    {t('grades.table.subject_code')}
                  </TableHead>
                  <TableHead className='text-foreground min-w-[100px]'>
                    {t('grades.table.subject_name')}
                  </TableHead>
                  <TableHead className='text-center text-foreground min-w-[80px]'>
                    {t('grades.table.credits')}
                  </TableHead>
                  <TableHead className='text-center text-foreground min-w-[100px]'>
                    {t('grades.table.exam_mark')}
                  </TableHead>
                  <TableHead className='text-center text-foreground min-w-[120px]'>
                    {t('grades.table.assessment_mark')}
                  </TableHead>
                  <TableHead className='text-center text-foreground min-w-[100px]'>
                    {t('grades.table.final_mark')}
                  </TableHead>
                  <TableHead className='text-center text-foreground min-w-[80px]'>
                    {t('grades.table.grade')}
                  </TableHead>
                  <TableHead className='text-center text-foreground min-w-[80px]'>
                    {t('grades.table.score')}
                  </TableHead>
                  <TableHead className='text-center text-foreground min-w-[100px]'>
                    {t('grades.table.grade_points')}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedGrades.map((grade, index) => (
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
                    <TableCell className='text-center'>{grade.score}</TableCell>
                    <TableCell className='text-center font-medium text-foreground'>
                      {grade.gp}
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
                {t('summary_footer.title')}
              </div>
              <div className='grid grid-cols-2 sm:flex sm:gap-8 gap-2 text-xs sm:text-sm'>
                <span className='text-muted-foreground'>
                  {t('summary_footer.total_gp')}
                  <span className='font-bold text-foreground'>
                    {resultData.result.totalGp}
                  </span>
                </span>
                <span className='text-muted-foreground'>
                  {t('summary_footer.total_credits')}
                  <span className='font-bold text-foreground'>
                    {resultData.result.totalCredits}
                  </span>
                </span>
                <span className='text-muted-foreground'>
                  {t('summary_footer.gpa')}
                  <span
                    className={`font-bold ${getGpaColor(resultData.result.gpa)}`}
                  >
                    {resultData.result.gpa}
                  </span>
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
