import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';

import { ExclusiveNeighborhoodsListingsView } from 'src/sections/guide-explore/exclusive-neighborhoods/listings/view';

// ----------------------------------------------------------------------

export const metadata: Metadata = { title: `Listings - Exclusive Neighborhoods - ${CONFIG.appName}` };

export default function Page() {
  return <ExclusiveNeighborhoodsListingsView />;
}
