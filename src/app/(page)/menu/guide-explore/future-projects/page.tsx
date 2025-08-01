import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';

import { FutureProjectsView } from 'src/sections/guide-explore/future-projects/view';

// ----------------------------------------------------------------------

export const metadata: Metadata = { title: `Future Projects - ${CONFIG.appName}` };

export default function Page() {
  return <FutureProjectsView />;
}
