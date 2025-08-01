import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';

import { LocationsListView } from 'src/sections/locations/view';

// ----------------------------------------------------------------------

export const metadata: Metadata = { title: `Our Penthouses - Locations | ${CONFIG.appName}` };

export default function Page() {
  return <LocationsListView />;
}
