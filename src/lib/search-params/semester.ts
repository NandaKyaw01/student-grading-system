import {
  createSearchParamsCache,
  createSerializer,
  parseAsInteger,
  parseAsString
} from 'nuqs/server';
import { getSortingStateParser } from '@/lib/parsers';
import { Semester } from '@/generated/prisma';

export const classSearchParams = {
  page: parseAsInteger.withDefault(1),
  perPage: parseAsInteger.withDefault(10),
  search: parseAsString,
  sort: getSortingStateParser<Semester>().withDefault([
    { id: 'isCurrent', desc: false }
  ])
};

export const semesterSearchParamsCache =
  createSearchParamsCache(classSearchParams);
export const classSerialize = createSerializer(classSearchParams);

export type GetSemesterSchema = Awaited<
  ReturnType<typeof semesterSearchParamsCache.parse>
>;
