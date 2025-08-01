import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';

import { zoneService } from 'src/services/zone.service';
import { ZoneDetailView } from 'src/sections/zones/view/zone-detail';

// ----------------------------------------------------------------------

export const metadata: Metadata = { title: `Our Penthouses - Edit zone | ${CONFIG.appName}` };

interface PageProps {
  params: {
    id: string;
  };
}

export default async function Page({ params }: PageProps) {
  let currentZone = undefined;

  try {
    // Load without language parameter on server-side
    if (params.id && params.id !== 'new') {
      currentZone = await zoneService.getZone(params.id);
    }
  } catch (error) {
    console.error('Error loading zone:', error);
  }

  return <ZoneDetailView currentZone={currentZone} />;
}
