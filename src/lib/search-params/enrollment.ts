import {
  createSearchParamsCache,
  createSerializer,
  parseAsBoolean,
  parseAsInteger,
  parseAsString
} from 'nuqs/server';

import { getSortingStateParser } from '@/lib/parsers';
import { Enrollment } from '@/generated/prisma';

export const enrollmentSearchParams = {
  page: parseAsInteger.withDefault(1),
  perPage: parseAsInteger.withDefault(10),
  search: parseAsString.withDefault(''),
  //   status: parseAsBoolean.withDefault(false),
  semesterId: parseAsInteger,
  classId: parseAsInteger,
  createdAt: parseAsString.withDefault(''),
  sort: getSortingStateParser<Enrollment>().withDefault([
    { id: 'createdAt', desc: true }
  ])
};

export const enrollmentSearchParamsCache = createSearchParamsCache(
  enrollmentSearchParams
);
export const enrollmentSerialize = createSerializer(enrollmentSearchParams);

export type GetEnrollmentSchema = Awaited<
  ReturnType<typeof enrollmentSearchParamsCache.parse>
>;
