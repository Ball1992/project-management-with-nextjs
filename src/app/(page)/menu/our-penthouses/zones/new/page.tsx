import type { Metadata } from 'next';
import { CONFIG } from 'src/global-config';
import { ZoneDetailView } from 'src/sections/zones/view';

// ----------------------------------------------------------------------

export const metadata = { title: `Our Penthouses - Create zone | ${CONFIG.appName}` };

export default function Page() {
  return <ZoneDetailView />;
}
