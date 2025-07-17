import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';

import { UserListView } from 'src/sections/user/view';

// ----------------------------------------------------------------------

export const metadata: Metadata = { title: `User Management - ${CONFIG.appName}` };

export default function Page() {
  return <UserListView />;
}
