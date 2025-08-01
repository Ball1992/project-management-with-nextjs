import type { Metadata } from 'next';
import { CONFIG } from 'src/global-config';
import { ListingsListView } from 'src/sections/listings/view/listings-list-view';

// ----------------------------------------------------------------------

export const metadata = { title: `Our Penthouses - Listings | ${CONFIG.appName}` };

export default function ListingsListPage() {
  return <ListingsListView />;
}
