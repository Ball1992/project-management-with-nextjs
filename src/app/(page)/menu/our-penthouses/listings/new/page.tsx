import type { Metadata } from 'next';
import { CONFIG } from 'src/global-config';
import { ListingDetail } from 'src/sections/listings/view/listing-detail';

// ----------------------------------------------------------------------

export const metadata = { title: `Our Penthouses - Create listings | ${CONFIG.appName}` };

export default function ListingCreatePage() {
  return <ListingDetail />;
}
