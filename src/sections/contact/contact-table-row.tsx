import type { IContact } from 'src/types/contact';

import { useBoolean, usePopover } from 'minimal-shared/hooks';

import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import MenuList from '@mui/material/MenuList';
import MenuItem from '@mui/material/MenuItem';
import TableRow from '@mui/material/TableRow';
import Checkbox from '@mui/material/Checkbox';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';
import { RouterLink } from 'src/routes/components';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { CustomPopover } from 'src/components/custom-popover';

// ----------------------------------------------------------------------

type Props = {
  row: IContact;
  selected: boolean;
  onSelectRow: () => void;
  onDeleteRow: () => void;
  editHref: string;
};

export function ContactTableRow({ row, selected, onSelectRow, onDeleteRow, editHref }: Props) {
  const router = useRouter();
  const menuActions = usePopover();
  const confirmDialog = useBoolean();

  const handleDetail = (data: any) => {
    router.push(paths.dashboard.contact.detail(data.id));
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

        <TableCell>
          <Link component={RouterLink} href={editHref} color="inherit" sx={{ cursor: 'pointer' }}>
            {`${row.firstName} ${row.lastName}`}
          </Link>
        </TableCell>

        <TableCell>{row.email}</TableCell>

        <TableCell
          sx={{
            maxWidth: 200,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {row.message}
        </TableCell>

        <TableCell>
          <Label
            variant="soft"
            color={
              (row.status === 'new' && 'info') ||
              (row.status === 'in_progress' && 'warning') ||
              (row.status === 'resolved' && 'success') ||
              (row.status === 'closed' && 'default') ||
              'default'
            }
          >
            {row.status.replace('_', ' ')}
          </Label>
        </TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap' }}>
          {new Date(row.createdDate).toLocaleDateString()}
        </TableCell>

        <TableCell>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Tooltip title="View" placement="top" arrow>
              <IconButton color="default" onClick={() => handleDetail(row)}>
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
