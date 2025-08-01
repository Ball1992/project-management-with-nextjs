import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';

import { CuratedLifestyleCategoriesView } from 'src/sections/guide-explore/curated-lifestyle/categories/view';

// ----------------------------------------------------------------------

export const metadata: Metadata = { title: `Categories - Curated Lifestyle - ${CONFIG.appName}` };

export default function Page() {
  return <CuratedLifestyleCategoriesView />;
}
