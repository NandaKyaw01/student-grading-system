'use client';

import {
  assignSubjectToClass,
  ClassSubjectWithDetails,
  getAvailableSubjectsForClass,
  getClassSubjects,
  removeSubjectFromClass,
  revalidateClassSubjects
} from '@/actions/class-subject';
import { Combobox } from '@/components/combo-box';
import { DataTableSkeleton } from '@/components/data-table/data-table-skeleton';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Subject } from '@/generated/prisma';
import { BookOpen, Loader, Trash } from 'lucide-react';
import { useTranslations } from 'next-intl';
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useTransition
} from 'react';
import { toast } from 'sonner';

interface ClassSubjectManagerProps {
  classId: number;
  className: string;
}

interface DataState {
  classSubjects: ClassSubjectWithDetails[];
  availableSubjects: Subject[];
  isLoading: boolean;
  error: string | null;
}

export function ClassSubjectManager({
  classId,
  className
}: ClassSubjectManagerProps) {
  const [open, setOpen] = useState(false);
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [isAddPending, startAddTransition] = useTransition();
  const [isDeletePending, startDeleteTransition] = useTransition();
  const [deleteSubjectId, setDeletingSubjectId] = useState<string | null>(null);
  const t = useTranslations('ClassSubjectPage.manager');

  // Consolidated data state
  const [dataState, setDataState] = useState<DataState>({
    classSubjects: [],
    availableSubjects: [],
    isLoading: false,
    error: null
  });

  // Memoized combobox options
  const comboboxOptions = useMemo(
    () =>
      dataState.availableSubjects.map((subject) => ({
        value: subject.id.toString(),
        label: `${subject.subjectName} (${subject.id})`
      })),
    [dataState.availableSubjects]
  );

  // Optimized data fetching
  const fetchData = useCallback(async () => {
    if (!classId) return;

    setDataState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const [classSubjectsResult, availableSubjectsResult] = await Promise.all([
        getClassSubjects(classId),
        getAvailableSubjectsForClass(classId)
      ]);

      if (classSubjectsResult.success && availableSubjectsResult.success) {
        setDataState({
          classSubjects: classSubjectsResult.data,
          availableSubjects: availableSubjectsResult.data,
          isLoading: false,
          error: null
        });
      } else {
        const error =
          classSubjectsResult.error ||
          availableSubjectsResult.error ||
          t('error');
        setDataState((prev) => ({ ...prev, isLoading: false, error }));
        toast.error(t('error'), { description: error });
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : t('unexpected_error');
      setDataState((prev) => ({
        ...prev,
        isLoading: false,
        error: errorMessage
      }));
      toast.error(t('error'), { description: errorMessage });
    }
  }, [classId, t]);

  // Fetch data when dialog opens
  useEffect(() => {
    if (open && classId) {
      fetchData();
    }
  }, [open, classId, fetchData]);

  // Handle modal close with revalidation
  const handleModalClose = useCallback(async (isOpen: boolean) => {
    if (!isOpen) {
      try {
        await revalidateClassSubjects();
      } catch (error) {
        console.error('Error revalidating tags:', error);
      }
    }
    setOpen(isOpen);
  }, []);

  // Optimized assign subject handler
  const handleAssignSubject = useCallback(async () => {
    if (!selectedSubjectId) return;

    const assignedSubject = dataState.availableSubjects.find(
      (s) => s.id === selectedSubjectId
    );
    if (!assignedSubject) return;

    startAddTransition(async () => {
      try {
        const result = await assignSubjectToClass({
          classId,
          subjectId: selectedSubjectId
        });

        if (result.success) {
          toast.success(t('assign_success'));
          setSelectedSubjectId('');
          await fetchData();
        } else {
          toast.error(t('assign_error'), {
            description: result.error
          });
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : t('unexpected_error');
        toast.error(t('assign_error'), { description: errorMessage });
      }
    });
  }, [selectedSubjectId, dataState.availableSubjects, classId, fetchData, t]);

  // Optimized remove subject handler
  const handleRemoveSubject = useCallback(
    async (subjectId: string) => {
      setDeletingSubjectId(subjectId);
      startDeleteTransition(async () => {
        try {
          const result = await removeSubjectFromClass({ classId, subjectId });

          if (result.success) {
            toast.success(t('remove_success'));
            await fetchData();
          } else {
            toast.error(t('remove_error'), {
              description: result.error
            });
          }
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : t('unexpected_error');
          toast.error(t('remove_error'), {
            description: errorMessage
          });
        } finally {
          setDeletingSubjectId(null);
        }
      });
    },
    [classId, fetchData, t]
  );

  // Memoized table rows
  const tableRows = useMemo(() => {
    if (dataState.classSubjects.length === 0) {
      return (
        <TableRow>
          <TableCell colSpan={4} className='text-center h-24'>
            {t('no_subjects')}
          </TableCell>
        </TableRow>
      );
    }

    return dataState.classSubjects
      .sort((a, b) => a.subject.priority! - b.subject.priority!)
      .map((cs) => (
        <TableRow key={`${cs.classId}-${cs.subjectId}`}>
          <TableCell>{cs.subject.id}</TableCell>
          <TableCell className='break-words whitespace-normal'>
            {cs.subject.subjectName}
          </TableCell>
          <TableCell>{cs.subject.priority}</TableCell>
          <TableCell className='text-right'>
            <Button
              variant='ghost'
              size='sm'
              onClick={() => handleRemoveSubject(cs.subjectId)}
              disabled={isDeletePending}
            >
              {deleteSubjectId === cs.subject.id && isDeletePending ? (
                <Loader className='h-4 w-4 animate-spin' />
              ) : (
                <Trash className='h-4 w-4 text-destructive' />
              )}
            </Button>
          </TableCell>
        </TableRow>
      ));
  }, [
    dataState.classSubjects,
    deleteSubjectId,
    isDeletePending,
    handleRemoveSubject,
    t
  ]);

  const isPending = isAddPending || isDeletePending;
  const isDisabled = dataState.isLoading || isPending;

  return (
    <Dialog open={open} onOpenChange={handleModalClose}>
      <DialogTrigger asChild>
        <Button
          variant='outline'
          size='sm'
          className='w-full flex justify-start'
        >
          <BookOpen className='mr-2 h-4 w-4' />
          {t('title', { className })}
        </Button>
      </DialogTrigger>
      <DialogContent className='min-w-xl max-w-fit'>
        <DialogHeader>
          <DialogTitle>{t('title', { className })}</DialogTitle>
        </DialogHeader>
        <DialogDescription className='sr-only' />

        {dataState.error && (
          <div className='text-sm text-destructive p-2 bg-destructive/10 rounded'>
            {dataState.error}
          </div>
        )}

        <div className='space-y-4'>
          <div className='flex gap-2'>
            <div className='flex-1'>
              <Combobox
                options={comboboxOptions}
                value={selectedSubjectId}
                onValueChange={setSelectedSubjectId}
                placeholder={t('select_subject_placeholder')}
                searchPlaceholder={t('search_subject_placeholder')}
                disabled={isDisabled}
              />
            </div>
            <Button
              onClick={handleAssignSubject}
              disabled={!selectedSubjectId || isDisabled}
            >
              {isAddPending && <Loader className='mr-2 h-4 w-4 animate-spin' />}
              {isAddPending ? t('adding_button') : t('add_button')}
            </Button>
          </div>

          <div className='rounded-md border'>
            {dataState.isLoading ? (
              <DataTableSkeleton
                columnCount={4}
                rowCount={1}
                shrinkZero={true}
                withPagination={false}
              />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('table.subject_id')}</TableHead>
                    <TableHead>{t('table.subject_name')}</TableHead>
                    <TableHead>{t('table.priority')}</TableHead>
                    <TableHead className='text-right'>
                      {t('table.actions')}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>{tableRows}</TableBody>
              </Table>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
