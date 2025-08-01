import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';

import { CuratedLifestyleListingsView } from 'src/sections/guide-explore/curated-lifestyle/listings/view';

// ----------------------------------------------------------------------

export const metadata: Metadata = { title: `Listings - Curated Lifestyle - ${CONFIG.appName}` };

export default function Page() {
  return <CuratedLifestyleListingsView />;
}
