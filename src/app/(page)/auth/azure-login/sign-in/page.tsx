import { CONFIG } from 'src/global-config';

import { AzureLoginView } from 'src/auth/view/azure-login-view';

// ----------------------------------------------------------------------

export const metadata = { title: `THAILAND PENTHOUSES - ${CONFIG.appName}` };

export default function Page() {
  return <AzureLoginView />;
}
