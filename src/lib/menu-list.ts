import {
  BookOpenCheck,
  FileCog,
  GraduationCap,
  Import,
  LayoutGrid,
  LucideIcon,
  Settings,
  User,
  Users
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
          label: t('results'),
          icon: BookOpenCheck,
          submenus: [
            {
              href: `/admin/results`,
              label: t('sub_results.results_by_semester')
            },
            {
              href: `/admin/academic-year-results`,
              label: t('sub_results.results_by_year')
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
              label: t('sub_students.students')
            },
            {
              href: '/admin/enrollments',
              label: t('sub_students.enrollments')
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
          label: t('configurations'),
          icon: GraduationCap,
          submenus: [
            {
              href: '/admin/academic-years',
              label: t('sub_configurations.academic_years')
            },
            {
              href: '/admin/semesters',
              label: t('sub_configurations.semesters')
            },
            {
              href: '/admin/classes',
              label: t('sub_configurations.classes')
            },
            {
              href: '/admin/subjects',
              label: t('sub_configurations.subjects')
            },
            {
              href: '/admin/class-subjects',
              label: t('sub_configurations.class_subjects')
            }
          ]
        }
      ]
    },
    {
      groupLabel: '',
      menus: [
        {
          href: '/admin/import-results',
          label: t('import_results'),
          icon: Import
        }
      ]
    },
    {
      groupLabel: t('settings'),
      menus: [
        {
          href: '/admin/gpa-setting',
          label: t('gpa_setting'),
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
