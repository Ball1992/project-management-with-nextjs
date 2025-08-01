import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';

import { PrivacyStatementView } from 'src/sections/privacy-statement/view';

// ----------------------------------------------------------------------

export const metadata: Metadata = { title: `Privacy Statement - ${CONFIG.appName}` };

export default function Page() {
  return <PrivacyStatementView />;
}
