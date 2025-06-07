import {
  getAvailableSubjectsForClass,
  getClassSubjects
} from '@/services/class-subject';
import { Suspense } from 'react';
import { ClassSubjectManager } from './class-subject-manager';

interface ClassSubjectManagerWrapperProps {
  classId: number;
  className: string;
}

export async function ClassSubjectManagerWrapper({
  classId,
  className
}: ClassSubjectManagerWrapperProps) {
  const classSubjects = getClassSubjects(classId);
  const availableSubjects = getAvailableSubjectsForClass(classId);

  return (
    <Suspense fallback='loading...'>
      <ClassSubjectManager
        classId={classId}
        className={className}
        initialClassSubjects={classSubjects}
        initialAvailableSubjects={availableSubjects}
      />
    </Suspense>
  );
}
