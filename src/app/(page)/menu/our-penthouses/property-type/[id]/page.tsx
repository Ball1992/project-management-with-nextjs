import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';

import { PropertyTypeDetailView } from 'src/sections/property-type/view/property-type-detail-view';

// ----------------------------------------------------------------------

export const metadata: Metadata = { title: `Property Type Detail - ${CONFIG.appName}` };

type Props = {
  params: { id: string };
};

export default function Page({ params }: Props) {
  return <PropertyTypeDetailView id={params.id} />;
}
