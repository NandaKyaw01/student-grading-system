'use client';

import {
  getClassesBySemester,
  getSemestersByAcademicYear,
  SearchFilters
} from '@/actions/public-result-view';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Class, Semester } from '@/generated/prisma';
import { Search } from 'lucide-react';
import { SearchParams } from 'nuqs';
import { useState, useEffect, useTransition } from 'react';

export default function SearchForm({
  filterOptions,
  params
}: {
  filterOptions: SearchFilters;
  params: { [key: string]: string | undefined };
}) {
  const [selectedAcademicYear, setSelectedAcademicYear] = useState(
    params.academicYear || ''
  );
  const [selectedSemester, setSelectedSemester] = useState(
    params.semester || ''
  );
  const [filteredSemesters, setFilteredSemesters] = useState<Semester[]>([]);
  const [filteredClasses, setFilteredClasses] = useState<Class[]>([]);
  const [isyearPending, startYearTransition] = useTransition();
  const [issemesterPending, startSemesterTransition] = useTransition();

  // Filter semesters when academic year changes
  useEffect(() => {
    if (selectedAcademicYear && selectedAcademicYear !== 'all') {
      startYearTransition(async () => {
        try {
          const result = await getSemestersByAcademicYear(
            parseInt(selectedAcademicYear)
          );
          setFilteredSemesters(result);
        } catch (err) {
          console.log(err);

          setFilteredSemesters([]);
        }
      });
    } else {
      setFilteredSemesters([]);
    }
  }, [selectedAcademicYear]);

  // Filter classes when semester changes
  useEffect(() => {
    if (selectedSemester && selectedSemester !== 'all') {
      startSemesterTransition(async () => {
        try {
          const result = await getClassesBySemester(parseInt(selectedSemester));
          setFilteredClasses(result);
        } catch (err) {
          console.log(err);

          setFilteredClasses([]);
        }
      });
    } else {
      setFilteredClasses([]);
    }
  }, [selectedSemester]);

  return (
    <form action='' method='GET' className='space-y-4'>
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
        {/* Academic Year - Required */}
        <div className='space-y-2'>
          <label htmlFor='academicYear' className='text-sm font-medium'>
            Academic Year <span className='text-red-500'>*</span>
          </label>
          <Select
            name='academicYear'
            value={selectedAcademicYear}
            onValueChange={setSelectedAcademicYear}
            required
          >
            <SelectTrigger className='w-full'>
              <SelectValue placeholder='Select academic year' />
            </SelectTrigger>
            <SelectContent>
              {filterOptions.academicYears.map((year) => (
                <SelectItem key={year.id} value={year.id.toString()}>
                  {year.yearRange}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Semester - Required and filtered */}
        <div className='space-y-2'>
          <label htmlFor='semester' className='text-sm font-medium'>
            Semester <span className='text-red-500'>*</span>
          </label>
          <Select
            name='semester'
            value={selectedSemester}
            onValueChange={setSelectedSemester}
            disabled={!selectedAcademicYear}
            required
          >
            <SelectTrigger className='w-full'>
              <SelectValue placeholder='Select semester' />
            </SelectTrigger>
            <SelectContent>
              {filteredSemesters.map((semester: Semester) => (
                <SelectItem key={semester.id} value={semester.id.toString()}>
                  {semester.semesterName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Class - Required and filtered */}
        <div className='space-y-2'>
          <label htmlFor='class' className='text-sm font-medium'>
            Class <span className='text-red-500'>*</span>
          </label>
          <Select
            name='class'
            defaultValue={params.class || ''}
            disabled={!selectedSemester}
            required
          >
            <SelectTrigger className='w-full'>
              <SelectValue placeholder='Select class' />
            </SelectTrigger>
            <SelectContent>
              {filteredClasses.map((cls: Class) => (
                <SelectItem key={cls.id} value={cls.id.toString()}>
                  {cls.className} ({cls.departmentCode})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Student Name - Required */}
        <div className='space-y-2'>
          <label htmlFor='studentName' className='text-sm font-medium'>
            Student Name <span className='text-red-500'>*</span>
          </label>
          <Input
            id='studentName'
            name='studentName'
            placeholder='Enter student name'
            defaultValue={params.studentName || ''}
            required
          />
        </div>

        {/* Admission ID - Required */}
        <div className='space-y-2'>
          <label htmlFor='admissionId' className='text-sm font-medium'>
            Admission ID <span className='text-red-500'>*</span>
          </label>
          <Input
            id='admissionId'
            name='admissionId'
            placeholder='Enter admission ID'
            defaultValue={params.admissionId || ''}
            required
          />
        </div>

        {/* Roll Number - Required */}
        <div className='space-y-2'>
          <label htmlFor='rollNumber' className='text-sm font-medium'>
            Roll Number <span className='text-red-500'>*</span>
          </label>
          <Input
            id='rollNumber'
            name='rollNumber'
            placeholder='Enter roll number'
            defaultValue={params.rollNumber || ''}
            required
          />
        </div>
      </div>

      <div className='flex gap-2 pt-4'>
        <Button type='submit' className='flex items-center gap-2'>
          <Search className='h-4 w-4' />
          Search Result
        </Button>
        <Button asChild variant='outline'>
          <a href='?'>Clear Filters</a>
        </Button>
      </div>
    </form>
  );
}
