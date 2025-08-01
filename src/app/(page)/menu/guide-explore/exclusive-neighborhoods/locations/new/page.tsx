import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';

import { ExclusiveNeighborhoodsLocationDetailView } from 'src/sections/guide-explore/exclusive-neighborhoods/locations/view/exclusive-neighborhoods-location-detail';

// ----------------------------------------------------------------------

export const metadata: Metadata = { 
  title: `Guide Explore - Create exclusive neighborhoods location | ${CONFIG.appName}` 
};

export default function Page() {
  return <ExclusiveNeighborhoodsLocationDetailView />;
}
