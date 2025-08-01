import type { ILanguage } from 'src/types/language';

import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import Tooltip from '@mui/material/Tooltip';
import MenuList from '@mui/material/MenuList';
import TableRow from '@mui/material/TableRow';
import Checkbox from '@mui/material/Checkbox';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';
import MenuItem, { menuItemClasses } from '@mui/material/MenuItem';

import { useBoolean } from 'minimal-shared/hooks';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { usePopover, CustomPopover } from 'src/components/custom-popover';

// ----------------------------------------------------------------------

type Props = {
  row: ILanguage;
  selected: boolean;
  onEditRow: () => void;
  onSelectRow: () => void;
  onDeleteRow: () => void;
  onSetDefault?: () => void;
};

export function InternationalizationTableRow({
  row,
  selected,
  onEditRow,
  onSelectRow,
  onDeleteRow,
  onSetDefault,
}: Props) {
  const confirm = useBoolean();
  const popover = usePopover();

  const renderPrimary = (
    <CustomPopover
      open={popover.open}
      anchorEl={popover.anchorEl}
      onClose={popover.onClose}
      slotProps={{ arrow: { placement: 'right-top' } }}
    >
      <MenuList>
        {!(row.isDefault || row.is_default) && onSetDefault && (
          <MenuItem
            onClick={() => {
              onSetDefault();
              popover.onClose();
            }}
            sx={{ color: 'primary.main' }}
          >
            <Iconify icon="solar:star-bold" />
            Set as Default
          </MenuItem>
        )}

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
      </MenuList>
    </CustomPopover>
  );

  return (
    <>
      <TableRow hover selected={selected}>
        <TableCell padding="checkbox">
          <Checkbox
            checked={selected}
            onClick={onSelectRow}
            inputProps={{ id: `row-checkbox-${row.id}`, 'aria-label': `Row checkbox` }}
          />
        </TableCell>

        <TableCell>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {(row.flagIcon || row.flag_icon) && (
              <Avatar
                alt={row.code}
                src={row.flagIcon || row.flag_icon}
                sx={{ width: 24, height: 24 }}
              />
            )}
            {row.code}
          </div>
        </TableCell>

        <TableCell>{row.name}</TableCell>

        <TableCell>{row.nativeName || row.native_name}</TableCell>

        <TableCell>
          <Label
            variant="soft"
            color={(row.isDefault || row.is_default) ? 'success' : 'default'}
          >
            {(row.isDefault || row.is_default) ? 'Default' : 'Secondary'}
          </Label>
        </TableCell>

        <TableCell>
          <Label
            variant="soft"
            color={(row.isActive !== undefined ? row.isActive : row.is_active) ? 'success' : 'error'}
          >
            {(row.isActive !== undefined ? row.isActive : row.is_active) ? 'Enable' : 'Disable'}
          </Label>
        </TableCell>

        <TableCell align="right" sx={{ px: 1, whiteSpace: 'nowrap' }}>
          <Tooltip title="View" placement="top" arrow>
            <IconButton color="default" onClick={onEditRow}>
              <Iconify icon="solar:eye-bold" />
            </IconButton>
          </Tooltip>

          <IconButton
            color={popover.open ? 'inherit' : 'default'}
            onClick={popover.onOpen}
          >
            <Iconify icon="eva:more-vertical-fill" />
          </IconButton>
        </TableCell>
      </TableRow>

      {renderPrimary}

      <ConfirmDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        title="Delete"
        content="Are you sure want to delete this language?"
        action={
          <Button variant="contained" color="error" onClick={onDeleteRow}>
            Delete
          </Button>
        }
      />
    </>
  );
}
