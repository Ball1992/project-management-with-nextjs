'use client';

import type {
  TableHeadCellProps
} from 'src/components/table';

import { useState, useCallback, useEffect } from 'react';
import { varAlpha } from 'minimal-shared/utils';
import { usePopover } from 'minimal-shared/hooks';
import { useBoolean, useSetState } from 'minimal-shared/hooks';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import { Card, IconButton, MenuItem, MenuList, Paper, Table, TableBody, Tooltip } from '@mui/material';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import { DashboardContent } from 'src/layouts/dashboard';
import {
  _jobs,
  JOB_BENEFIT_OPTIONS,
  JOB_EXPERIENCE_OPTIONS,
  JOB_EMPLOYMENT_TYPE_OPTIONS,
  USER_STATUS_OPTIONS,
} from 'src/_mock';

import { Label } from 'src/components/label';
import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { CustomPopover } from 'src/components/custom-popover';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import {
  useTable,
  emptyRows,
  rowInPage,
  TableNoData,
  getComparator,
  TableEmptyRows,
  TableHeadCustom,
  TableSelectedAction,
  TablePaginationCustom
} from 'src/components/table';

import { IUser, IUserTableFilters } from 'src/types/user';
import UserService from 'src/services/user.service';
import RoleService from 'src/services/role.service';

import { UserSearch } from '../user-search';
import { UserFilters } from '../user-filters';
import { UserTableRow } from '../user-table-row';
import { UserTableFiltersResult } from '../user-table-filters-result';


// ----------------------------------------------------------------------

