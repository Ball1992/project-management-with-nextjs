import type { IAuditLog } from 'src/types/audit-log';

import { useBoolean, usePopover } from 'minimal-shared/hooks';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import MenuList from '@mui/material/MenuList';
import MenuItem from '@mui/material/MenuItem';
import TableRow from '@mui/material/TableRow';
import Checkbox from '@mui/material/Checkbox';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';

import { fDateTime } from 'src/utils/format-time';

import { Iconify } from 'src/components/iconify';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { CustomPopover } from 'src/components/custom-popover';

// ----------------------------------------------------------------------

type Props = {
  row: IAuditLog;
  selected: boolean;
  onSelectRow: () => void;
  onDeleteRow: () => void;
};

export function AuditLogTableRow({ row, selected, onSelectRow, onDeleteRow }: Props) {
  const menuActions = usePopover();
  const confirmDialog = useBoolean();

  const getActionColor = (action: string) => {
    if (action.toLowerCase().includes('login')) {
      return 'info';
    }
    if (action.toLowerCase().includes('create')) {
      return 'success';
    }
    if (action.toLowerCase().includes('delete')) {
      return 'error';
    }
    if (action.toLowerCase().includes('update')) {
      return 'warning';
    }
    return 'default';
  };

  const renderMenuActions = () => (
    <CustomPopover
      open={menuActions.open}
      anchorEl={menuActions.anchorEl}
      onClose={menuActions.onClose}
      slotProps={{ arrow: { placement: 'right-top' } }}
    >
      <MenuList>
        <MenuItem
          onClick={() => {
            confirmDialog.onTrue();
            menuActions.onClose();
          }}
          sx={{ color: 'error.main' }}
        >
          <Iconify icon="solar:trash-bin-trash-bold" />
          Delete
        </MenuItem>
      </MenuList>
    </CustomPopover>
  );

  const renderConfirmDialog = () => (
    <ConfirmDialog
      open={confirmDialog.value}
      onClose={confirmDialog.onFalse}
      title="Delete"
      content="Are you sure want to delete?"
      action={
        <Button variant="contained" color="error" onClick={onDeleteRow}>
          Delete
        </Button>
      }
    />
  );

  return (
    <>
      <TableRow hover selected={selected} aria-checked={selected} tabIndex={-1}>
        <TableCell padding="checkbox">
          <Checkbox
            checked={selected}
            onClick={onSelectRow}
            inputProps={{
              id: `${row.id}-checkbox`,
              'aria-label': `${row.id} checkbox`,
            }}
          />
        </TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap' }}>
          <Typography variant="body2">
            {fDateTime(row.createdDate)}
          </Typography>
        </TableCell>

        <TableCell>
          <Chip
            label={row.action}
            color={getActionColor(row.action) as any}
            size="small"
          />
        </TableCell>

        <TableCell>
          <Typography variant="body2" fontWeight="medium">
            {row.createdByName}
          </Typography>
          <Typography variant="caption" color="text.secondary" display="block">
            {row.user.email}
          </Typography>
        </TableCell>

        <TableCell>
          <Typography variant="body2">
            {row.module}
            {row.targetId && (
              <Typography variant="caption" color="text.secondary" display="block">
                Target: {row.targetId}
              </Typography>
            )}
          </Typography>
        </TableCell>

        <TableCell>
          <Typography variant="body2" color="text.secondary">
            {row.ipAddress}
          </Typography>
        </TableCell>

        <TableCell
          sx={{
            maxWidth: 200,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          <Typography variant="body2" color="text.secondary">
            {row.userAgent}
          </Typography>
        </TableCell>

        <TableCell>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Tooltip title="View Details" placement="top" arrow>
              <IconButton color="default">
                <Iconify icon="solar:eye-bold" />
              </IconButton>
            </Tooltip>

            <IconButton color={menuActions.open ? 'inherit' : 'default'} onClick={menuActions.onOpen}>
              <Iconify icon="eva:more-vertical-fill" />
            </IconButton>
          </Box>
        </TableCell>
      </TableRow>

      {renderMenuActions()}
      {renderConfirmDialog()}
    </>
  );
}
