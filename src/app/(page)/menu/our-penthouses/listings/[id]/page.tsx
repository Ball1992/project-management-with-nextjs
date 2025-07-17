import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';

import { ListingDetailView } from 'src/sections/listings/view/listing-detail-view';

// ----------------------------------------------------------------------

export const metadata: Metadata = { title: `Listing Detail - ${CONFIG.appName}` };

type Props = {
  params: { id: string };
};

export default function Page({ params }: Props) {
  return <ListingDetailView id={params.id} />;
}
