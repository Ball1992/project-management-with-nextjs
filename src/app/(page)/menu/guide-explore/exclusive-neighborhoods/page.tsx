import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';

import { ExclusiveNeighborhoodsView } from 'src/sections/guide-explore/exclusive-neighborhoods/view';

// ----------------------------------------------------------------------

export const metadata: Metadata = { title: `Exclusive Neighborhoods - ${CONFIG.appName}` };

export default function Page() {
  return <ExclusiveNeighborhoodsView />;
}
