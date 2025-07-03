import {
  createSearchParamsCache,
  createSerializer,
  parseAsArrayOf,
  parseAsInteger,
  parseAsString
} from 'nuqs/server';

import { getSortingStateParser } from '@/lib/parsers';
import { GradeScale } from '@/generated/prisma';

export const gradeScaleSearchParams = {
  page: parseAsInteger.withDefault(1),
  perPage: parseAsInteger.withDefault(10),
  minMark: parseAsString.withDefault(''),
  sort: getSortingStateParser<GradeScale>().withDefault([
    { id: 'minMark', desc: false }
  ])
};

export const gradeScaleSearchParamsCache = createSearchParamsCache(
  gradeScaleSearchParams
);
export const gradeScaleSerialize = createSerializer(gradeScaleSearchParams);

export type GetGradeScaleSchema = Awaited<
  ReturnType<typeof gradeScaleSearchParamsCache.parse>
>;
