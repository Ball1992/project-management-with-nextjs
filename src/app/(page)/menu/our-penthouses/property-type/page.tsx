import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';

import { PropertyTypeListView } from 'src/sections/property-type/view';

// ----------------------------------------------------------------------

export const metadata: Metadata = { title: `Our Penthouses - Property Types | ${CONFIG.appName}` };

export default function Page() {
  return <PropertyTypeListView />;
}
