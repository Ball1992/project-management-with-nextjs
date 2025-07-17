import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';

import { LocationCreateView } from 'src/sections/locations/view/location-create-view';

// ----------------------------------------------------------------------

export const metadata: Metadata = { title: `Create Location - ${CONFIG.appName}` };

export default function Page() {
  return <LocationCreateView />;
}
