import {
  Tag,
  Users,
  Settings,
  Bookmark,
  SquarePen,
  LayoutGrid,
  LucideIcon
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
      groupLabel: 'Contents',
      menus: [
        {
          href: '',
          label: 'Posts',
          icon: SquarePen,
          submenus: [
            {
              href: '/admin/posts',
              label: 'All Posts'
            },
            {
              href: '/admin/posts/new',
              label: 'New Post'
            }
          ]
        },
        {
          href: '/admin/categories',
          label: 'Categories',
          icon: Bookmark
        },
        {
          href: '/admin/tags',
          label: 'Tags',
          icon: Tag
        }
      ]
    },
    {
      groupLabel: 'Settings',
      menus: [
        {
          href: '/admin/users',
          label: 'Users',
          icon: Users
        },
        {
          href: '/admin/account',
          label: 'Account',
          icon: Settings
        }
      ]
    }
  ];
}
