import { Navbar } from '@/components/admin-panel/navbar';

interface ContentLayoutProps {
  title: string;
  breadcrumb?: React.ReactNode;
  children: React.ReactNode;
}

export function ContentLayout({
  title,
  breadcrumb,
  children
}: ContentLayoutProps) {
  return (
    <div>
      <Navbar title={title} breadcrumb={breadcrumb} />
      <div className='container pt-8 pb-8 px-4 sm:px-8'>{children}</div>
    </div>
  );
}
