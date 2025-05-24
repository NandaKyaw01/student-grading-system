import { notFound } from 'next/navigation';
import StudentForm from './student-form';
import { getAllClasses } from '@/services/class';
import { getAllAcademicYears } from '@/services/academic-year';
import { getStudentById } from '@/services/student';

type StudentViewPageProps = {
  studentId: string;
};

export default async function StudentViewPage({
  studentId
}: StudentViewPageProps) {
  let student = null;
  let pageTitle = 'Create New Student';

  if (studentId !== 'new') {
    student = await getStudentById(studentId);
    if (!student) {
      notFound();
    }
    pageTitle = `Edit Student`;
  }

  const [classes, academicYears] = await Promise.all([
    getAllClasses(),
    getAllAcademicYears()
  ]);

  const classOptions = classes.classes.map((cls) => ({
    id: cls.id,
    name: cls.className
  }));

  const academicYearOptions = academicYears.academicYears.map((year) => ({
    id: year.id,
    name: year.year
  }));

  return (
    <StudentForm
      initialData={student}
      pageTitle={pageTitle}
      classOptions={classOptions}
      academicYearOptions={academicYearOptions}
    />
  );
}
