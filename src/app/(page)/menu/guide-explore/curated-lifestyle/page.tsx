import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';

import { CuratedLifestyleView } from 'src/sections/guide-explore/curated-lifestyle/view';

// ----------------------------------------------------------------------

export const metadata: Metadata = { title: `Curated Lifestyle - ${CONFIG.appName}` };

export default function Page() {
  return <CuratedLifestyleView />;
}
