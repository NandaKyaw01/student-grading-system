import {
  createSearchParamsCache,
  createSerializer,
  parseAsInteger,
  parseAsString
} from 'nuqs/server';

import { getSortingStateParser } from '@/lib/parsers';
import { AcademicYear } from '@/types/prisma';

export const academicYearSearchParams = {
  page: parseAsInteger.withDefault(1),
  perPage: parseAsInteger.withDefault(10),
  search: parseAsString,
  academicYearId: parseAsString,
  sort: getSortingStateParser<AcademicYear>().withDefault([
    { id: 'year', desc: false }
  ])
};

export const academicYearSearchParamsCache = createSearchParamsCache(
  academicYearSearchParams
);
export const academicYearSerialize = createSerializer(academicYearSearchParams);

export type GetAcademicYearSchema = Awaited<
  ReturnType<typeof academicYearSearchParamsCache.parse>
>;
