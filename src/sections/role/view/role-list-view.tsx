'use client';

import type { TableHeadCellProps } from 'src/components/table';
import type { IRole, IRoleTableFilters } from 'src/types/role';

import { useState, useCallback, useEffect } from 'react';
import { varAlpha } from 'minimal-shared/utils';
import { useBoolean, useSetState } from 'minimal-shared/hooks';
import { usePopover } from 'minimal-shared/hooks';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import TableBody from '@mui/material/TableBody';
import IconButton from '@mui/material/IconButton';
import { MenuItem, MenuList } from '@mui/material';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';
import { RouterLink } from 'src/routes/components';

import { DashboardContent } from 'src/layouts/dashboard';

import { Label } from 'src/components/label';
import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { LoadingScreen } from 'src/components/loading-screen';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { CustomPopover } from 'src/components/custom-popover';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import {
  useTable,
  emptyRows,
  TableNoData,
  TableEmptyRows,
  TableHeadCustom,
  TableSelectedAction,
  TablePaginationCustom,
} from 'src/components/table';

import { RoleService } from 'src/services/role.service';

import { RoleTableRow } from '../role-table-row';
import { RoleSearch } from '../role-search';
import { RoleFilters } from '../role-filters';
import { RoleTableFiltersResult } from '../role-table-filters-result';

// ----------------------------------------------------------------------

const TABLE_HEAD: TableHeadCellProps[] = [
  { id: 'name', label: 'Role' },
  { id: 'permissions', label: 'Permissions', width: 300 },
  { id: 'status', label: 'Status', width: 100 },
  { id: 'createdAt', label: 'Created', width: 140 },
  { id: 'createdBy', label: 'Created By', width: 140 },
  { id: '', width: 88 },
];


// ----------------------------------------------------------------------

