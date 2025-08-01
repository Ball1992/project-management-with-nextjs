import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';

import { TermsAndConditionsView } from 'src/sections/terms-and-conditions/view';

// ----------------------------------------------------------------------

export const metadata: Metadata = { title: `Terms and Conditions - ${CONFIG.appName}` };

export default function Page() {
  return <TermsAndConditionsView />;
}
