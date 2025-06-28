// hooks/useAcademicData.ts
'use client';

import { useQuery } from '@tanstack/react-query';
import {
  getAcademicYears,
  getSemesters,
  getClasses,
  getClassSubjects
} from '@/actions/import-result';

export const useAcademicYears = () => {
  return useQuery({
    queryKey: ['academicYears'],
    queryFn: getAcademicYears,
    staleTime: 5 * 60 * 1000, // 5 minutes
    select: (data) => (data.success ? data.data : [])
  });
};

export const useSemesters = (academicYearId?: number) => {
  return useQuery({
    queryKey: ['semesters', academicYearId],
    queryFn: () => getSemesters(academicYearId!),
    enabled: !!academicYearId,
    staleTime: 5 * 60 * 1000,
    select: (data) => (data.success ? data.data : [])
  });
};

export const useClasses = (semesterId?: number) => {
  return useQuery({
    queryKey: ['classes', semesterId],
    queryFn: () => getClasses(semesterId!),
    enabled: !!semesterId,
    staleTime: 5 * 60 * 1000,
    select: (data) => (data.success ? data.data : [])
  });
};

export const useClassSubjects = (classId?: number) => {
  return useQuery({
    queryKey: ['classSubjects', classId],
    queryFn: () => getClassSubjects(classId!),
    enabled: !!classId,
    staleTime: 5 * 60 * 1000,
    select: (data) => (data.success ? data.data : [])
  });
};
