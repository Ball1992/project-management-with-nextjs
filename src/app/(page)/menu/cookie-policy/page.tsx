import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';

import { CookiePolicyView } from 'src/sections/cookie-policy/view';

// ----------------------------------------------------------------------

export const metadata: Metadata = { title: `Cookie Policy - ${CONFIG.appName}` };

export default function Page() {
  return <CookiePolicyView />;
}
