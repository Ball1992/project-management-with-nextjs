import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';

import { BuyersGuideView } from 'src/sections/guide-explore/buyers-guide/view';

// ----------------------------------------------------------------------

export const metadata: Metadata = { title: `Buyer's Guide - ${CONFIG.appName}` };

export default function Page() {
  return <BuyersGuideView />;
}
