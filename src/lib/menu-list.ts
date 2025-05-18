import {
  User,
  Settings,
  LayoutGrid,
  LucideIcon,
  Users,
  BookOpenCheck,
  GraduationCap,
  FileCog
} from 'lucide-react';

type Submenu = {
  href: string;
  label: string;
  active?: boolean;
};

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

export function getMenuList(pathname: string): Group[] {
  return [
    {
      groupLabel: '',
      menus: [
        {
          href: `/admin/dashboard`,
          label: 'Dashboard',
          icon: LayoutGrid,
          submenus: []
        }
      ]
    },
    {
      groupLabel: '',
      menus: [
        {
          href: `/admin/grades`,
          label: 'Grades',
          icon: BookOpenCheck,
          submenus: []
        }
      ]
    },
    {
      groupLabel: '',
      menus: [
        {
          href: '/admin/students',
          label: 'Students',
          icon: Users
        }
      ]
    },
    {
      groupLabel: '',
      menus: [
        {
          href: '',
          label: 'Academic',
          icon: GraduationCap,
          submenus: [
            {
              href: '/admin/academic-years',
              label: 'Academic Years'
            },
            {
              href: '/admin/classes',
              label: 'Classes'
            },
            {
              href: '/admin/subjects',
              label: 'Subjects'
            },
            {
              href: '/admin/class-subjects',
              label: 'Class Subjects'
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
          label: 'GPA Setting',
          icon: FileCog
        },
        {
          href: '/admin/account',
          label: 'Account',
          icon: User
        },
        {
          href: '/admin/setting',
          label: 'Setting',
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
