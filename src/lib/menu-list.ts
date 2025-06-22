import {
  User,
  Settings,
  LayoutGrid,
  LucideIcon,
  Users,
  BookOpenCheck,
  GraduationCap,
  FileCog,
  Library
} from 'lucide-react';
import { useTranslations } from 'next-intl';

type Submenu = {
  href: string;
  label: string;
  active?: boolean;
};
type SideBarKeys = ReturnType<typeof useTranslations<'SideBar'>>;

type Menu = {
  href: string;
  label: string;
  active?: boolean;
  icon: LucideIcon;
  submenus?: Submenu[];
};

type Group = {
  groupLabel: string;
  menus: Menu[];
};

export function getMenuList(pathname: string, t: SideBarKeys): Group[] {
  return [
    {
      groupLabel: '',
      menus: [
        {
          href: `/admin/dashboard`,
          label: t('dashboard'),
          icon: LayoutGrid,
          submenus: []
        }
      ]
    },
    {
      groupLabel: '',
      menus: [
        {
          href: '',
          label: 'Results',
          icon: BookOpenCheck,
          submenus: [
            {
              href: `/admin/results`,
              label: 'By Semester'
            },
            {
              href: `/admin/academic-year-results`,
              label: 'By Year'
            }
          ]
        }
      ]
    },
    {
      groupLabel: '',
      menus: [
        {
          href: '',
          label: t('students'),
          icon: Users,
          submenus: [
            {
              href: '/admin/students',
              label: t('students')
            },
            {
              href: '/admin/enrollments',
              label: 'Enrollments'
            }
          ]
        }
      ]
    },
    {
      groupLabel: '',
      menus: [
        {
          href: '',
          label: 'Configurations',
          icon: GraduationCap,
          submenus: [
            {
              href: '/admin/academic-years',
              label: t('SubAcademic.academic_year')
            },
            {
              href: '/admin/semesters',
              label: 'Semesters'
            },
            {
              href: '/admin/classes',
              label: t('SubAcademic.classes')
            },
            {
              href: '/admin/subjects',
              label: t('SubAcademic.subjects')
            },
            {
              href: '/admin/class-subjects',
              label: t('SubAcademic.class_subjects')
            }
          ]
        }
      ]
    },
    {
      groupLabel: 'Settings',
      menus: [
        {
          href: '/admin/gpa-setting',
          label: t('GPAsetting'),
          icon: FileCog
        },
        {
          href: '/admin/account',
          label: t('account'),
          icon: User
        },
        {
          href: '/admin/setting',
          label: t('setting'),
          icon: Settings
        }
      ]
    }
  ];
}

// return [
//   {
//     groupLabel: '',
//     menus: [
//       {
//         href: `/admin/dashboard`,
//         label: 'Dashboard',
//         icon: LayoutGrid,
//         submenus: []
//       }
//     ]
//   },
//   {
//     groupLabel: 'Contents',
//     menus: [
//       {
//         href: '',
//         label: 'Posts',
//         icon: SquarePen,
//         submenus: [
//           {
//             href: '/admin/posts',
//             label: 'All Posts'
//           },
//           {
//             href: '/admin/posts/new',
//             label: 'New Post'
//           }
//         ]
//       },
//       {
//         href: '/admin/categories',
//         label: 'Categories',
//         icon: Bookmark
//       },
//       {
//         href: '/admin/tags',
//         label: 'Tags',
//         icon: Tag
//       }
//     ]
//   },
//   {
//     groupLabel: 'Settings',
//     menus: [
//       {
//         href: '/admin/users',
//         label: 'Users',
//         icon: Users
//       },
//       {
//         href: '/admin/setting',
//         label: 'Setting',
//         icon: Settings
//       }
//     ]
//   }
// ];
