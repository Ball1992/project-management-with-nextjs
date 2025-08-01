import type { NavItemDataProps, ApiMenuItemProps } from 'src/components/nav-section/types';
import type { IMenu } from 'src/types/menu';

/**
 * Transform API menu item to NavItemDataProps format
 */
export function transformApiMenuToNavItem(apiMenu: ApiMenuItemProps | IMenu): NavItemDataProps {
  return {
    // API fields
    id: apiMenu.id,
    name: apiMenu.name,
    slug: apiMenu.slug,
    url: apiMenu.url,
    parentId: apiMenu.parentId,
    sortOrder: apiMenu.sortOrder,
    isActive: apiMenu.isActive,
    createdBy: apiMenu.createdBy,
    createdByName: apiMenu.createdByName,
    createdDate: apiMenu.createdDate,
    updatedBy: apiMenu.updatedBy,
    updatedByName: apiMenu.updatedByName,
    updatedDate: apiMenu.updatedDate,
    // Legacy fields (mapped from API fields)
    path: apiMenu.url,
    title: apiMenu.name,
    icon: apiMenu.icon,
  };
}

/**
 * Transform NavItemDataProps to API menu format
 */
export function transformNavItemToApiMenu(navItem: NavItemDataProps): Partial<IMenu> {
  return {
    id: navItem.id || '',
    name: navItem.name || navItem.title,
    slug: navItem.slug || '',
    icon: typeof navItem.icon === 'string' ? navItem.icon : '',
    url: navItem.url || navItem.path,
    parentId: navItem.parentId || '',
    sortOrder: navItem.sortOrder || 0,
    isActive: navItem.isActive ?? true,
    createdBy: navItem.createdBy || '',
    createdByName: navItem.createdByName || '',
    createdDate: navItem.createdDate || '',
    updatedBy: navItem.updatedBy || '',
    updatedByName: navItem.updatedByName || '',
    updatedDate: navItem.updatedDate || '',
  };
}

/**
 * Transform array of API menu items to NavItemDataProps array
 */
export function transformApiMenuArrayToNavItems(apiMenus: (ApiMenuItemProps | IMenu)[]): NavItemDataProps[] {
  return apiMenus.map(transformApiMenuToNavItem);
}

/**
 * Transform array of NavItemDataProps to API menu array
 */
export function transformNavItemArrayToApiMenus(navItems: NavItemDataProps[]): Partial<IMenu>[] {
  return navItems.map(transformNavItemToApiMenu);
}

/**
 * Build hierarchical menu structure from flat array
 */
export function buildMenuHierarchy(flatMenus: IMenu[]): IMenu[] {
  const menuMap = new Map<string, IMenu>();
  const rootMenus: IMenu[] = [];

  // First pass: create map of all menus
  flatMenus.forEach(menu => {
    menuMap.set(menu.id, { ...menu, children: [] });
  });

  // Second pass: build hierarchy
  flatMenus.forEach(menu => {
    const menuWithChildren = menuMap.get(menu.id)!;
    
    if (!menu.parentId || menu.parentId === '') {
      // Root menu
      rootMenus.push(menuWithChildren);
    } else {
      // Child menu
      const parent = menuMap.get(menu.parentId);
      if (parent) {
        if (!parent.children) {
          parent.children = [];
        }
        parent.children.push(menuWithChildren);
      }
    }
  });

  // Sort menus by sortOrder
  const sortMenus = (menus: IMenu[]): IMenu[] => {
    return menus
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map(menu => ({
        ...menu,
        children: menu.children ? sortMenus(menu.children) : undefined
      }));
  };

  return sortMenus(rootMenus);
}

/**
 * Flatten hierarchical menu structure to flat array
 */
export function flattenMenuHierarchy(hierarchicalMenus: IMenu[]): IMenu[] {
  const flatMenus: IMenu[] = [];

  const flatten = (menus: IMenu[]) => {
    menus.forEach(menu => {
      const { children, ...menuWithoutChildren } = menu;
      flatMenus.push(menuWithoutChildren as IMenu);
      
      if (children && children.length > 0) {
        flatten(children);
      }
    });
  };

  flatten(hierarchicalMenus);
  return flatMenus;
}
