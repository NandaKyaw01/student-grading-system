import {
  createSearchParamsCache,
  createSerializer,
  parseAsInteger,
  parseAsString
} from 'nuqs/server';

import { getSortingStateParser } from '@/lib/parsers';
import { AcademicYear } from '@/generated/prisma';

export const classSearchParams = {
  page: parseAsInteger.withDefault(1),
  perPage: parseAsInteger.withDefault(10),
  search: parseAsString,
  sort: getSortingStateParser<AcademicYear>().withDefault([
    { id: 'yearRange', desc: false }
  ])
};

export const classSearchParamsCache =
  createSearchParamsCache(classSearchParams);
export const classSerialize = createSerializer(classSearchParams);

export type GetClassSchema = Awaited<
  ReturnType<typeof classSearchParamsCache.parse>
>;
