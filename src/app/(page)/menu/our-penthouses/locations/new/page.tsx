import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';

import { LocationDetailView } from 'src/sections/locations/view/location-detail';

// ----------------------------------------------------------------------

export const metadata: Metadata = { title: `Our Penthouses - Create location | ${CONFIG.appName}` };

export default function Page() {
  return <LocationDetailView />;
}
