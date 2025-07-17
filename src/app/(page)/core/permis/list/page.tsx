import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';

import { RoleListView } from 'src/sections/role/view';

// ----------------------------------------------------------------------

export const metadata: Metadata = { title: `สิทธิ์การใช้งานระบบ | แดชบอร์ด - ${CONFIG.appName}` };

export default function Page() {
  return <RoleListView />;
}
