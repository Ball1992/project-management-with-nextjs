import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';

import { LocationDetailView } from 'src/sections/locations/view/location-detail-view';

// ----------------------------------------------------------------------

export const metadata: Metadata = { title: `Location Detail - ${CONFIG.appName}` };

type Props = {
  params: { id: string };
};

export default function Page({ params }: Props) {
  return <LocationDetailView id={params.id} />;
}
