'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { useEffect, useState } from 'react';
import {
  getClassesForSelect,
  getSemestersForSelect,
  getStudentsForSelect
} from '@/actions/enrollment';
import { createEnrollment, updateEnrollment } from '@/actions/enrollment';
import { Enrollment } from '@/generated/prisma';
import { toast } from 'sonner';

const formSchema = z.object({
  studentId: z.number().min(1, 'Student is required'),
  classId: z.number().min(1, 'Class is required'),
  semesterId: z.number().min(1, 'Semester is required'),
  rollNumber: z.string().min(1, 'Roll number is required'),
  isActive: z.boolean()
});

interface EnrollmentFormProps {
  enrollment?: Enrollment;
  onSuccess?: () => void;
}

export function EnrollmentForm({ enrollment, onSuccess }: EnrollmentFormProps) {
  const [classes, setClasses] = useState<
    { id: number; className: string; semesterId: number }[]
  >([]);
  const [students, setStudents] = useState<
    { id: number; studentName: string }[]
  >([]);
  const [loading, setLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      studentId: enrollment?.studentId || undefined,
      classId: enrollment?.classId || undefined,
      semesterId: enrollment?.semesterId || undefined,
      rollNumber: enrollment?.rollNumber || '',
      isActive: enrollment?.isActive ?? true
    }
  });

  const [semesters, setSemesters] = useState<
    { id: number; semesterName: string; academicYear: { yearRange: string } }[]
  >([]);
  const [filteredClasses, setFilteredClasses] = useState<
    { id: number; className: string }[]
  >([]);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [classData, studentData, semesterData] = await Promise.all([
          getClassesForSelect(),
          getStudentsForSelect(),
          getSemestersForSelect()
        ]);
        setClasses(classData);
        setStudents(studentData);
        setSemesters(semesterData);

        // Initial filter if editing
        if (enrollment?.semesterId) {
          setFilteredClasses(
            classData.filter((c) => c.semesterId === enrollment.semesterId)
          );
        } else {
          setFilteredClasses(classData);
        }
      } catch (error) {
        console.error('Failed to load data:', error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [enrollment?.semesterId]);

  const selectedSemesterId = form.watch('semesterId');

  useEffect(() => {
    if (selectedSemesterId) {
      setFilteredClasses(
        classes.filter((c) => c.semesterId === selectedSemesterId)
      );

      // form.setValue('classId', undefined as any);
    } else {
      setFilteredClasses(classes);
    }
  }, [selectedSemesterId, classes, form]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setLoading(true);

      let result;
      if (enrollment) {
        result = await updateEnrollment(enrollment.id, values);
      } else {
        result = await createEnrollment(values);
      }

      if (!result.success) {
        throw new Error(result.error);
      }

      toast.success('Success', {
        description: enrollment
          ? 'Enrollment updated successfully'
          : 'Enrollment created successfully'
      });

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      toast.error('Error', {
        description:
          error instanceof Error ? error.message : 'Something went wrong'
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
        <FormField
          control={form.control}
          name='studentId'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Student</FormLabel>
              <Select
                onValueChange={(value) => field.onChange(Number(value))}
                value={field.value?.toString()}
                disabled={loading}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder='Select a student' />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {students.map((student) => (
                    <SelectItem key={student.id} value={student.id.toString()}>
                      {student.studentName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='semesterId'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Semester</FormLabel>
              <Select
                onValueChange={(value) => field.onChange(Number(value))}
                value={field.value?.toString()}
                disabled={loading}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder='Select a semester' />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {semesters.map((semester) => (
                    <SelectItem
                      key={semester.id}
                      value={semester.id.toString()}
                    >
                      {`${semester.semesterName} (${semester.academicYear.yearRange})`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='classId'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Class</FormLabel>
              <Select
                onValueChange={(value) => field.onChange(Number(value))}
                value={field.value?.toString()}
                disabled={loading || !form.getValues('semesterId')}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue
                      placeholder={
                        form.getValues('semesterId')
                          ? 'Select a class'
                          : 'Select a semester first'
                      }
                    />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {filteredClasses.map((cls) => (
                    <SelectItem key={cls.id} value={cls.id.toString()}>
                      {cls.className}
                    </SelectItem>
                  ))}
                  {filteredClasses.length === 0 && (
                    <div className='text-sm text-muted-foreground p-2'>
                      No classes found for selected semester
                    </div>
                  )}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='rollNumber'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Roll Number</FormLabel>
              <FormControl>
                <Input
                  placeholder='Enter roll number'
                  {...field}
                  disabled={loading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='isActive'
          render={({ field }) => (
            <FormItem className='flex flex-row items-center justify-between rounded-lg border p-4'>
              <div className='space-y-0.5'>
                <FormLabel>Active Status</FormLabel>
                <FormDescription>
                  Whether this enrollment is currently active
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  disabled={loading}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <div className='flex justify-end gap-4'>
          <Button type='submit' disabled={loading} className='w-full sm:w-auto'>
            {loading ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
