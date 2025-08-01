import type { Metadata } from 'next';

import { AuditLogsListView } from 'src/sections/audit-logs/view';

// ----------------------------------------------------------------------

export const metadata: Metadata = { title: `Audit Logs` };

export default function Page() {
  return <AuditLogsListView />;
}
