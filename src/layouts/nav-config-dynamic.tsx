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
  buildingTwo: icon('ic-building-two'),
};

// ----------------------------------------------------------------------

// Function to render icon based on icon name
const renderIcon = (iconName: string) => {
  // Return null if iconName is empty or null
  if (!iconName || iconName.trim() === '') {
    return null;
  }
  
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
  
  // Ensure menu URLs start with /menu if they don't already
  if (!url.startsWith('/menu/') && !url.startsWith('/core/') && !url.startsWith('/dashboard/') && url !== '#') {
    return `/menu${url.startsWith('/') ? url : `/${url}`}`;
  }
  
  return url;
};

// Custom function to check if a menu item should be active
const isMenuItemActive = (pathname: string, menuPath: string, hasChildren: boolean): boolean => {
  if (!menuPath || menuPath === '#') return false;
  
  // Exact match
  if (pathname === menuPath) return true;
  
  // For items with children, check if current path starts with menu path
  if (hasChildren && pathname.startsWith(menuPath)) {
    // Make sure it's a proper path segment match, not just a prefix
    const remainingPath = pathname.slice(menuPath.length);
    return remainingPath === '' || remainingPath.startsWith('/');
  }
  
  // For items without children, check if current path is a child of menu path
  if (!hasChildren && pathname.startsWith(menuPath + '/')) {
    return true;
  }
  
  return false;
};

// Function to transform API menu data to NavSection format with 4-level support
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

  // Function to convert menu item to nav item format (recursive for all levels)
  const convertToNavItem = (menu: IMenu): any => {
    const navItem: any = {
      id: menu.id,
      slug: menu.slug,
      title: menu.name,
      path: fixUrlPath(menu.url),
    };

    // Only add icon if it exists and is not empty
    const iconResult = renderIcon(menu.icon || '');
    if (iconResult) {
      navItem.icon = iconResult;
    }

    // Add info badge if info > 0
    if (menu.info && menu.info > 0) {
      navItem.info = menu.info > 99 ? '99+' : menu.info.toString() + '+';
    }

    // Add children if they exist (recursive for all levels)
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
        };

        // Only add icon if it exists and is not empty
        const level2IconResult = renderIcon(level2Menu.icon || '');
        if (level2IconResult) {
          navItem.icon = level2IconResult;
        }

        // Add info badge for level 2 menu if info > 0
        if (level2Menu.info && level2Menu.info > 0) {
          navItem.info = level2Menu.info > 99 ? '99+' : level2Menu.info.toString() + '+';
        }

        // Level 3: Children of level 2 menu
        if (level2Menu.children && level2Menu.children.length > 0) {
          navItem.children = level2Menu.children.map((level3Menu) => {
            const level3NavItem: any = {
              id: level3Menu.id,
              slug: level3Menu.slug,
              title: level3Menu.name,
              path: fixUrlPath(level3Menu.url),
            };

            // Only add icon if it exists and is not empty
            const level3IconResult = renderIcon(level3Menu.icon || '');
            if (level3IconResult) {
              level3NavItem.icon = level3IconResult;
            }

            // Add info badge for level 3 menu if info > 0
            if (level3Menu.info && level3Menu.info > 0) {
              level3NavItem.info = level3Menu.info > 99 ? '99+' : level3Menu.info.toString() + '+';
            }

            // Level 4: Children of level 3 menu
            if (level3Menu.children && level3Menu.children.length > 0) {
              level3NavItem.children = level3Menu.children.map((level4Menu) => {
                const level4NavItem: any = {
                  id: level4Menu.id,
                  slug: level4Menu.slug,
                  title: level4Menu.name,
                  path: fixUrlPath(level4Menu.url),
                };

                // Only add icon if it exists and is not empty
                const level4IconResult = renderIcon(level4Menu.icon || '');
                if (level4IconResult) {
                  level4NavItem.icon = level4IconResult;
                }

                // Add info badge for level 4 menu if info > 0
                if (level4Menu.info && level4Menu.info > 0) {
                  level4NavItem.info = level4Menu.info > 99 ? '99+' : level4Menu.info.toString() + '+';
                }

                return level4NavItem;
              });
            }

            return level3NavItem;
          });
        }

        return navItem;
      });

      // Only add section to navSections if it has Level 2 items
      navSections.push(section);
    }
    // If no Level 2 children, don't add the section at all
  });

  return navSections;
};

// Hook to get dynamic navigation data
export const useDynamicNavData = () => {
  const [navData, setNavData] = useState<NavSectionProps['data']>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasData, setHasData] = useState(false);

  useEffect(() => {
    const fetchNavData = async () => {
      try {
        setLoading(true);
        const response = await MenuService.getNavigationMenu();
        const transformedData = transformMenuData(response.data || []);
        setNavData(transformedData);
        setHasData(true); // Mark that we have processed data, even if filtered result is empty
        setError(null);
      } catch (err) {
        console.error('Error fetching navigation menu:', err);
        setError('Failed to load navigation menu');
        // Fallback to empty array or default menu
        setNavData([]);
        setHasData(false);
      } finally {
        setLoading(false);
      }
    };

    fetchNavData();
  }, []);

  return { navData, loading, error, hasData };
};

// Default export for backward compatibility
export const navData: NavSectionProps['data'] = [];
