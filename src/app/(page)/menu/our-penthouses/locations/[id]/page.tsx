import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';

import { locationService } from 'src/services/location.service';
import { LocationDetailView } from 'src/sections/locations/view/location-detail';

// ----------------------------------------------------------------------

export const metadata: Metadata = { title: `Our Penthouses - Edit location | ${CONFIG.appName}` };

interface PageProps {
  params: {
    id: string;
  };
}

export default async function Page({ params }: PageProps) {
  let currentLocation = undefined;

  try {
    // Load without language parameter on server-side
    if (params.id && params.id !== 'new') {
      currentLocation = await locationService.getLocation(params.id);
    }
  } catch (error) {
    console.error('Error loading location:', error);
  }

  return <LocationDetailView currentLocation={currentLocation} />;
}
