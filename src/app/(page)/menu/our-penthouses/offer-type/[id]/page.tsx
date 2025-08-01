import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';

import { offerTypeService } from 'src/services/offer-type.service';
import { OfferTypeFormView } from 'src/sections/offer-type/view/offer-type-form-view';

// ----------------------------------------------------------------------

export const metadata: Metadata = { title: `Our Penthouses - Edit offer type | ${CONFIG.appName}` };

interface PageProps {
  params: {
    id: string;
  };
}

export default async function Page({ params }: PageProps) {
  let currentOfferType = undefined;

  try {
    // Load without language parameter on server-side
    if (params.id && params.id !== 'new') {
      currentOfferType = await offerTypeService.getOfferType(params.id);
    }
  } catch (error) {
    console.error('Error loading offer type:', error);
  }

  return <OfferTypeFormView currentOfferType={currentOfferType} />;
}
