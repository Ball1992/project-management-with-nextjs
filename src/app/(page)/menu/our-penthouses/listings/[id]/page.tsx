import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';

import { penthouseService } from 'src/services/penthouse.service';
import { ListingDetail } from 'src/sections/listings/view/listing-detail';

// ----------------------------------------------------------------------

export const metadata: Metadata = { title: `Our Penthouses - Edit listings | ${CONFIG.appName}` };

interface PageProps {
  params: {
    id: string;
  };
}

export default async function Page({ params }: PageProps) {
  let currentPenthouse = undefined;

  try {
    // Load without language parameter on server-side
    if (params.id && params.id !== 'new') {
      currentPenthouse = await penthouseService.getPenthouse(params.id, 'en');
    }
  } catch (error) {
    console.error('Error loading penthouse:', error);
  }

  return <ListingDetail currentPenthouse={currentPenthouse} />;
}
