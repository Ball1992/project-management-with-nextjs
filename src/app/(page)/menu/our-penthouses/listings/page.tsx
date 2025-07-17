import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';

import { ListingsListView } from 'src/sections/listings/view';

// ----------------------------------------------------------------------

export const metadata: Metadata = { title: `Listings - ${CONFIG.appName}` };

export default function Page() {
  return <ListingsListView />;
}
