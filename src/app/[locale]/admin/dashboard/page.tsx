import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  AlertCircle,
  Award,
  BookOpen,
  Calendar,
  Clock,
  GraduationCap,
  TrendingUp,
  Users
} from 'lucide-react';
import { Suspense } from 'react';

// Import server actions
import {
  getAcademicYearId,
  getClassesWithEnrollments,
  getDashboardStats,
  getGradeDistribution,
  getRecentEnrollments,
  getStudentStatusDistribution,
  getSubjectPerformance,
  getTopPerformingStudents
} from '@/actions/dashboard';

// Import client components for charts
import { ActiveBreadcrumb } from '@/components/active-breadcrumb';
import { ContentLayout } from '@/components/admin-panel/content-layout';
import { useTranslations } from 'next-intl';
import { getTranslations } from 'next-intl/server';
import { DashboardCharts } from './components/dashboard-charts';
import { DashboardWrapper } from './components/dashborad-wrapper';

// Color palette for charts
const COLORS = [
  '#0088FE',
  '#00C49F',
  '#FFBB28',
  '#FF8042',
  '#8884D8',
  '#82CA9D'
];

type BreadcrumbProps = {
  name: string;
  link: string;
};

interface DashboardPageProps {
  searchParams: Promise<{ year?: string }>;
}

// Error fallback component
function ErrorFallback({
  error,
  componentName
}: {
  error: string;
  componentName: string;
}) {
  const t = useTranslations('DashboardPage.error_fallback');
  return (
    <Card>
      <CardContent className='flex items-center justify-center h-24 text-destructive'>
        <AlertCircle className='h-5 w-5 mr-2' />
        <span className='text-sm'>
          {t('failed_to_load', { componentName, error })}
        </span>
      </CardContent>
    </Card>
  );
}

