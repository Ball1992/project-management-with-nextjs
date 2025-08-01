import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';

import { RequestInformationDetailView } from 'src/sections/request-information/view/request-information-detail-view';

// ----------------------------------------------------------------------

export const metadata: Metadata = { title: `Request Detail - ${CONFIG.appName}` };

type Props = {
  params: { id: string };
};

export default function Page({ params }: Props) {
  return <RequestInformationDetailView id={params.id} />;
}
