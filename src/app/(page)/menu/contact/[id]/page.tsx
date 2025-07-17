import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';

import { ContactDetailView } from 'src/sections/contact/view/contact-detail-view';

// ----------------------------------------------------------------------

export const metadata: Metadata = { title: `Contact Detail - ${CONFIG.appName}` };

type Props = {
  params: { id: string };
};

export default function Page({ params }: Props) {
  return <ContactDetailView id={params.id} />;
}
