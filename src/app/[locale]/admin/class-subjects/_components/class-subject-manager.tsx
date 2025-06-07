// app/(admin)/class-subjects/_components/class-subject-manager.tsx
'use client';

import {
  assignSubjectToClass,
  removeSubjectFromClass,
  revalidateClassSubjects
} from '@/actions/class-subject';
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
import {
  ClassSubjectWithDetails,
  getAvailableSubjectsForClass,
  getClassSubjects
} from '@/services/class-subject';
import { SubjectWithDetails } from '@/services/subject';
import { BookOpen, Trash } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { use, useEffect, useState } from 'react';
import { toast } from 'sonner';

interface ClassSubjectManagerProps {
  classId: number;
  className: string;
  initialClassSubjects: Promise<Awaited<ReturnType<typeof getClassSubjects>>>;
  initialAvailableSubjects: Promise<
    Awaited<ReturnType<typeof getAvailableSubjectsForClass>>
  >;
}

export function ClassSubjectManager({
  classId,
  className,
  initialClassSubjects,
  initialAvailableSubjects
}: ClassSubjectManagerProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [selectedSubjectId, setSelectedSubjectId] = useState('');

  useEffect(() => {
    revalidateClassSubjects(classId);
  }, [classId]);

  const classSubjects = use(initialClassSubjects) as ClassSubjectWithDetails[];
  const availableSubjects = use(
    initialAvailableSubjects
  ) as SubjectWithDetails[];

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
      router.refresh();
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
      router.refresh();
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
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
