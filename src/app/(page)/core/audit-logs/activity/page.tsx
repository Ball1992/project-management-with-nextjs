import type { Metadata } from 'next';

import { SystemActivityLogView } from 'src/sections/audit-logs/view';

// ----------------------------------------------------------------------

export const metadata: Metadata = { title: `System Activity Log` };

export default function Page() {
  return <SystemActivityLogView />;
}
