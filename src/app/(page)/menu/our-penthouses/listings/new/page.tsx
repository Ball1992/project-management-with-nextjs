import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';

import { ListingCreateFormView } from 'src/sections/listings/view/listing-create-form-view';

// ----------------------------------------------------------------------

export const metadata: Metadata = { title: `Create Listing - ${CONFIG.appName}` };

export default function Page() {
  return <ListingCreateFormView />;
}
