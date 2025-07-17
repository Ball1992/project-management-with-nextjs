import type { Metadata } from 'next';

import { GlobalSettingsAdvancedView } from 'src/sections/global-settings/view';

// ----------------------------------------------------------------------

export const metadata: Metadata = { title: `Global Settings - Advanced` };

export default function Page() {
  return <GlobalSettingsAdvancedView />;
}
