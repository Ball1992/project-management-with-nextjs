'use client';

import type { IRole } from 'src/types/role';
import type { IPermission } from 'src/types/permission';

import { useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import Tooltip from '@mui/material/Tooltip';
import Collapse from '@mui/material/Collapse';
import MenuItem from '@mui/material/MenuItem';
import TableRow from '@mui/material/TableRow';
import Checkbox from '@mui/material/Checkbox';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';
import ListItemText from '@mui/material/ListItemText';

import { useBoolean } from 'minimal-shared/hooks';

import { Label } from 'src/components/label';
import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { CustomPopover, usePopover } from 'src/components/custom-popover';

import { fDate } from 'src/utils/format-time';

// ----------------------------------------------------------------------

type Props = {
  row: IRole;
  selected: boolean;
  onEditRow: () => void;
  onSelectRow: () => void;
  onDeleteRow: () => void;
};

export function RoleTableRow({ row, selected, onEditRow, onSelectRow, onDeleteRow }: Props) {
  const confirm = useBoolean();
  const collapse = useBoolean();
  const popover = usePopover();

  const handleDelete = useCallback(() => {
    onDeleteRow();
    confirm.onFalse();
    popover.onClose();
    toast.success('Delete success!');
  }, [confirm, onDeleteRow, popover]);

  const renderPrimary = (
    <TableRow hover selected={selected}>
      <TableCell padding="checkbox">
        <Checkbox
          checked={selected}
          onClick={onSelectRow}
          inputProps={{ id: `row-checkbox-${row.id}`, 'aria-label': `Row checkbox` }}
        />
      </TableCell>

      <TableCell>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
            <Iconify icon="solar:shield-user-bold" />
          </Avatar>

          <ListItemText
            primary={row.name}
            secondary={row.description}
            primaryTypographyProps={{ typography: 'body2' }}
            secondaryTypographyProps={{
              component: 'span',
              color: 'text.disabled',
              mt: 0.5,
            }}
          />
        </Box>
      </TableCell>

      <TableCell>
        <Stack direction="row" spacing={0.5} flexWrap="wrap">
          {row.permissions?.slice(0, 3).map((permission: IPermission) => (
            <Chip
              key={permission.id}
              label={permission.name}
              size="small"
              variant="soft"
              color="default"
            />
          ))}
          {row.permissions && row.permissions.length > 3 && (
            <Chip
              label={`+${row.permissions.length - 3} more`}
              size="small"
              variant="soft"
              color="primary"
            />
          )}
        </Stack>
      </TableCell>

      <TableCell>
        <Label variant="soft" color="success">
          Enable
        </Label>
      </TableCell>

      <TableCell>
        {fDate(row.createdAt, 'DD/MM/YYYY')}
      </TableCell>

      <TableCell>
        {row.createdBy || 'System'}
      </TableCell>

      <TableCell align="right" sx={{ px: 1, whiteSpace: 'nowrap' }}>
        <Tooltip title="View" placement="top" arrow>
          <IconButton color="default" onClick={onEditRow}>
            <Iconify icon="solar:eye-bold" />
          </IconButton>
        </Tooltip>

        <IconButton
          color={collapse.value ? 'inherit' : 'default'}
          onClick={collapse.onToggle}
          sx={{ ...(collapse.value && { bgcolor: 'action.hover' }) }}
        >
          <Iconify icon="eva:arrow-ios-downward-fill" />
        </IconButton>

        <IconButton color={popover.open ? 'inherit' : 'default'} onClick={popover.onOpen}>
          <Iconify icon="eva:more-vertical-fill" />
        </IconButton>
      </TableCell>
    </TableRow>
  );

  const renderSecondary = (
    <TableRow>
      <TableCell sx={{ p: 0, border: 'none' }} colSpan={8}>
        <Collapse
          in={collapse.value}
          timeout="auto"
          unmountOnExit
          sx={{ bgcolor: 'background.neutral' }}
        >
          <Paper sx={{ m: 1.5 }}>
            <Stack
              direction="row"
              divider={<Box sx={{ width: 2, bgcolor: 'divider', mx: 2 }} />}
              sx={{ py: 2 }}
            >
              <Stack alignItems="center" sx={{ width: 1, textAlign: 'center' }}>
                <Box sx={{ color: 'text.secondary', typography: 'body2' }}>Permissions</Box>
                <Box sx={{ color: 'text.primary', typography: 'h6' }}>
                  {row.permissions?.length || 0}
                </Box>
              </Stack>

              <Stack alignItems="center" sx={{ width: 1, textAlign: 'center' }}>
                <Box sx={{ color: 'text.secondary', typography: 'body2' }}>Users</Box>
                <Box sx={{ color: 'text.primary', typography: 'h6' }}>
                  {row.userCount || 0}
                </Box>
              </Stack>

              <Stack alignItems="center" sx={{ width: 1, textAlign: 'center' }}>
                <Box sx={{ color: 'text.secondary', typography: 'body2' }}>Last Updated</Box>
                <Box sx={{ color: 'text.primary', typography: 'h6' }}>
                  {fDate(row.updatedAt, 'DD/MM/YYYY')}
                </Box>
              </Stack>
            </Stack>

            {row.permissions && row.permissions.length > 0 && (
              <Stack spacing={1} sx={{ p: 2, pt: 0 }}>
                <Box sx={{ typography: 'subtitle2' }}>All Permissions:</Box>
                <Stack direction="row" spacing={0.5} flexWrap="wrap">
                  {row.permissions.map((permission: IPermission) => (
                    <Chip
                      key={permission.id}
                      label={permission.name}
                      size="small"
                      variant="outlined"
                      color="default"
                    />
                  ))}
                </Stack>
              </Stack>
            )}
          </Paper>
        </Collapse>
      </TableCell>
    </TableRow>
  );

  return (
    <>
      {renderPrimary}

      {renderSecondary}

      <CustomPopover
        open={popover.open}
        anchorEl={popover.anchorEl}
        onClose={popover.onClose}
        slotProps={{ arrow: { placement: 'right-top' } }}
      >
        <MenuItem
          onClick={() => {
            confirm.onTrue();
            popover.onClose();
          }}
          sx={{ color: 'error.main' }}
        >
          <Iconify icon="solar:trash-bin-trash-bold" />
          Delete
        </MenuItem>
      </CustomPopover>

      <ConfirmDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        title="Delete Role"
        content={`Are you sure want to delete role "${row.name}"?`}
        action={
          <Button variant="contained" color="error" onClick={handleDelete}>
            Delete
          </Button>
        }
      />
    </>
  );
}
