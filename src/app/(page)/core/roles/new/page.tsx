import type { Metadata } from 'next';

import { RoleCreateView } from 'src/sections/role/view';

// ----------------------------------------------------------------------

export const metadata: Metadata = { title: `Create Role` };

export default function Page() {
  return <RoleCreateView />;
}
