import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';

import { PropertyTypeDetailView } from 'src/sections/property-type/view';

// ----------------------------------------------------------------------

export const metadata: Metadata = { title: `Our Penthouses - Create property type | ${CONFIG.appName}` };

export default function Page() {
  return <PropertyTypeDetailView />;
}
