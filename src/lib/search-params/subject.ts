import {
  createSearchParamsCache,
  createSerializer,
  parseAsInteger,
  parseAsString
} from 'nuqs/server';

import { getSortingStateParser } from '@/lib/parsers';
import { AcademicYear } from '@/generated/prisma';
import { Subject } from '@/generated/prisma';

export const subjectSearchParams = {
  page: parseAsInteger.withDefault(1),
  perPage: parseAsInteger.withDefault(10),
  search: parseAsString,
  sort: getSortingStateParser<Subject>().withDefault([
    { id: 'createdAt', desc: true }
  ])
};

export const subjectSearchParamsCache =
  createSearchParamsCache(subjectSearchParams);
export const subjectSerialize = createSerializer(subjectSearchParams);

export type GetSubjectSchema = Awaited<
  ReturnType<typeof subjectSearchParamsCache.parse>
>;
