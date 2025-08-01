import type { IContact } from 'src/types/contact';
import { CONTACT_STATUS_MAPPING } from 'src/types/contact';

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

import { fDate, fTime } from 'src/utils/format-time';
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
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {`${row.firstName} ${row.lastName}`}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {row.email}
            </Typography>
          </Box>
        </TableCell>

        <TableCell>
          <Label
            variant="soft"
            color={
              (row.status === 'new' && 'success') ||
              (row.status === 'read' && 'info') ||
              (row.status === 'unread' && 'warning') ||
              'default'
            }
          >
            {CONTACT_STATUS_MAPPING[row.status] || row.status.replace('_', ' ')}
          </Label>
        </TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap' }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            {(() => {
              const dateValue = row.updatedDate || row.createdDate;
              if (!dateValue) return <Box>-</Box>;
              
              // Handle different date formats
              let date: Date;
              
              // Check if it's in DD/MM/YYYY HH:mm:ss format (like locations)
              if (typeof dateValue === 'string' && dateValue.includes('/')) {
                const [datePart, timePart] = dateValue.split(' ');
                const [day, month, year] = datePart.split('/');
                const [hour, minute, second] = timePart?.split(':') || ['00', '00', '00'];
                
                // Create date with format: YYYY-MM-DD HH:mm:ss
                date = new Date(`${year}-${month}-${day} ${hour}:${minute}:${second}`);
              } else {
                // Handle ISO format or other standard formats
                date = new Date(dateValue);
              }
              
              if (isNaN(date.getTime())) return <Box>-</Box>;
              
              return (
                <>
                  <Box sx={{ fontSize: '0.875rem', fontWeight: 500 }}>
                    {fDate(date)}
                  </Box>
                  <Box sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>
                    {fTime(date)}
                  </Box>
                </>
              );
            })()}
          </Box>
        </TableCell>

        <TableCell>
          <Tooltip title="View" placement="top" arrow>
            <IconButton color="default" onClick={() => handleDetail(row)}>
              <Iconify icon="solar:eye-bold" />
            </IconButton>
          </Tooltip>
        </TableCell>
      </TableRow>

      {renderMenuActions()}
      {renderConfirmDialog()}
    </>
  );
}
