import {
  createSearchParamsCache,
  createSerializer,
  parseAsArrayOf,
  parseAsInteger,
  parseAsString
} from 'nuqs/server';

import { getSortingStateParser } from '@/lib/parsers';
import { Result } from '@/generated/prisma';

export const resultSearchParams = {
  page: parseAsInteger.withDefault(1),
  perPage: parseAsInteger.withDefault(10),
  enrollmentId: parseAsString.withDefault(''),
  createdAt: parseAsString.withDefault(''),
  sort: getSortingStateParser<Result>()
};

export const resultSearchParamsCache =
  createSearchParamsCache(resultSearchParams);
export const resultSerialize = createSerializer(resultSearchParams);

export type GetResultSchema = Awaited<
  ReturnType<typeof resultSearchParamsCache.parse>
>;