export function UserListView() {
  const table = useTable();
  const openFilters = useBoolean();
  const menuActions = usePopover();
  const confirmDialog = useBoolean();

  const [sortBy, setSortBy] = useState('latest');

  const TABLE_HEAD: TableHeadCellProps[] = [
    { id: 'name', label: 'User' },
    { id: 'status', label: 'Status', width: 100 },
    { id: 'updateDate', label: 'Date', width: 180 },
    { id: '', label: 'Manage', width: 90 },
  ];

  const STATUS_OPTIONS = [{ value: 'all', label: 'All' }, ...USER_STATUS_OPTIONS];

  const filters = useSetState<IUserTableFilters>({
    name: '',
    roles: [],
    locations: [],
    benefits: [],
    experience: 'all',
    employmentTypes: [],
    status: 'all',
    statusTypes: [],
    startDate: null,
    endDate: null,
  });
  const { state: currentFilters, setState: updateFilters } = filters;

  const [tableData, setTableData] = useState<IUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [roles, setRoles] = useState<string[]>([]);

  // Fetch roles from API
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const response = await RoleService.getRoles();
        if (response.responseStatus === 200) {
          setRoles(response.data.data.map(role => role.name));
        }
      } catch (error) {
        console.error('Error fetching roles:', error);
      }
    };

    fetchRoles();
  }, []);

  // Fetch users from API
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        
        // Build API parameters based on filters
        const params: any = {
          page: table.page + 1, // API uses 1-based pagination
          limit: table.rowsPerPage,
        };

        // Add search parameter
        if (currentFilters.name) {
          params.search = currentFilters.name;
        }

        // Add status filter
        if (currentFilters.status !== 'all') {
          params.isActive = currentFilters.status === 'enable';
        }

        // Add role filter
        if (currentFilters.roles.length > 0) {
          params.role = currentFilters.roles.join(',');
        }

        if (currentFilters.startDate) {
          params.startDate = currentFilters.startDate.toISOString();
        }
        if (currentFilters.endDate) {
          params.endDate = currentFilters.endDate.toISOString();
        }

        const response = await UserService.getUsers(params);
        
        if (response.responseStatus === 200) {
          setTableData(response.data.data);
          setTotalCount(response.data.pagination.total);
        }
      } catch (error) {
        console.error('Error fetching users:', error);
        toast.error('Failed to load users');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [
    table.page,
    table.rowsPerPage,
    currentFilters.name,
    currentFilters.status,
    currentFilters.roles,
    currentFilters.startDate,
    currentFilters.endDate,
  ]);

  const canReset =
    !!currentFilters.name ||
    currentFilters.roles.length > 0 ||
    currentFilters.status !== 'all' ||
    !!currentFilters.startDate ||
    !!currentFilters.endDate;

  const notFound = (!tableData.length && canReset) || !tableData.length;

  const handleExportUsers = useCallback(async () => {
    try {
      // Build export parameters based on current filters
      const params: any = {};

      // Add search parameter
      if (currentFilters.name) {
        params.search = currentFilters.name;
      }

      // Add status filter
      if (currentFilters.status !== 'all') {
        params.isActive = currentFilters.status === 'enable';
      }

      // Add role filter
      if (currentFilters.roles.length > 0) {
        params.role = currentFilters.roles.join(',');
      }

      const blob = await UserService.exportUsers(params);
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `users_export_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success('Users exported successfully!');
      menuActions.onClose();
    } catch (error) {
      console.error('Error exporting users:', error);
      toast.error('Failed to export users');
    }
  }, [currentFilters, menuActions]);

  const renderMenuActions = () => (
    <CustomPopover
      open={menuActions.open}
      anchorEl={menuActions.anchorEl}
      onClose={menuActions.onClose}
      slotProps={{ arrow: { placement: 'right-top' } }}
    >
      <MenuList>
        <MenuItem onClick={handleExportUsers}>
          <Iconify icon="solar:export-bold" />
          Export Excel
        </MenuItem>
      </MenuList>
    </CustomPopover>
  );

  const handleDeleteRow = useCallback(
    (id: string) => {
      const deleteRow = tableData.filter((row) => row.id !== id);

      toast.success('Delete success!');

      setTableData(deleteRow);

      table.onUpdatePageDeleteRow(tableData.length);
    },
    [table, tableData]
  );

  const handleDeleteRows = useCallback(() => {
    const deleteRows = tableData.filter((row) => !table.selected.includes(row.id));

    toast.success('Delete success!');

    setTableData(deleteRows);

    table.onUpdatePageDeleteRows(tableData.length, tableData.length);
  }, [table, tableData]);


  const renderConfirmDialog = () => (
    <ConfirmDialog
      open={confirmDialog.value}
      onClose={confirmDialog.onFalse}
      title="Delete"
      content={
        <>
          Are you sure want to delete <strong> {table.selected.length} </strong> items?
        </>
      }
      action={
        <Button
          variant="contained"
          color="error"
          onClick={() => {
            handleDeleteRows();
            confirmDialog.onFalse();
          }}
        >
          Delete
        </Button>
      }
    />
  );

  return (
    <>
      <DashboardContent>
        <CustomBreadcrumbs
          heading="User Management"
          links={[
            { name: 'Dashboard', href: paths.dashboard.root },
            // { name: 'User Management', href: paths.dashboard.user.root },
            { name: 'User Management' },
          ]}
          action={
            <Button
              component={RouterLink}
              href={paths.dashboard.user.new}
              variant="contained"
              startIcon={<Iconify icon="mingcute:add-line" />}
            >
              New user
            </Button>
          }
          sx={{ mb: { xs: 3, md: 5 } }}
        />
        <Card>
          <Box
            sx={{
              p: 2.5,
              gap: 2,
              display: 'flex',
              pr: { xs: 2.5, md: 1 },
              flexDirection: { xs: 'column', md: 'row' },
              alignItems: { xs: 'flex-end', md: 'center' },
            }}
          >
            <UserSearch
              filters={filters}
              onResetPage={table.onResetPage}
              options={{ roles }}
              redirectPath={(id: string) => paths.dashboard.user.detail(id)}
            />

            <UserFilters
              filters={filters}
              canReset={canReset}
              open={openFilters.value}
              onOpen={openFilters.onTrue}
              onClose={openFilters.onFalse}
              options={{
                roles,
                statusTypes: USER_STATUS_OPTIONS.map((option) => option.label),
                benefits: JOB_BENEFIT_OPTIONS.map((option) => option.label),
                employmentTypes: JOB_EMPLOYMENT_TYPE_OPTIONS.map((option) => option.label),
                experiences: ['all', ...JOB_EXPERIENCE_OPTIONS.map((option) => option.label)],
              }}
            />
            <IconButton onClick={menuActions.onOpen}>
              <Iconify icon="eva:more-vertical-fill" />
            </IconButton>
          </Box>

          {canReset && (
            <UserTableFiltersResult
              filters={filters}
              totalResults={totalCount}
              onResetPage={table.onResetPage}
              sx={{ p: 2.5, pt: 0 }}
            />
          )}

          <Box sx={{ position: 'relative' }}>
            <TableSelectedAction
              dense={table.dense}
              numSelected={table.selected.length}
              rowCount={tableData.length}
              onSelectAllRows={(checked) => table.onSelectAllRows(
                checked,
                tableData.map((row) => row.id)
              )}
              action={
                <Tooltip title="Delete">
                  <IconButton color="primary" onClick={confirmDialog.onTrue}>
                    <Iconify icon="solar:trash-bin-trash-bold" />
                  </IconButton>
                </Tooltip>
              }
            />

            <Scrollbar>
              <Table size={table.dense ? 'small' : 'medium'} sx={{ minWidth: 960 }}>
                <TableHeadCustom
                  order={table.order}
                  orderBy={table.orderBy}
                  headCells={TABLE_HEAD}
                  rowCount={tableData.length}
                  numSelected={table.selected.length}
                  onSort={table.onSort}
                  onSelectAllRows={(checked) => table.onSelectAllRows(
                    checked,
                    tableData.map((row) => row.id)
                  )}
                />

                <TableBody>
                  {tableData.map((row) => (
                    <UserTableRow
                      key={row.id}
                      row={row}
                      selected={table.selected.includes(row.id)}
                      onSelectRow={() => table.onSelectRow(row.id)}
                      onDeleteRow={() => handleDeleteRow(row.id)}
                      editHref={paths.dashboard.user.edit(row.id)}
                    />
                  ))}

                  <TableEmptyRows
                    height={table.dense ? 56 : 56 + 20}
                    emptyRows={emptyRows(table.page, table.rowsPerPage, tableData.length)}
                  />

                  <TableNoData notFound={notFound} />
                </TableBody>
              </Table>
            </Scrollbar>
          </Box>

          <TablePaginationCustom
            page={table.page}
            dense={table.dense}
            count={totalCount}
            rowsPerPage={table.rowsPerPage}
            onPageChange={table.onChangePage}
            onChangeDense={table.onChangeDense}
            onRowsPerPageChange={table.onChangeRowsPerPage}
          />
        </Card>
      </DashboardContent>
      {renderMenuActions()}
      {renderConfirmDialog()}
    </>
  );
}

// ----------------------------------------------------------------------

type ApplyFilterProps = {
  inputData: IUser[];
  filters: IUserTableFilters;
  comparator: (a: any, b: any) => number;
};

function applyFilter({ inputData, comparator, filters }: ApplyFilterProps) {

  const { name, status, roles, statusTypes } = filters;

  const stabilizedThis = inputData.map((el, index) => [el, index] as const);

  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });

  inputData = stabilizedThis.map((el) => el[0]);

  if (name) {
    inputData = inputData.filter((user) => 
      `${user.firstName} ${user.lastName}`.toLowerCase().includes(name.toLowerCase()) ||
      user.email.toLowerCase().includes(name.toLowerCase()) ||
      user.username.toLowerCase().includes(name.toLowerCase())
    );
  }

  if (status !== 'all') {
    inputData = inputData.filter((user) => 
      status === 'enable' ? user.isActive : !user.isActive
    );
  }

  if (roles.length) {
    inputData = inputData.filter((user) => roles.includes(user.role.name));
  }

  if (statusTypes && statusTypes.length) {
    inputData = inputData.filter((user) => 
      statusTypes.includes(user.isActive ? 'enable' : 'disable')
    );
  }

  return inputData;
}
