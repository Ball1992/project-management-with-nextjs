import type { Metadata } from 'next';

import { GlobalSettingsOverviewView } from 'src/sections/global-settings/view';

// ----------------------------------------------------------------------

export const metadata: Metadata = { title: `Global Settings - Overview` };

export default function Page() {
  return <GlobalSettingsOverviewView />;
}
