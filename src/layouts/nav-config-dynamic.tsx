import type { NavSectionProps } from 'src/components/nav-section';
import type { IMenu } from 'src/types/menu';
import { useState, useEffect } from 'react';
import { CONFIG } from 'src/global-config';
import { SvgColor } from 'src/components/svg-color';
import { Iconify } from 'src/components/iconify';
import MenuService from 'src/services/menu.service';

// ----------------------------------------------------------------------

const icon = (name: string) => (
  <SvgColor src={`${CONFIG.assetsDir}/assets/icons/navbar/${name}.svg`} />
);

const ICONS = {
  job: icon('ic-job'),
  blog: icon('ic-blog'),
  chat: icon('ic-chat'),
  mail: icon('ic-mail'),
  user: icon('ic-user'),
  file: icon('ic-file'),
  lock: icon('ic-lock'),
  tour: icon('ic-tour'),
  order: icon('ic-order'),
  label: icon('ic-label'),
  blank: icon('ic-blank'),
  kanban: icon('ic-kanban'),
  folder: icon('ic-folder'),
  course: icon('ic-course'),
  banking: icon('ic-banking'),
  booking: icon('ic-booking'),
  invoice: icon('ic-invoice'),
  product: icon('ic-product'),
  calendar: icon('ic-calendar'),
  disabled: icon('ic-disabled'),
  external: icon('ic-external'),
  menuItem: icon('ic-menu-item'),
  ecommerce: icon('ic-ecommerce'),
  analytics: icon('ic-analytics'),
  dashboard: icon('ic-dashboard'),
  parameter: icon('ic-parameter'),
};

// ----------------------------------------------------------------------

// Function to render icon based on icon name
const renderIcon = (iconName: string) => {
  // Handle Iconify icons (starts with solar:, etc.)
  if (iconName.includes(':')) {
    return <Iconify icon={iconName} />;
  }
  
  // Handle custom icons
  if (ICONS[iconName as keyof typeof ICONS]) {
    return ICONS[iconName as keyof typeof ICONS];
  }
  
  // Default icon
  return ICONS.menuItem;
};

// Function to fix URL paths to match Next.js App Router structure
const fixUrlPath = (url: string): string => {
  if (!url || url === '') return '#';
  
  // URL mappings for core pages
  const urlMappings: { [key: string]: string } = {
    '/internationalization/list': '/core/internationalization/list',
    '/language-variables/list': '/core/language-variables/list',
    '/roles/list': '/core/roles/list',
    '/user/list': '/core/user/list',
    '/audit-logs/list': '/core/audit-logs/list',
    '/menu/list': '/core/menu/list',
    '/global-settings/advanced': '/core/global-settings/advanced',
    '/dashboard/global-settings/overview': '/core/global-settings/overview',
  };
  
  // Check if URL needs mapping
  if (urlMappings[url]) {
    return urlMappings[url];
  }
  
  // For dashboard URLs, keep as is
  if (url.startsWith('/dashboard/')) {
    return url;
  }
  
  return url;
};

// Function to transform API menu data to NavSection format with 3-level support
const transformMenuData = (menuData: IMenu[]): NavSectionProps['data'] => {
  // Only show active menus
  const filteredMenuData = menuData.filter(menu => menu.isActive);

  // Create a map for quick lookup
  const menuMap: { [key: string]: IMenu } = {};
  filteredMenuData.forEach(menu => {
    menuMap[menu.id] = menu;
  });

  // Function to build menu tree recursively
  const buildMenuTree = (parentId: string = ''): IMenu[] => {
    return filteredMenuData
      .filter(menu => menu.parentId === parentId)
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map(menu => ({
        ...menu,
        children: buildMenuTree(menu.id)
      }));
  };

  // Function to convert menu item to nav item format
  const convertToNavItem = (menu: IMenu): any => {
    const navItem: any = {
      id: menu.id,
      slug: menu.slug,
      title: menu.name,
      path: fixUrlPath(menu.url),
      icon: renderIcon(menu.icon || 'menuItem'),
    };

    // Add children if they exist
    if (menu.children && menu.children.length > 0) {
      navItem.children = menu.children.map(convertToNavItem);
    }

    return navItem;
  };

  // Build the complete menu tree
  const menuTree = buildMenuTree();

  // Transform to NavSection format
  const navSections: NavSectionProps['data'] = [];
  
  // Find root level menus (level 1 - subheaders)
  const rootMenus = menuTree.filter(menu => !menu.parentId || menu.parentId === '');
  
  rootMenus.forEach((rootMenu) => {
    // Level 1: Root menu becomes subheader
    const section: any = {
      subheader: rootMenu.name,
      items: []
    };

    // Level 2: Direct children of root menu
    if (rootMenu.children && rootMenu.children.length > 0) {
      section.items = rootMenu.children.map((level2Menu) => {
        const navItem: any = {
          id: level2Menu.id,
          slug: level2Menu.slug,
          title: level2Menu.name,
          path: fixUrlPath(level2Menu.url),
          icon: renderIcon(level2Menu.icon || 'menuItem'),
        };

        // Level 3: Children of level 2 menu
        if (level2Menu.children && level2Menu.children.length > 0) {
          navItem.children = level2Menu.children.map((level3Menu) => ({
            id: level3Menu.id,
            slug: level3Menu.slug,
            title: level3Menu.name,
            path: fixUrlPath(level3Menu.url),
            icon: renderIcon(level3Menu.icon || 'menuItem'),
          }));
        }

        return navItem;
      });
    } else {
      // If no children, add the root menu itself as an item
      section.items = [{
        id: rootMenu.id,
        slug: rootMenu.slug,
        title: rootMenu.name,
        path: fixUrlPath(rootMenu.url),
        icon: renderIcon(rootMenu.icon || 'menuItem'),
      }];
    }

    navSections.push(section);
  });

  return navSections;
};

// Hook to get dynamic navigation data
export const useDynamicNavData = () => {
  const [navData, setNavData] = useState<NavSectionProps['data']>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNavData = async () => {
      try {
        setLoading(true);
        const response = await MenuService.getNavigationMenu();
        const transformedData = transformMenuData(response.data || []);
        setNavData(transformedData);
        setError(null);
      } catch (err) {
        console.error('Error fetching navigation menu:', err);
        setError('Failed to load navigation menu');
        // Fallback to empty array or default menu
        setNavData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchNavData();
  }, []);

  return { navData, loading, error };
};

// Default export for backward compatibility
export const navData: NavSectionProps['data'] = [];
