import { CONFIG } from 'src/global-config';

import type { WorkspacesPopoverProps } from './components/workspaces-popover';

// ----------------------------------------------------------------------

export const _workspaces: WorkspacesPopoverProps['data'] = [
  {
    id: 'en',
    name: 'English',
    // logo: `${CONFIG.assetsDir}/assets/icons/workspaces/logo-1.webp`,
    logo: `https://purecatamphetamine.github.io/country-flag-icons/3x2/GB.svg`,
    plan: 'EN',
  },
  {
    id: 'cn',
    name: 'Chinese',
    // logo: `${CONFIG.assetsDir}/assets/icons/workspaces/logo-2.webp`,
    logo: `https://purecatamphetamine.github.io/country-flag-icons/3x2/CN.svg`,
    plan: 'CN',
  },
];
