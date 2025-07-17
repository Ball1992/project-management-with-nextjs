import React from 'react';

import Box from '@mui/material/Box';
import Checkbox from '@mui/material/Checkbox';
import IconButton from '@mui/material/IconButton';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableRow from '@mui/material/TableRow';
import Tooltip from '@mui/material/Tooltip';
import MenuList from '@mui/material/MenuList';
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Link from '@mui/material/Link';
import TableCell from '@mui/material/TableCell';

import { useBoolean } from 'node_modules/minimal-shared/dist/hooks/use-boolean/use-boolean';
import { usePopover } from 'node_modules/minimal-shared/dist/hooks/use-popover/use-popover';
import { Iconify } from 'src/components/iconify';
import { Label } from 'src/components/label';
import { useRouter } from 'src/routes/hooks';
import { paths } from 'src/routes/paths';
import { IUserPermisItem } from 'src/types/user';
import { RoleQuickEditForm } from './role-quick-edit-form';
import { CustomPopover } from 'src/components/custom-popover';
import { RouterLink } from 'src/routes/components';
import { ConfirmDialog } from 'src/components/custom-dialog';

type Props = {
    row: IUserPermisItem;
    selected: boolean;
    editHref: string;
    addHref: string;
    onSelectRow: () => void;
    onDeleteRow: () => void;
};

export function RoleTableRowSub({ row, selected, editHref, addHref, onSelectRow, onDeleteRow }: Props) {
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

    const renderMenuActions = () => (
        <CustomPopover
            open={menuActions.open}
            anchorEl={menuActions.anchorEl}
            onClose={menuActions.onClose}
            slotProps={{ arrow: { placement: 'right-top' } }}
        >
            <MenuList>
                <li>
                    <MenuItem component={RouterLink} href={addHref} onClick={() => menuActions.onClose()}>
                        <Iconify icon="mingcute:add-line" />
                        New
                    </MenuItem>
                </li>
                <li>
                    <MenuItem component={RouterLink} href={editHref} onClick={() => menuActions.onClose()}>
                        <Iconify icon="solar:pen-bold" />
                        Edit
                    </MenuItem>
                </li>

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
            <TableRow hover selected={selected} aria-checked={selected} tabIndex={-1} style={{ backgroundColor: '#f5f5f5' }}>
                <TableCell padding="checkbox" style={{ paddingLeft: 25 }}>
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
                    <Box sx={{ gap: 2, display: 'flex', alignItems: 'center' }}>
                        <Stack sx={{ typography: 'body2', flex: '1 1 auto', alignItems: 'flex-start' }}>
                            <Link
                                component={RouterLink}
                                href={editHref}
                                color="inherit"
                                sx={{ cursor: 'pointer' }}
                            >
                                {row.name}
                            </Link>
                        </Stack>
                    </Box>
                </TableCell>
                <TableCell>
                    <Label
                        variant="soft"
                        color={
                            (row.status === 'enable' && 'success') ||
                            (row.status === 'disable' && 'error') ||
                            'default'
                        }
                    >
                        {row.status}
                    </Label>
                </TableCell>
                <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.updatedDate}</TableCell>
                <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Tooltip title="View" placement="top" arrow>
                            <IconButton
                                color={quickEditForm.value ? 'inherit' : 'default'}
                                onClick={() => { handleDetail(row); }}
                            >
                                <Iconify icon="solar:eye-bold" />
                            </IconButton>
                        </Tooltip>

                        <IconButton
                            color={menuActions.open ? 'inherit' : 'default'}
                            onClick={menuActions.onOpen}
                        >
                            <Iconify icon="eva:more-vertical-fill" />
                        </IconButton>
                    </Box>
                </TableCell>
            </TableRow>

            {renderQuickEditForm()}
            {renderMenuActions()}
            {renderConfirmDialog()}
        </>
    );
}
