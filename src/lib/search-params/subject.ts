import {
  createSearchParamsCache,
  createSerializer,
  parseAsInteger,
  parseAsString
} from 'nuqs/server';

import { Subject } from '@/generated/prisma';
import { getSortingStateParser } from '@/lib/parsers';

export const subjectSearchParams = {
  page: parseAsInteger.withDefault(1),
  perPage: parseAsInteger.withDefault(10),
  search: parseAsString,
  sort: getSortingStateParser<Subject>()
};

export const subjectSearchParamsCache =
  createSearchParamsCache(subjectSearchParams);
export const subjectSerialize = createSerializer(subjectSearchParams);

export type GetSubjectSchema = Awaited<
  ReturnType<typeof subjectSearchParamsCache.parse>
>;
