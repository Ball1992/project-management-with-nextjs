import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';

import { PropertyTypeCreateView } from 'src/sections/property-type/view/property-type-create-view';

// ----------------------------------------------------------------------

export const metadata: Metadata = { title: `Create Property Type - ${CONFIG.appName}` };

export default function Page() {
  return <PropertyTypeCreateView />;
}
