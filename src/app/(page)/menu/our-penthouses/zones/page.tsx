import type { Metadata } from 'next';
import { CONFIG } from 'src/global-config';
import { ZonesListView } from 'src/sections/zones/view';

// ----------------------------------------------------------------------

export const metadata = { title: `Our Penthouses - Zones | ${CONFIG.appName}` };

export default function Page() {
  return <ZonesListView />;
}
