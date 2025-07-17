'use client';

import type { IconProps } from '@iconify/react';
import type { Theme, SxProps } from '@mui/material/styles';

import { forwardRef } from 'react';
// import { Icon, disableCache } from '@iconify/react';
import { Icon, addIcon } from '@iconify/react';
import { mergeClasses } from 'minimal-shared/utils';

import NoSsr from '@mui/material/NoSsr';
import { styled } from '@mui/material/styles';

// Import Solar icons
import exportBold from '@iconify-icons/solar/export-bold';
import trashBinTrashBold from '@iconify-icons/solar/trash-bin-trash-bold';
import penBold from '@iconify-icons/solar/pen-bold';
import eyeBold from '@iconify-icons/solar/eye-bold';
import restartBold from '@iconify-icons/solar/restart-bold';
import printerMinimalisticBold from '@iconify-icons/solar/printer-minimalistic-bold';
import importBold from '@iconify-icons/solar/import-bold';
import shieldUserBold from '@iconify-icons/solar/shield-user-bold';
import starBold from '@iconify-icons/solar/star-bold';
import galleryAddBold from '@iconify-icons/solar/gallery-add-bold';
import cameraAddBold from '@iconify-icons/solar/camera-add-bold';
import settingsBoldDuotone from '@iconify-icons/solar/settings-bold-duotone';
import shieldKeyholeBoldDuotone from '@iconify-icons/solar/shield-keyhole-bold-duotone';
import menuDotsBoldDuotone from '@iconify-icons/solar/menu-dots-bold-duotone';
import globalBoldDuotone from '@iconify-icons/solar/global-bold-duotone';
import translationBoldDuotone from '@iconify-icons/solar/translation-bold-duotone';
import homeAngleBoldDuotone from '@iconify-icons/solar/home-angle-bold-duotone';

// Import Eva icons
import moreVerticalFill from '@iconify-icons/eva/more-vertical-fill';

import { iconifyClasses } from './classes';

// Register Solar icons
addIcon('solar:export-bold', exportBold);
addIcon('solar:trash-bin-trash-bold', trashBinTrashBold);
addIcon('solar:pen-bold', penBold);
addIcon('solar:eye-bold', eyeBold);
addIcon('solar:restart-bold', restartBold);
addIcon('solar:printer-minimalistic-bold', printerMinimalisticBold);
addIcon('solar:import-bold', importBold);
addIcon('solar:shield-user-bold', shieldUserBold);
addIcon('solar:star-bold', starBold);
addIcon('solar:gallery-add-bold', galleryAddBold);
addIcon('solar:camera-add-bold', cameraAddBold);
addIcon('solar:settings-bold-duotone', settingsBoldDuotone);
addIcon('solar:shield-keyhole-bold-duotone', shieldKeyholeBoldDuotone);
addIcon('solar:menu-dots-bold-duotone', menuDotsBoldDuotone);
addIcon('solar:global-bold-duotone', globalBoldDuotone);
addIcon('solar:translation-bold-duotone', translationBoldDuotone);
addIcon('solar:home-angle-bold-duotone', homeAngleBoldDuotone);

// Register Eva icons
addIcon('eva:more-vertical-fill', moreVerticalFill);

// ----------------------------------------------------------------------

export type IconifyProps = React.ComponentProps<typeof IconRoot> & IconProps;

export const Iconify = forwardRef<SVGSVGElement, IconifyProps>((props, ref) => {
  const { className, width = 20, sx, ...other } = props;

  const baseStyles: SxProps<Theme> = {
    width,
    height: width,
    flexShrink: 0,
    display: 'inline-flex',
  };

  const renderFallback = () => (
    <IconFallback
      className={mergeClasses([iconifyClasses.root, className])}
      sx={[baseStyles, ...(Array.isArray(sx) ? sx : [sx])]}
    />
  );

  return (
    <NoSsr fallback={renderFallback()}>
      <IconRoot
        ssr
        ref={ref}
        className={mergeClasses([iconifyClasses.root, className])}
        sx={[baseStyles, ...(Array.isArray(sx) ? sx : [sx])]}
        {...other}
      />
    </NoSsr>
  );
});

// https://iconify.design/docs/iconify-icon/disable-cache.html
// disableCache('local');

// ----------------------------------------------------------------------

const IconRoot = styled(Icon)``;

const IconFallback = styled('span')``;
