import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';

import { ContactListView } from 'src/sections/contact/view';

// ----------------------------------------------------------------------

export const metadata: Metadata = { title: `Contact - ${CONFIG.appName}` };

export default function Page() {
  return <ContactListView />;
}
