import {
  createSearchParamsCache,
  createSerializer,
  parseAsBoolean,
  parseAsInteger,
  parseAsString
} from 'nuqs/server';

import { getSortingStateParser } from '@/lib/parsers';
import { AcademicYear } from '@/generated/prisma';

export const academicYearSearchParams = {
  page: parseAsInteger.withDefault(1),
  perPage: parseAsInteger.withDefault(10),
  yearRange: parseAsString,
  isCurrent: parseAsString,
  sort: getSortingStateParser<AcademicYear>()
  // .withDefault([
  //   { id: 'yearRange', desc: false }
  // ])
};

export const academicYearSearchParamsCache = createSearchParamsCache(
  academicYearSearchParams
);
export const academicYearSerialize = createSerializer(academicYearSearchParams);

export type GetAcademicYearSchema = Awaited<
  ReturnType<typeof academicYearSearchParamsCache.parse>
>;
