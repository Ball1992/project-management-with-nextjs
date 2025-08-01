import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';

import { ExclusiveNeighborhoodsLocationsView } from 'src/sections/guide-explore/exclusive-neighborhoods/locations/view';

// ----------------------------------------------------------------------

export const metadata: Metadata = { title: `Locations - Exclusive Neighborhoods - ${CONFIG.appName}` };

export default function Page() {
  return <ExclusiveNeighborhoodsLocationsView />;
}