// Stats Cards Component Skeleton
function StatsCardsSkeleton() {
  return (
    <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
      {[...Array(4)].map((_, i) => (
        <Card key={i}>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <Skeleton className='h-4 w-[100px]' />
            <Skeleton className='h-4 w-4 rounded-full' />
          </CardHeader>
          <CardContent>
            <Skeleton className='h-8 w-[80px] mb-1' />
            <Skeleton className='h-3 w-[120px]' />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// Stats Cards Component
async function StatsCards({
  academicYearId
}: {
  academicYearId: number | null;
}) {
  const t = await getTranslations('DashboardPage.stats_cards');
  const statsResponse = await getDashboardStats(academicYearId);

  if (!statsResponse.success || !statsResponse.data) {
    return (
      <ErrorFallback
        error={statsResponse.error || 'Unknown error'}
        componentName='Dashboard Stats'
      />
    );
  }

  const stats = statsResponse.data;

  return (
    <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
      <Card>
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
          <CardTitle className='text-sm font-medium'>
            {t('total_students')}
          </CardTitle>
          <Users className='h-4 w-4 text-muted-foreground' />
        </CardHeader>
        <CardContent>
          <div className='text-2xl font-bold'>{stats.totalStudents}</div>
          <p className='text-xs text-muted-foreground'>
            {t('active_enrollments')}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
          <CardTitle className='text-sm font-medium'>
            {t('total_classes')}
          </CardTitle>
          <BookOpen className='h-4 w-4 text-muted-foreground' />
        </CardHeader>
        <CardContent>
          <div className='text-2xl font-bold'>{stats.totalClasses}</div>
          <p className='text-xs text-muted-foreground'>{t('active_classes')}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
          <CardTitle className='text-sm font-medium'>
            {t('total_subjects')}
          </CardTitle>
          <GraduationCap className='h-4 w-4 text-muted-foreground' />
        </CardHeader>
        <CardContent>
          <div className='text-2xl font-bold'>{stats.totalSubjects}</div>
          <p className='text-xs text-muted-foreground'>
            {t('available_courses')}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
          <CardTitle className='text-sm font-medium'>
            {t('current_semester')}
          </CardTitle>
          <Calendar className='h-4 w-4 text-muted-foreground' />
        </CardHeader>
        <CardContent>
          <div className='text-2xl font-bold'>{stats.currentSemester}</div>
          <p className='text-xs text-muted-foreground'>
            {stats.currentAcademicYear}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

// Recent Enrollments Skeleton
function RecentEnrollmentsSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className='h-6 w-[200px]' />
        <Skeleton className='h-4 w-[250px]' />
      </CardHeader>
      <CardContent className='space-y-4'>
        {[...Array(5)].map((_, i) => (
          <div key={i} className='flex items-center space-x-4'>
            <Skeleton className='h-10 w-10 rounded-full' />
            <div className='flex-1 space-y-2'>
              <Skeleton className='h-4 w-[120px]' />
              <Skeleton className='h-3 w-[180px]' />
            </div>
            <Skeleton className='h-6 w-[60px] rounded-full' />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

// Recent Enrollments Component
async function RecentEnrollmentsCard({
  academicYearId
}: {
  academicYearId: number | null;
}) {
  const t = await getTranslations('DashboardPage.recent_enrollments');
  const enrollmentsResponse = await getRecentEnrollments(academicYearId);

  if (!enrollmentsResponse.success || !enrollmentsResponse.data) {
    return (
      <ErrorFallback
        error={enrollmentsResponse.error || 'Unknown error'}
        componentName={t('title')}
      />
    );
  }

  const enrollments = enrollmentsResponse.data;

  return (
    <Card>
      <CardHeader>
        <CardTitle className='flex items-center'>
          <Clock className='h-5 w-5 mr-2' />
          {t('title')}
        </CardTitle>
        <CardDescription>{t('description')}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className='space-y-4'>
          {enrollments.map((enrollment) => (
            <div key={enrollment.id} className='flex items-center space-x-4'>
              <Avatar>
                <AvatarFallback>
                  {enrollment.student.studentName
                    .split(' ')
                    .map((n) => n[0])
                    .join('').toUpperCase().slice(0, 2)
                  }
                </AvatarFallback>
              </Avatar>
              <div className='flex-1 space-y-1'>
                <p className='text-sm font-medium leading-none'>
                  {enrollment.student.studentName}
                </p>
                <p className='text-sm text-muted-foreground'>
                  {enrollment.student.admissionId} •{' '}
                  {enrollment.class.className} (
                  {enrollment.class.departmentCode})
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// Top Students Skeleton
function TopStudentsSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className='h-6 w-[200px]' />
        <Skeleton className='h-4 w-[250px]' />
      </CardHeader>
      <CardContent className='space-y-4'>
        {[...Array(5)].map((_, i) => (
          <div key={i} className='flex items-center space-x-4'>
            <Skeleton className='h-8 w-8 rounded-full' />
            <Skeleton className='h-10 w-10 rounded-full' />
            <div className='flex-1 space-y-2'>
              <Skeleton className='h-4 w-[120px]' />
              <Skeleton className='h-3 w-[180px]' />
            </div>
            <div className='space-y-1'>
              <Skeleton className='h-4 w-[40px]' />
              <Skeleton className='h-3 w-[30px]' />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

// Top Students Component
async function TopStudentsCard({
  academicYearId
}: {
  academicYearId: number | null;
}) {
  const t = await getTranslations('DashboardPage.top_students');
  const studentsResponse = await getTopPerformingStudents(academicYearId);

  if (!studentsResponse.success || !studentsResponse.data) {
    return (
      <ErrorFallback
        error={studentsResponse.error || 'Unknown error'}
        componentName={t('title')}
      />
    );
  }

  const students = studentsResponse.data;

  return (
    <Card>
      <CardHeader>
        <CardTitle className='flex items-center'>
          <Award className='h-5 w-5 mr-2' />
          {t('title')}
        </CardTitle>
        <CardDescription>{t('description')}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className='space-y-4'>
          {students.map((student, index) => (
            <div
              key={student.departmentCode + index + Date.now()}
              className='flex items-center space-x-4'
            >
              <div
                className='flex h-8 w-8 items-center justify-center rounded-full bg-primary
                  text-primary-foreground text-sm font-bold'
              >
                {index + 1}
              </div>
              <Avatar>
                <AvatarFallback>
                  {student.studentName
                    .split(' ')
                    .map((n) => n[0])
                    .join('')}
                </AvatarFallback>
              </Avatar>
              <div className='flex-1 space-y-1'>
                <p className='text-sm font-medium leading-none'>
                  {student.studentName}
                </p>
                <p className='text-sm text-muted-foreground'>
                  {student.admissionId} • {student.className} (
                  {student.departmentCode})
                </p>
              </div>
              <div className='text-right'>
                <p className='text-sm font-bold'>{student.gpa.toFixed(2)}</p>
                <p className='text-xs text-muted-foreground'>{t('gpa')}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// Classes Skeleton
function ClassesSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className='h-6 w-[200px]' />
        <Skeleton className='h-4 w-[250px]' />
      </CardHeader>
      <CardContent className='space-y-4'>
        {[...Array(5)].map((_, i) => (
          <div key={i} className='flex items-center space-x-4'>
            <Skeleton className='h-10 w-10 rounded-lg' />
            <div className='flex-1 space-y-2'>
              <div className='flex space-x-2'>
                <Skeleton className='h-4 w-[100px]' />
                <Skeleton className='h-4 w-[50px]' />
              </div>
              <Skeleton className='h-3 w-[180px]' />
            </div>
            <div className='space-y-1'>
              <Skeleton className='h-4 w-[40px]' />
              <Skeleton className='h-3 w-[50px]' />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

// Classes with Enrollments Component
async function ClassesCard({
  academicYearId
}: {
  academicYearId: number | null;
}) {
  const t = await getTranslations('DashboardPage.class_enrollments');
  const classesResponse = await getClassesWithEnrollments(academicYearId);

  if (!classesResponse.success || !classesResponse.data) {
    return (
      <ErrorFallback
        error={classesResponse.error || 'Unknown error'}
        componentName={t('title')}
      />
    );
  }

  const classes = classesResponse.data;

  return (
    <Card>
      <CardHeader>
        <CardTitle className='flex items-center'>
          <BookOpen className='h-5 w-5 mr-2' />
          {t('title')}
        </CardTitle>
        <CardDescription>{t('description')}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className='space-y-4'>
          {classes.map((classItem) => (
            <div key={classItem.id} className='flex items-center space-x-4'>
              <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-muted'>
                <BookOpen className='h-5 w-5' />
              </div>
              <div className='flex-1 space-y-1'>
                <div className='flex items-center space-x-2'>
                  <p className='text-sm font-medium leading-none'>
                    {classItem.className}
                  </p>
                  <Badge variant='outline'>{classItem.departmentCode}</Badge>
                </div>
                <p className='text-sm text-muted-foreground'>
                  {classItem.semester.semesterName} -{' '}
                  {classItem.semester.academicYear.yearRange}
                </p>
              </div>
              <div className='text-right'>
                <p className='text-sm font-bold'>
                  {classItem._count.enrollments}
                </p>
                <p className='text-xs text-muted-foreground'>{t('students')}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// Subject Performance Skeleton
function SubjectPerformanceSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className='h-6 w-[200px]' />
        <Skeleton className='h-4 w-[250px]' />
      </CardHeader>
      <CardContent className='space-y-4'>
        {[...Array(5)].map((_, i) => (
          <div key={i} className='space-y-2'>
            <div className='flex justify-between'>
              <Skeleton className='h-4 w-[120px]' />
              <Skeleton className='h-4 w-[60px]' />
            </div>
            <div className='flex justify-between'>
              <Skeleton className='h-3 w-[80px]' />
              <Skeleton className='h-3 w-[80px]' />
            </div>
            <Skeleton className='h-2 w-full' />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

// Subject Performance Component
async function SubjectPerformanceCard({
  academicYearId
}: {
  academicYearId: number | null;
}) {
  const t = await getTranslations('DashboardPage.subject_performance');
  const subjectsResponse = await getSubjectPerformance(academicYearId);

  if (!subjectsResponse.success || !subjectsResponse.data) {
    return (
      <ErrorFallback
        error={subjectsResponse.error || 'Unknown error'}
        componentName={t('title')}
      />
    );
  }

  const subjects = subjectsResponse.data;

  return (
    <Card>
      <CardHeader>
        <CardTitle className='flex items-center'>
          <TrendingUp className='h-5 w-5 mr-2' />
          {t('title')}
        </CardTitle>
        <CardDescription>{t('description')}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className='space-y-4'>
          {subjects.map((subject, index) => (
            <div key={index} className='space-y-2'>
              <div className='flex justify-between text-sm'>
                <span className='font-medium'>{subject.subjectName}</span>
                <span>{t('gp', { gp: subject.averageGpa })}</span>
              </div>
              <div className='flex justify-between text-xs text-muted-foreground'>
                <span>{t('students', { count: subject.totalStudents })}</span>
                <span>{t('pass_rate', { rate: subject.passRate })}</span>
              </div>
              <Progress value={subject.passRate} className='h-2' />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// Charts Skeleton
function ChartsSkeleton() {
  return (
    <div className='grid gap-4 md:grid-cols-2'>
      <Card>
        <CardHeader>
          <Skeleton className='h-6 w-[200px]' />
          <Skeleton className='h-4 w-[250px]' />
        </CardHeader>
        <CardContent>
          <Skeleton className='h-[300px] w-full' />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <Skeleton className='h-6 w-[200px]' />
          <Skeleton className='h-4 w-[250px]' />
        </CardHeader>
        <CardContent>
          <Skeleton className='h-[300px] w-full' />
        </CardContent>
      </Card>
    </div>
  );
}

// Charts Component (will be client-side)
async function ChartsSection({
  academicYearId
}: {
  academicYearId: number | null;
}) {
  const t = await getTranslations('DashboardPage.charts');
  const [gradeDistributionResponse, statusDistributionResponse] =
    await Promise.all([
      getGradeDistribution(academicYearId),
      getStudentStatusDistribution(academicYearId)
    ]);

  // Handle errors for charts
  if (
    !gradeDistributionResponse.success ||
    !statusDistributionResponse.success
  ) {
    return (
      <div className='grid gap-4 md:grid-cols-2'>
        {!gradeDistributionResponse.success && (
          <ErrorFallback
            error={gradeDistributionResponse.error || 'Unknown error'}
            componentName={t('grade_distribution.title')}
          />
        )}
        {!statusDistributionResponse.success && (
          <ErrorFallback
            error={statusDistributionResponse.error || 'Unknown error'}
            componentName={t('status_distribution.title')}
          />
        )}
      </div>
    );
  }

  return (
    <DashboardCharts
      gradeDistribution={gradeDistributionResponse.data || []}
      statusDistribution={statusDistributionResponse.data || []}
      colors={COLORS}
    />
  );
}

// Quick Stats Skeleton
function QuickStatsSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className='h-6 w-[120px]' />
        <Skeleton className='h-4 w-[180px]' />
      </CardHeader>
      <CardContent className='space-y-4'>
        {[...Array(4)].map((_, i) => (
          <div key={i} className='flex justify-between'>
            <Skeleton className='h-4 w-[100px]' />
            <Skeleton className='h-4 w-[60px]' />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

// Quick Stats Component
async function QuickStatsCard({
  academicYearId
}: {
  academicYearId: number | null;
}) {
  const t = await getTranslations('DashboardPage.quick_stats');
  const statsResponse = await getDashboardStats(academicYearId);

  if (!statsResponse.success || !statsResponse.data) {
    return (
      <ErrorFallback
        error={statsResponse.error || 'Unknown error'}
        componentName={t('title')}
      />
    );
  }

  const stats = statsResponse.data;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('title')}</CardTitle>
        <CardDescription>{t('description')}</CardDescription>
      </CardHeader>
      <CardContent className='space-y-4'>
        <div className='flex justify-between'>
          <span className='text-sm'>{t('active_students')}</span>
          <span className='text-sm font-medium'>{stats.totalStudents}</span>
        </div>
        <div className='flex justify-between'>
          <span className='text-sm'>{t('total_classes')}</span>
          <span className='text-sm font-medium'>{stats.totalClasses}</span>
        </div>
        <div className='flex justify-between'>
          <span className='text-sm'>{t('available_subjects')}</span>
          <span className='text-sm font-medium'>{stats.totalSubjects}</span>
        </div>
        <div className='flex justify-between'>
          <span className='text-sm'>{t('current_period')}</span>
          <span className='text-sm font-medium'>{stats.currentSemester}</span>
        </div>
      </CardContent>
    </Card>
  );
}

// Main Dashboard Component
export default async function DashboardPage({
  searchParams
}: DashboardPageProps) {
  const t = await getTranslations('DashboardPage');
  const { year: selectedYear } = (await searchParams) || 'current';

  const academicYearId = await getAcademicYearId(selectedYear);

  const breadcrumb: BreadcrumbProps[] = [
    {
      name: t('home'),
      link: '/'
    },
    {
      name: t('title'),
      link: ''
    }
  ];

  return (
    <ContentLayout
      title={t('title')}
      breadcrumb={<ActiveBreadcrumb path={breadcrumb} />}
    >
      <DashboardWrapper>
        {/* Stats Cards */}
        <Suspense fallback={<StatsCardsSkeleton />}>
          <StatsCards academicYearId={academicYearId} />
        </Suspense>

        {/* Main Dashboard Content */}
        <Tabs defaultValue='overview' className='space-y-4 mt-6'>
          <TabsList className='grid w-full grid-cols-4'>
            <TabsTrigger value='overview'>{t('tabs.overview')}</TabsTrigger>
            <TabsTrigger value='students'>{t('tabs.students')}</TabsTrigger>
            <TabsTrigger value='classes'>{t('tabs.classes')}</TabsTrigger>
            <TabsTrigger value='performance'>
              {t('tabs.performance')}
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value='overview' className='space-y-4'>
            <Suspense fallback={<ChartsSkeleton />}>
              <ChartsSection academicYearId={academicYearId} />
            </Suspense>
            <Suspense fallback={<RecentEnrollmentsSkeleton />}>
              <RecentEnrollmentsCard academicYearId={academicYearId} />
            </Suspense>
          </TabsContent>

          {/* Students Tab */}
          <TabsContent value='students' className='space-y-4'>
            <Suspense fallback={<TopStudentsSkeleton />}>
              <TopStudentsCard academicYearId={academicYearId} />
            </Suspense>
          </TabsContent>

          {/* Classes Tab */}
          <TabsContent value='classes' className='space-y-4'>
            <Suspense fallback={<ClassesSkeleton />}>
              <ClassesCard academicYearId={academicYearId} />
            </Suspense>
          </TabsContent>

          {/* Performance Tab */}
          <TabsContent value='performance' className='space-y-4'>
            <div className='grid gap-4 lg:grid-cols-2'>
              <Suspense fallback={<SubjectPerformanceSkeleton />}>
                <SubjectPerformanceCard academicYearId={academicYearId} />
              </Suspense>
              <Suspense fallback={<QuickStatsSkeleton />}>
                <QuickStatsCard academicYearId={academicYearId} />
              </Suspense>
            </div>
          </TabsContent>
        </Tabs>
      </DashboardWrapper>
    </ContentLayout>
  );
}