export function RoleListView() {
  const table = useTable();
  const router = useRouter();
  const confirmDialog = useBoolean();
  const openFilters = useBoolean();
  const menuActions = usePopover();

  const [tableData, setTableData] = useState<IRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  const filters = useSetState<IRoleTableFilters>({
    name: '',
    status: 'all',
    startDate: null,
    endDate: null,
  });
  const { state: currentFilters, setState: updateFilters } = filters;

  const canReset =
    !!currentFilters.name ||
    currentFilters.status !== 'all' ||
    !!currentFilters.startDate ||
    !!currentFilters.endDate;

  const notFound = (!tableData.length && canReset) || (!tableData.length && !loading);

  const fetchRoles = useCallback(async () => {
    try {
      setLoading(true);
      const response = await RoleService.getRoles({
        page: table.page + 1,
        limit: table.rowsPerPage,
        search: currentFilters.name,
        startDate: currentFilters.startDate?.toISOString(),
        endDate: currentFilters.endDate?.toISOString(),
      });

      console.log('API Response:', response); // Debug log

      // Handle your API response format: {responseStatus, responseMessage, data: {data: [], pagination: {}}}
      if (response && response.responseStatus === 200) {
        const roles = response.data?.data || [];
        const total = response.data?.pagination?.total || roles.length;
        
        // Map the API response to match frontend interface
        const mappedRoles = roles.map((role: any) => ({
          id: role.id,
          name: role.name,
          description: role.description,
          permissions: role.permissions || [],
          userCount: role.Count?.users || 0,
          createdAt: role.createdDate,
          updatedAt: role.updatedDate,
          createdBy: role.createdBy,
          updatedBy: role.updatedBy,
        }));
        
        setTableData(mappedRoles);
        setTotalCount(total);
      } else if (response && Array.isArray(response)) {
        // Handle direct array response
        setTableData(response);
        setTotalCount(response.length);
      } else {
        const errorMessage = response?.responseMessage || 'Failed to fetch roles - unexpected response format';
        toast.error(errorMessage);
        console.error('Unexpected response format:', response);
      }
    } catch (error) {
      console.error('Error fetching roles:', error);
      toast.error(`Failed to fetch roles: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  }, [
    table.page,
    table.rowsPerPage,
    currentFilters.name,
    currentFilters.status,
    currentFilters.startDate,
    currentFilters.endDate,
  ]);

  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

  const handleDeleteRow = useCallback(
    async (id: string) => {
      try {
        const response = await RoleService.deleteRole(id);
        if (response.responseStatus === 200) {
          toast.success('Role deleted successfully!');
          fetchRoles();
        } else {
          toast.error(response.responseMessage || 'Failed to delete role');
        }
      } catch (error) {
        console.error('Error deleting role:', error);
        toast.error('Failed to delete role');
      }
    },
    [table, fetchRoles]
  );

  const handleDeleteRows = useCallback(async () => {
    try {
      const deletePromises = table.selected.map((id) => RoleService.deleteRole(id));
      await Promise.all(deletePromises);
      
      toast.success('Roles deleted successfully!');
      fetchRoles();
      table.onSelectAllRows(false, []);
    } catch (error) {
      console.error('Error deleting roles:', error);
      toast.error('Failed to delete roles');
    }
  }, [table, fetchRoles]);

  const handleEditRow = useCallback((id: string) => {
    router.push(paths.dashboard.roles.edit(id));
  }, [router]);

  const handleCreateRole = useCallback(() => {
    router.push(paths.dashboard.roles.new);
  }, [router]);


  const handleExportRoles = useCallback(async () => {
    try {
      // Build export parameters based on current filters
      const params: any = {};

      if (currentFilters.name) {
        params.search = currentFilters.name;
      }

      if (currentFilters.status !== 'all') {
        params.status = currentFilters.status;
      }

      if (currentFilters.startDate) {
        params.startDate = currentFilters.startDate.toISOString();
      }
      if (currentFilters.endDate) {
        params.endDate = currentFilters.endDate.toISOString();
      }

      const blob = await RoleService.exportRoles(params);
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `roles_export_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success('Roles exported successfully!');
      menuActions.onClose();
    } catch (error) {
      console.error('Error exporting roles:', error);
      toast.error('Failed to export roles');
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
        <MenuItem onClick={handleExportRoles}>
          <Iconify icon="solar:export-bold" />
          Export Excel
        </MenuItem>
      </MenuList>
    </CustomPopover>
  );

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
          heading="Roles"
          links={[
            { name: 'Administration Panel' },
            { name: 'Roles' },
          ]}
          action={
            <Button
              variant="contained"
              startIcon={<Iconify icon="mingcute:add-line" />}
              onClick={handleCreateRole}
            >
              New Role
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
            <RoleSearch filters={filters} onResetPage={table.onResetPage} />

            <RoleFilters
              filters={filters}
              canReset={canReset}
              open={openFilters.value}
              onOpen={openFilters.onTrue}
              onClose={openFilters.onFalse}
            />
            <IconButton onClick={menuActions.onOpen}>
              <Iconify icon="eva:more-vertical-fill" />
            </IconButton>
          </Box>

          {canReset && (
            <RoleTableFiltersResult
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
              onSelectAllRows={(checked) =>
                table.onSelectAllRows(
                  checked,
                  tableData.map((row) => row.id)
                )
              }
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
                  onSelectAllRows={(checked) =>
                    table.onSelectAllRows(
                      checked,
                      tableData.map((row) => row.id)
                    )
                  }
                />

                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={TABLE_HEAD.length} align="center" sx={{ py: 10 }}>
                        <LoadingScreen />
                      </TableCell>
                    </TableRow>
                  ) : (
                    <>
                      {tableData.map((row) => (
                        <RoleTableRow
                          key={row.id}
                          row={row}
                          selected={table.selected.includes(row.id)}
                          onSelectRow={() => table.onSelectRow(row.id)}
                          onDeleteRow={() => handleDeleteRow(row.id)}
                          onEditRow={() => handleEditRow(row.id)}
                        />
                      ))}

                      <TableEmptyRows
                        height={table.dense ? 56 : 56 + 20}
                        emptyRows={emptyRows(table.page, table.rowsPerPage, totalCount)}
                      />

                      <TableNoData notFound={notFound && !loading} />
                    </>
                  )}
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
