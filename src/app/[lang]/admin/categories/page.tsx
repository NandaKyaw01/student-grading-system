import Link from 'next/link';

import PlaceholderContent from '@/components/demo/placeholder-content';
import { ContentLayout } from '@/components/admin-panel/content-layout';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from '@/components/ui/breadcrumb';
import { betaTestData } from '@/constants/beta-test';
interface User {
  id: number;
  firstName: string;
  lastName: string;
  lastLogin: string;
}

interface Entry {
  issuesType: string;
  userId: User;
}

interface Summary {
  name: string;
  issue: number;
  suggestion: number;
  noIssue: number;
  lastLogin: string;
}

export default function CategoriesPage() {
  const summaryData: Summary[] = (() => {
    const map = new Map<string, Summary>();

    betaTestData.forEach(({ issuesType, userId }) => {
      const name = `${userId.firstName} ${userId.lastName}`;
      const key = userId.id.toString();

      if (!map.has(key)) {
        map.set(key, {
          name,
          issue: 0,
          suggestion: 0,
          noIssue: 0,
          lastLogin: userId.lastLogin
        });
      }

      const summary = map.get(key)!;

      const type = issuesType.toLowerCase();
      if (type === 'issue') summary.issue += 1;
      else if (type === 'suggestion' || type === 'suggest')
        summary.suggestion += 1;
      else if (type === 'no issue') summary.noIssue += 1;

      // Always keep the most recent lastLogin
      if (new Date(userId.lastLogin) > new Date(summary.lastLogin)) {
        summary.lastLogin = userId.lastLogin;
      }
    });

    return Array.from(map.values());
  })();

  return (
    <ContentLayout title='Categories'>
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href='/'>Home</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href='/dashboard'>Dashboard</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Categories</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      {/* <PlaceholderContent /> */}

      <table className='min-w-full border border-gray-300 mt-8'>
        <thead className='bg-gray-100'>
          <tr>
            <th className='border px-4 py-2'>No.</th>
            <th className='border px-4 py-2 text-left'>Name</th>
            <th className='border px-4 py-2'>Issue</th>
            <th className='border px-4 py-2'>Suggestion</th>
            <th className='border px-4 py-2'>No Issue</th>
            <th className='border px-4 py-2'>Last Login</th>
          </tr>
        </thead>
        <tbody>
          {summaryData.map((user, index) => (
            <tr key={index} className='hover:bg-gray-50'>
              <td className='border px-4 py-2 text-center'>{index + 1}</td>
              <td className='border px-4 py-2'>{user.name}</td>
              <td className='border px-4 py-2 text-center'>{user.issue}</td>
              <td className='border px-4 py-2 text-center'>
                {user.suggestion}
              </td>
              <td className='border px-4 py-2 text-center'>{user.noIssue}</td>
              <td className='border px-4 py-2 text-center'>
                {new Date(user.lastLogin).toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </ContentLayout>
  );
}
