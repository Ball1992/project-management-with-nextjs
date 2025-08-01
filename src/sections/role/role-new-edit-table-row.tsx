import type { IUserPermisItem } from 'src/types/user';

import { useBoolean, usePopover } from 'minimal-shared/hooks';

import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import Tooltip from '@mui/material/Tooltip';
import MenuList from '@mui/material/MenuList';
import MenuItem from '@mui/material/MenuItem';
import TableRow from '@mui/material/TableRow';
import Checkbox from '@mui/material/Checkbox';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';
import { RouterLink } from 'src/routes/components';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { CustomPopover } from 'src/components/custom-popover';

import { RoleQuickEditForm } from './role-quick-edit-form';

// ----------------------------------------------------------------------

type Props = {
  row: IUserPermisItem;
  selected: string[];
  editHref: string;
  onSelectRow: (id: string) => void;
  onDeleteRow: () => void;
  disabled?: boolean;
};

export function RoleNewTableRow({ row, selected, editHref, onSelectRow, onDeleteRow, disabled }: Props) {
  
  const router = useRouter();
  const menuActions = usePopover();
  const confirmDialog = useBoolean();
  const quickEditForm = useBoolean();

  const handleDetail = (data: any) => {
    router.push(paths.dashboard.permis.detail(data.id));
  };

  const renderQuickEditForm = () => (
    <RoleQuickEditForm
      currentUser={row}
      open={quickEditForm.value}
      onClose={quickEditForm.onFalse}
    />
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
    <TableRow hover selected={selected.includes(row.id)} aria-checked={selected.includes(row.id)} tabIndex={-1}>
        
        <TableCell>
          <Box sx={{ gap: 2, display: 'flex', alignItems: 'center' }}>
            <Stack sx={{ typography: 'body2', flex: '1 1 auto', alignItems: 'flex-start' }}>
                {row.name}
            </Stack>
          </Box>
        </TableCell>

        <TableCell padding="checkbox" align='center'>
          <Checkbox
            checked={selected.includes(`${row.id}|view`)}
            disabled={disabled}
            onClick={() => onSelectRow(`${row.id}|view`)}
            value={`${row.id}|view`}
            inputProps={{
              id: `${row.id}-checkbox`,
              'aria-label': `${row.id} checkbox`,
            }}
          />
        </TableCell>

        <TableCell padding="checkbox" align='center'>
          <Checkbox
            checked={selected.includes(`${row.id}|create`)}
            disabled={disabled}
            onClick={() => onSelectRow(`${row.id}|create`)}
            value={`${row.id}|create`}
            inputProps={{
              id: `${row.id}-checkbox`,
              'aria-label': `${row.id} checkbox`,
            }}
          />
        </TableCell>


        <TableCell padding="checkbox" align='center'>
          <Checkbox
            checked={selected.includes(`${row.id}|update`)}
            disabled={disabled}
            onClick={() => onSelectRow(`${row.id}|update`)}
            value={`${row.id}|update`}
            inputProps={{
              id: `${row.id}-checkbox`,
              'aria-label': `${row.id} checkbox`,
            }}
          />
        </TableCell>

        <TableCell padding="checkbox" align='center'>
          <Checkbox
            checked={selected.includes(`${row.id}|delete`)}
            disabled={disabled}
            onClick={() => onSelectRow(`${row.id}|delete`)}
            value={`${row.id}|delete`}
            inputProps={{
              id: `${row.id}-checkbox`,
              'aria-label': `${row.id} checkbox`,
            }}
          />
        </TableCell>


      </TableRow>
  );
}
