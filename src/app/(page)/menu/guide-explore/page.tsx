import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';

import { GuideExploreView } from 'src/sections/guide-explore/view';

// ----------------------------------------------------------------------

export const metadata: Metadata = { title: `Guide & Explore - ${CONFIG.appName}` };

export default function Page() {
  return <GuideExploreView />;
}
