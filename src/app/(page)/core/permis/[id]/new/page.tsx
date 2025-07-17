import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';

import { RoleCreateView } from 'src/sections/role/view';

// ----------------------------------------------------------------------

export const metadata: Metadata = { title: `สิทธิ์การใช้งานระบบ | แดชบอร์ด - ${CONFIG.appName}` };

type Props = {
  params: { id: string };
};

export default function Page({ params }: Props) {
  const { id } = params;

  return <RoleCreateView id={id} />;
}
