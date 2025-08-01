import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';

import { exclusiveNeighborhoodsLocationsService } from 'src/services/exclusive-neighborhoods-locations.service';
import { ExclusiveNeighborhoodsLocationDetailView } from 'src/sections/guide-explore/exclusive-neighborhoods/locations/view/exclusive-neighborhoods-location-detail';

// ----------------------------------------------------------------------

export const metadata: Metadata = { 
  title: `Guide Explore - Edit exclusive neighborhoods location | ${CONFIG.appName}` 
};

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
      currentLocation = await exclusiveNeighborhoodsLocationsService.getLocation(Number(params.id));
    }
  } catch (error) {
    console.error('Error loading exclusive neighborhoods location:', error);
  }

  return <ExclusiveNeighborhoodsLocationDetailView currentLocation={currentLocation} />;
}
