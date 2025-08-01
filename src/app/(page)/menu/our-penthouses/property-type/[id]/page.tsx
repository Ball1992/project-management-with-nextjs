import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';

import { propertyTypeService } from 'src/services/property-type.service';
import { PropertyTypeDetailView } from 'src/sections/property-type/view';

// ----------------------------------------------------------------------

export const metadata: Metadata = { title: `Our Penthouses - Edit property type | ${CONFIG.appName}` };

interface PageProps {
  params: {
    id: string;
  };
}

export default async function Page({ params }: PageProps) {
  let currentPropertyType = undefined;

  try {
    // Load without language parameter on server-side
    currentPropertyType = await propertyTypeService.getPropertyType(params.id);
  } catch (error) {
    console.error('Error loading property type:', error);
  }

  return <PropertyTypeDetailView currentPropertyType={currentPropertyType} />;
}
