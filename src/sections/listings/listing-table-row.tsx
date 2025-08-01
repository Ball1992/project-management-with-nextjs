import type { IPenthouse } from 'src/types/penthouse';

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
import Chip from '@mui/material/Chip';

import { RouterLink } from 'src/routes/components';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { CustomPopover } from 'src/components/custom-popover';

// ----------------------------------------------------------------------

type Props = {
  row: IPenthouse;
  selected: boolean;
  onSelectRow: () => void;
  onDeleteRow: () => void;
  editHref: string;
};

export function ListingTableRow({ row, selected, onSelectRow, onDeleteRow, editHref }: Props) {
  const menuActions = usePopover();
  const confirmDialog = useBoolean();

  // Get selected language from localStorage
  const selectedLanguageCode = localStorage.getItem('selectedLanguageCode');
  
  // Find translation for selected language
  const currentTranslation = selectedLanguageCode 
    ? row.translations?.find((trans) => trans.languageCode === selectedLanguageCode)
    : row.translations?.[0];

  const renderMenuActions = () => (
    <CustomPopover
      open={menuActions.open}
      anchorEl={menuActions.anchorEl}
      onClose={menuActions.onClose}
      slotProps={{ arrow: { placement: 'top-right' } }}
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
          <Typography variant="body2" color="text.secondary">
            {row.listingCode || '-'}
          </Typography>
        </TableCell>

        <TableCell>
          <Box>
            <Link component={RouterLink} href={editHref} color="inherit" sx={{ cursor: 'pointer' }}>
              <Typography variant="subtitle2">
                {row.title || 'Untitled'}
              </Typography>
            </Link>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              {row.location?.name || ''}
            </Typography>
          </Box>
        </TableCell>

        <TableCell>
          <Typography variant="body2" color="text.secondary">
            {row.offerType?.name || ''}
          </Typography>
        </TableCell>

        <TableCell>
          <Typography variant="body2" color="text.secondary">
            {row.propertyType?.name || ''}
          </Typography>
        </TableCell>

        <TableCell>
          <Label
            variant="soft"
            color={
              (row.status === 'published' && 'success') ||
              (row.status === 'draft' && 'info') ||
              (row.status === 'closed' && 'default') ||
              'default'
            }
          >
            {row.status === 'published' ? 'Published' : row.status === 'draft' ? 'Draft' : row.status}
          </Label>
        </TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap' }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            {(() => {
              const dateValue = row.updatedDate || row.createdDate;
              if (!dateValue) return <Box>-</Box>;
              
              // Parse date format: "26/07/2025 14:17:36" (DD/MM/YYYY HH:mm:ss)
              const parseCustomDate = (dateStr: string) => {
                const [datePart, timePart] = dateStr.split(' ');
                const [day, month, year] = datePart.split('/');
                const [hour, minute, second] = timePart.split(':');
                
                // Create date with format: YYYY-MM-DD HH:mm:ss
                return new Date(`${year}-${month}-${day} ${hour}:${minute}:${second}`);
              };
              
              const date = parseCustomDate(dateValue);
              if (isNaN(date.getTime())) return <Box>-</Box>;
              
              return (
                <>
                  <Box sx={{ fontSize: '0.875rem', fontWeight: 500 }}>
                    {date.toLocaleDateString('en-GB', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric'
                    })}
                  </Box>
                  <Box sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>
                    {date.toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit',
                      hour12: true
                    })}
                  </Box>
                </>
              );
            })()}
          </Box>
        </TableCell>

        <TableCell>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Tooltip title="Edit" placement="top" arrow>
              <IconButton component={RouterLink} href={editHref} color="default">
                <Iconify icon="solar:pen-bold" />
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
