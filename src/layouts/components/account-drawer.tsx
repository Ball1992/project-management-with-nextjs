'use client';

import React from 'react';
import type { IconButtonProps } from '@mui/material/IconButton';

import { varAlpha } from 'minimal-shared/utils';
import { useBoolean } from 'minimal-shared/hooks';

import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Avatar from '@mui/material/Avatar';
import Paper from '@mui/material/Paper';
import Popover from '@mui/material/Popover';
import Divider from '@mui/material/Divider';
import Tooltip from '@mui/material/Tooltip';
import MenuList from '@mui/material/MenuList';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';

import { paths } from 'src/routes/paths';
import { usePathname } from 'src/routes/hooks';
import { RouterLink } from 'src/routes/components';

import { _mock } from 'src/_mock';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { AnimateBorder } from 'src/components/animate';

import { useMockedUser } from 'src/auth/hooks';

import { UpgradeBlock } from './nav-upgrade';
import { AccountButton } from './account-button';
import { SignOutButton } from './sign-out-button';

import { useAuthContext } from 'src/auth/hooks';

// ----------------------------------------------------------------------

export type AccountDrawerProps = IconButtonProps & {
  data?: {
    label: string;
    href: string;
    icon?: React.ReactNode;
    info?: React.ReactNode;
  }[];
};

export function AccountDrawer({ data = [], sx, ...other }: AccountDrawerProps) {
  const pathname = usePathname();
  
  // get user from auth context
  // const { user } = useAuthContext();
  const { user } = useMockedUser();

  const { value: open, onFalse: onClose, onTrue: onOpen } = useBoolean();
  const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null);

  const handleOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
    onOpen();
  };

  const handleClose = () => {
    setAnchorEl(null);
    onClose();
  };


  const renderList = () => (
    <>
      <Divider sx={{ borderStyle: 'dashed' }} />
      <MenuList
        disablePadding
        sx={{
          py: 0,
          px: 0,
          '& li': { p: 0 },
        }}
      >
        {/* Profile Menu Item */}
        <MenuItem>
          <Link
            component={RouterLink}
            href={paths.dashboard.user.account}
            color="inherit"
            underline="none"
            onClick={handleClose}
            sx={{
              py: 2,
              px: 3,
              width: 1,
              display: 'flex',
              typography: 'body1',
              alignItems: 'center',
              color: 'text.primary',
              fontWeight: 500,
              '&:hover': { 
                bgcolor: 'action.hover',
              },
            }}
          >
            Profile
          </Link>
        </MenuItem>
      </MenuList>
      <Divider sx={{ borderStyle: 'dashed' }} />
    </>
  );

  return (
    <>
      <AccountButton
        onClick={handleOpen}
        photoURL={(user as any)?.photoURL || undefined}
        displayName={(user as any)?.displayName || undefined}
        sx={sx}
        {...other}
      />

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        slotProps={{
          paper: {
            sx: {
              width: 280,
              p: 0,
              mt: 1,
              ml: 0.75,
              boxShadow: (theme) => theme.customShadows.dropdown,
            },
          },
        }}
      >
        <Paper sx={{ width: 280 }}>
          {/* User Profile Section */}
          <Box
            sx={{
              p: 3,
              pb: 2,
              display: 'flex',
              alignItems: 'flex-start',
              flexDirection: 'column',
            }}
          >
            <Typography variant="body1" noWrap sx={{ mb: 0.5, fontWeight: 600 }}>
              {(user as any)?.displayName || 'Hudson Alvarez'}
            </Typography>

            <Typography variant="body2" sx={{ color: 'text.secondary' }} noWrap>
              {(user as any)?.email || 'demo@minimals.cc'}
            </Typography>
          </Box>

          {/* Menu Items */}
          {renderList()}

          {/* Logout Button */}
          <Box sx={{ p: 0 }}>
            <MenuItem>
              <Link
                color="inherit"
                underline="none"
                onClick={async () => {
                  try {
                    const { signOut } = await import('src/auth/context/jwt/action');
                    await signOut();
                    handleClose();
                    window.location.reload();
                  } catch (error) {
                    console.error(error);
                  }
                }}
                sx={{
                  py: 2,
                  px: 3,
                  width: 1,
                  display: 'flex',
                  typography: 'body1',
                  alignItems: 'center',
                  color: 'error.main',
                  fontWeight: 500,
                  cursor: 'pointer',
                  '&:hover': { 
                    bgcolor: 'action.hover',
                  },
                }}
              >
                Logout
              </Link>
            </MenuItem>
          </Box>
        </Paper>
      </Popover>
    </>
  );
}
