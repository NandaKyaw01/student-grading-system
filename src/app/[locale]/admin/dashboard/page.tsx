import React, { Suspense } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Users,
  BookOpen,
  GraduationCap,
  TrendingUp,
  Calendar,
  Award,
  BarChart3,
  Activity,
  Clock,
  AlertCircle
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

// Import server actions
import {
  getDashboardStats,
  getClassesWithEnrollments,
  getTopPerformingStudents,
  getRecentEnrollments,
  getSubjectPerformance,
  getGradeDistribution,
  getDepartmentDistribution
} from '@/actions/dashboard';

// Import client components for charts
import { DashboardCharts } from './components/dashboard-charts';
import { ContentLayout } from '@/components/admin-panel/content-layout';
import { ActiveBreadcrumb } from '@/components/active-breadcrumb';
import { useTranslations } from 'next-intl';

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

const breadcrumb: BreadcrumbProps[] = [
  {
    name: 'Home',
    link: '/'
  },
  {
    name: 'Dashboard',
    link: ''
  }
];

// Error fallback component
function ErrorFallback({
  error,
  componentName
}: {
  error: Error;
  componentName: string;
}) {
  return (
    <Card>
      <CardContent className='flex items-center justify-center h-24 text-destructive'>
        <AlertCircle className='h-5 w-5 mr-2' />
        <span className='text-sm'>Failed to load {componentName}</span>
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
async function StatsCards() {
  const stats = await getDashboardStats();

  return (
    <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
      <Card>
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
          <CardTitle className='text-sm font-medium'>Total Students</CardTitle>
          <Users className='h-4 w-4 text-muted-foreground' />
        </CardHeader>
        <CardContent>
          <div className='text-2xl font-bold'>{stats.totalStudents}</div>
          <p className='text-xs text-muted-foreground'>Active enrollments</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
          <CardTitle className='text-sm font-medium'>Total Classes</CardTitle>
          <BookOpen className='h-4 w-4 text-muted-foreground' />
        </CardHeader>
        <CardContent>
          <div className='text-2xl font-bold'>{stats.totalClasses}</div>
          <p className='text-xs text-muted-foreground'>Active classes</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
          <CardTitle className='text-sm font-medium'>Total Subjects</CardTitle>
          <GraduationCap className='h-4 w-4 text-muted-foreground' />
        </CardHeader>
        <CardContent>
          <div className='text-2xl font-bold'>{stats.totalSubjects}</div>
          <p className='text-xs text-muted-foreground'>Available courses</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
          <CardTitle className='text-sm font-medium'>
            Current Semester
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
async function RecentEnrollmentsCard() {
  const enrollments = await getRecentEnrollments();

  return (
    <Card>
      <CardHeader>
        <CardTitle className='flex items-center'>
          <Clock className='h-5 w-5 mr-2' />
          Recent Enrollments
        </CardTitle>
        <CardDescription>Latest student enrollments</CardDescription>
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
                    .join('')}
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
              {/* <Badge variant={enrollment.isActive ? 'default' : 'secondary'}>
                {enrollment.isActive ? 'Active' : 'Inactive'}
              </Badge> */}
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
async function TopStudentsCard() {
  const students = await getTopPerformingStudents();

  return (
    <Card>
      <CardHeader>
        <CardTitle className='flex items-center'>
          <Award className='h-5 w-5 mr-2' />
          Top Performing Students
        </CardTitle>
        <CardDescription>Students with highest GPA</CardDescription>
      </CardHeader>
      <CardContent>
        <div className='space-y-4'>
          {students.map((student, index) => (
            <div key={student.id} className='flex items-center space-x-4'>
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
                <p className='text-xs text-muted-foreground'>GPA</p>
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
async function ClassesCard() {
  const classes = await getClassesWithEnrollments();

  return (
    <Card>
      <CardHeader>
        <CardTitle className='flex items-center'>
          <BookOpen className='h-5 w-5 mr-2' />
          Class Enrollments
        </CardTitle>
        <CardDescription>Number of students per class</CardDescription>
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
                <p className='text-xs text-muted-foreground'>Students</p>
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
async function SubjectPerformanceCard() {
  const subjects = await getSubjectPerformance();

  return (
    <Card>
      <CardHeader>
        <CardTitle className='flex items-center'>
          <TrendingUp className='h-5 w-5 mr-2' />
          Subject Performance
        </CardTitle>
        <CardDescription>Average performance by subject</CardDescription>
      </CardHeader>
      <CardContent>
        <div className='space-y-4'>
          {subjects.map((subject, index) => (
            <div key={index} className='space-y-2'>
              <div className='flex justify-between text-sm'>
                <span className='font-medium'>{subject.subjectName}</span>
                <span>GPA: {subject.averageGpa}</span>
              </div>
              <div className='flex justify-between text-xs text-muted-foreground'>
                <span>{subject.totalStudents} students</span>
                <span>{subject.passRate}% pass rate</span>
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
async function ChartsSection() {
  const [gradeDistribution, departmentDistribution] = await Promise.all([
    getGradeDistribution(),
    getDepartmentDistribution()
  ]);

  return (
    <DashboardCharts
      gradeDistribution={gradeDistribution}
      departmentDistribution={departmentDistribution}
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
async function QuickStatsCard() {
  const stats = await getDashboardStats();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Stats</CardTitle>
        <CardDescription>System overview</CardDescription>
      </CardHeader>
      <CardContent className='space-y-4'>
        <div className='flex justify-between'>
          <span className='text-sm'>Active Students:</span>
          <span className='text-sm font-medium'>{stats.totalStudents}</span>
        </div>
        <div className='flex justify-between'>
          <span className='text-sm'>Total Classes:</span>
          <span className='text-sm font-medium'>{stats.totalClasses}</span>
        </div>
        <div className='flex justify-between'>
          <span className='text-sm'>Available Subjects:</span>
          <span className='text-sm font-medium'>{stats.totalSubjects}</span>
        </div>
        <div className='flex justify-between'>
          <span className='text-sm'>Current Period:</span>
          <span className='text-sm font-medium'>{stats.currentSemester}</span>
        </div>
      </CardContent>
    </Card>
  );
}

// Main Dashboard Component
export default function DashboardPage() {
  const t = useTranslations('AdminNavBarTitle');

  return (
    <ContentLayout
      title={t('dashboard')}
      breadcrumb={<ActiveBreadcrumb path={breadcrumb} />}
    >
      <div className='container mx-auto p-4 space-y-6'>
        {/* Stats Cards */}
        <Suspense fallback={<StatsCardsSkeleton />}>
          <StatsCards />
        </Suspense>

        {/* Main Dashboard Content */}
        <Tabs defaultValue='overview' className='space-y-4'>
          <TabsList className='grid w-full grid-cols-4'>
            <TabsTrigger value='overview'>Overview</TabsTrigger>
            <TabsTrigger value='students'>Students</TabsTrigger>
            <TabsTrigger value='classes'>Classes</TabsTrigger>
            <TabsTrigger value='performance'>Performance</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value='overview' className='space-y-4'>
            <Suspense fallback={<ChartsSkeleton />}>
              <ChartsSection />
            </Suspense>
            <Suspense fallback={<RecentEnrollmentsSkeleton />}>
              <RecentEnrollmentsCard />
            </Suspense>
          </TabsContent>

          {/* Students Tab */}
          <TabsContent value='students' className='space-y-4'>
            <Suspense fallback={<TopStudentsSkeleton />}>
              <TopStudentsCard />
            </Suspense>
          </TabsContent>

          {/* Classes Tab */}
          <TabsContent value='classes' className='space-y-4'>
            <Suspense fallback={<ClassesSkeleton />}>
              <ClassesCard />
            </Suspense>
          </TabsContent>

          {/* Performance Tab */}
          <TabsContent value='performance' className='space-y-4'>
            <div className='grid gap-4 lg:grid-cols-2'>
              <Suspense fallback={<SubjectPerformanceSkeleton />}>
                <SubjectPerformanceCard />
              </Suspense>
              <Suspense fallback={<QuickStatsSkeleton />}>
                <QuickStatsCard />
              </Suspense>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </ContentLayout>
  );
}
