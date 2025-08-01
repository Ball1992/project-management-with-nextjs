import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';
import { _permisList } from 'src/_mock/_user';

import { RoleDetailView } from 'src/sections/role/view';

// ----------------------------------------------------------------------

export const metadata: Metadata = { title: `สิทธิ์การใช้งานระบบ | แดชบอร์ด - ${CONFIG.appName}` };

type Props = {
  params: { id: string };
};

export default function Page({ params }: Props) {
  const { id } = params;

  const currentUser = _permisList.find((user) => user.id === id);

  return <RoleDetailView user={currentUser} page="detail"/>;
}

// ----------------------------------------------------------------------

/**
 * [1] Default
 * Remove [1] and [2] if not using [2]
 * Will remove in Next.js v15
 */
const dynamic = CONFIG.isStaticExport ? 'auto' : 'force-dynamic';
export { dynamic };

/**
 * [2] Static exports
 * https://nextjs.org/docs/app/building-your-application/deploying/static-exports
 */
export async function generateStaticParams() {
  if (CONFIG.isStaticExport) {
    return _permisList.map((user) => ({ id: user.id }));
  }
  return [];
}
