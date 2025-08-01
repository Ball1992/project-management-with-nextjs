import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';

import { RequestInformationListView } from 'src/sections/request-information/view';

// ----------------------------------------------------------------------

export const metadata: Metadata = { title: `Our Penthouses - Request Information | ${CONFIG.appName}` };

export default function Page() {
  return <RequestInformationListView />;
}
