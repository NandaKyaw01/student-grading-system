// app/(admin)/class-subjects/_components/class-subject-manager.tsx
'use client';

import {
  assignSubjectToClass,
  getAvailableSubjectsForClass,
  getClassSubjects,
  removeSubjectFromClass
} from '@/actions/class-subject';
import { DataTableSkeleton } from '@/components/data-table/data-table-skeleton';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Subject } from '@/generated/prisma';
import { ClassSubjectWithDetails } from '@/actions/class-subject';
import { BookOpen, Trash } from 'lucide-react';
import { useEffect, useState, useTransition } from 'react';
import { toast } from 'sonner';

interface ClassSubjectManagerProps {
  classId: number;
  className: string;
}

export function ClassSubjectManager({
  classId,
  className
}: ClassSubjectManagerProps) {
  const [open, setOpen] = useState(false);
  const [selectedSubjectId, setSelectedSubjectId] = useState('');

  const [classSubjects, setClassSubjects] = useState<ClassSubjectWithDetails[]>(
    []
  );
  const [availableSubjects, setAvailableSubjects] = useState<Subject[]>([]);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (open && classId) {
      startTransition(() => {
        fetchSubjects(classId);
      });
    }
  }, [open, classId]);

  const fetchSubjects = async (classId: number) => {
    const [classSubject, availableSubject] = await Promise.all([
      getClassSubjects(classId),
      getAvailableSubjectsForClass(classId)
    ]);
    setClassSubjects(classSubject);
    setAvailableSubjects(availableSubject);
  };

  const handleAssignSubject = async () => {
    if (!selectedSubjectId) return;

    const assignedSubject = availableSubjects.find(
      (s) => s.id === selectedSubjectId
    );
    if (!assignedSubject) return;

    const result = await assignSubjectToClass({
      classId,
      subjectId: selectedSubjectId
    });

    if (result.success) {
      toast.success('Subject assigned successfully');
      setSelectedSubjectId('');
      await fetchSubjects(classId);
    } else {
      toast.error('Failed to assign subject', {
        description: result.error
      });
    }
  };

  const handleRemoveSubject = async (subjectId: string) => {
    const result = await removeSubjectFromClass({
      classId,
      subjectId
    });

    if (result.success) {
      toast.success('Subject removed successfully');
      await fetchSubjects(classId);
    } else {
      toast.error('Failed to remove subject', {
        description: result.error
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant='outline' size='sm'>
          <BookOpen className='mr-2 h-4 w-4' />
          Manage Subjects
        </Button>
      </DialogTrigger>
      <DialogContent className='max-w-2xl'>
        <DialogHeader>
          <DialogTitle>Manage Subjects for {className}</DialogTitle>
        </DialogHeader>

        <div className='space-y-4'>
          <div className='flex gap-2'>
            <Select
              value={selectedSubjectId}
              onValueChange={setSelectedSubjectId}
            >
              <SelectTrigger className='w-[300px]'>
                <SelectValue placeholder='Select subject to add' />
              </SelectTrigger>
              <SelectContent>
                {availableSubjects.map((subject) => (
                  <SelectItem key={subject.id} value={subject.id}>
                    {subject.subjectName} ({subject.id})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={handleAssignSubject} disabled={!selectedSubjectId}>
              Add Subject
            </Button>
          </div>

          <div className='rounded-md border'>
            {isPending ? (
              <DataTableSkeleton
                columnCount={4}
                rowCount={3}
                shrinkZero={true}
                withPagination={false}
              />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Subject ID</TableHead>
                    <TableHead>Subject Name</TableHead>
                    <TableHead>Credit Hours</TableHead>
                    <TableHead className='text-right'>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {classSubjects.length > 0 ? (
                    classSubjects.map((cs) => (
                      <TableRow key={`${cs.classId}-${cs.subjectId}`}>
                        <TableCell>{cs.subject.id}</TableCell>
                        <TableCell>{cs.subject.subjectName}</TableCell>
                        <TableCell>{cs.subject.creditHours}</TableCell>
                        <TableCell className='text-right'>
                          <Button
                            variant='ghost'
                            size='sm'
                            onClick={() => handleRemoveSubject(cs.subjectId)}
                          >
                            <Trash className='h-4 w-4 text-destructive' />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className='text-center h-24'>
                        No subjects assigned
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
