import { useBoolean } from 'minimal-shared/hooks';
import { useRef, useEffect, useCallback } from 'react';
import { isActiveLink, isExternalLink } from 'minimal-shared/utils';

import { usePathname } from 'src/routes/hooks';

import { NavItem } from './nav-item';
import { navSectionClasses } from '../styles';
import { NavUl, NavLi, NavCollapse } from '../components';

import type { NavListProps, NavSubListProps } from '../types';

// ----------------------------------------------------------------------

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

export function NavList({
  data,
  depth,
  render,
  slotProps,
  currentRole,
  enabledRootRedirect,
}: NavListProps) {
  const pathname = usePathname();
  const navItemRef = useRef<HTMLButtonElement | null>(null);

  // Use custom active link detection for better path matching
  const isActive = isMenuItemActive(pathname, data.path, !!data.children);

  const { value: open, onFalse: onClose, onToggle } = useBoolean(isActive);

  useEffect(() => {
    // Don't close parent menus if a child item is active
    // This ensures Level 4 items don't close their parent Level 3 menus
    const hasActiveChild = data.children?.some(child => 
      isMenuItemActive(pathname, child.path, !!child.children)
    );
    
    // Also check for deeply nested active children (Level 4)
    const hasDeepActiveChild = data.children?.some(child => 
      child.children?.some(grandChild => 
        isMenuItemActive(pathname, grandChild.path, !!grandChild.children)
      )
    );
    
    if (!isActive && !hasActiveChild && !hasDeepActiveChild) {
      onClose();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  const handleToggleMenu = useCallback(() => {
    if (data.children) {
      onToggle();
    }
    // For Level 4 items (leaf nodes without children), don't close parent menus
    // The navigation will be handled by the link itself
  }, [data.children, onToggle]);

  const renderNavItem = () => (
    <NavItem
      ref={navItemRef}
      // slots
      path={data.path}
      icon={data.icon}
      info={data.info}
      title={data.title}
      caption={data.caption}
      // state
      open={open}
      active={isActive}
      disabled={data.disabled}
      // options
      depth={depth}
      render={render}
      hasChild={!!data.children}
      externalLink={isExternalLink(data.path)}
      enabledRootRedirect={enabledRootRedirect}
      // styles
      slotProps={depth === 1 ? slotProps?.rootItem : slotProps?.subItem}
      // actions
      onClick={handleToggleMenu}
    />
  );

  const renderCollapse = () =>
    !!data.children && (
      <NavCollapse mountOnEnter unmountOnExit depth={depth} in={open} data-group={data.title}>
        <NavSubList
          data={data.children}
          render={render}
          depth={depth}
          slotProps={slotProps}
          currentRole={currentRole}
          enabledRootRedirect={enabledRootRedirect}
        />
      </NavCollapse>
    );

  // Hidden item by role
  if (data.roles && currentRole && !data.roles.includes(currentRole)) {
    return null;
  }

  return (
    <NavLi
      disabled={data.disabled}
      sx={{
        ...(!!data.children && {
          [`& .${navSectionClasses.li}`]: { '&:first-of-type': { mt: 'var(--nav-item-gap)' } },
        }),
      }}
    >
      {renderNavItem()}
      {renderCollapse()}
    </NavLi>
  );
}

// ----------------------------------------------------------------------

function NavSubList({
  data,
  render,
  depth = 0,
  slotProps,
  currentRole,
  enabledRootRedirect,
}: NavSubListProps) {
  return (
    <NavUl sx={{ gap: 'var(--nav-item-gap)' }}>
      {data.map((list, index) => (
        <NavList
          key={list.slug || list.id || `${list.title}-${depth}-${index}`}
          data={list}
          render={render}
          depth={depth + 1}
          slotProps={slotProps}
          currentRole={currentRole}
          enabledRootRedirect={enabledRootRedirect}
        />
      ))}
    </NavUl>
  );
}
