import { CONFIG } from 'src/global-config';

import { UnifiedLoginView } from 'src/auth/view/unified-login-view';

// ----------------------------------------------------------------------

export const metadata = { title: `Sign in | ${CONFIG.appName}` };

export default function Page() {
  return <UnifiedLoginView />;
}
