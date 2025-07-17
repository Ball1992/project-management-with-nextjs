'use client';

import type { TableHeadCellProps } from 'src/components/table';
import type { IMenu, IMenuTableFilters } from 'src/types/menu';

import { useState, useCallback, useEffect } from 'react';
import { varAlpha } from 'minimal-shared/utils';
import { useBoolean, useSetState } from 'minimal-shared/hooks';
import { usePopover } from 'minimal-shared/hooks';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import TableBody from '@mui/material/TableBody';
import IconButton from '@mui/material/IconButton';
import { MenuItem, MenuList } from '@mui/material';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import { DashboardContent } from 'src/layouts/dashboard';

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
  TableNoData,
  TableEmptyRows,
  TableHeadCustom,
  TableSelectedAction,
  TablePaginationCustom,
} from 'src/components/table';

import { MenuService } from 'src/services/menu.service';

import { MenuTableRow } from '../menu-table-row';
import { MenuSearch } from '../menu-search';
import { MenuFilters } from '../menu-filters';
import { MenuTableFiltersResult } from '../menu-table-filters-result';

// ----------------------------------------------------------------------

const TABLE_HEAD: TableHeadCellProps[] = [
  { id: 'name', label: 'Name' },
  { id: 'slug', label: 'Slug' },
  { id: 'url', label: 'URL' },
  { id: 'parent', label: 'Parent', width: 120 },
  { id: 'sort_order', label: 'Order', width: 100 },
  { id: 'is_active', label: 'Status', width: 100 },
  { id: '', width: 88 },
];

// ----------------------------------------------------------------------

export function MenuListView() {
  const table = useTable();
  const confirmDialog = useBoolean();
  const openFilters = useBoolean();
  const menuActions = usePopover();

  const [tableData, setTableData] = useState<IMenu[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  const filters = useSetState<IMenuTableFilters>({
    name: '',
    isActive: 'all',
    parentId: '',
    startDate: null,
    endDate: null,
  });
  const { state: currentFilters, setState: updateFilters } = filters;

  const canReset =
    !!currentFilters.name ||
    currentFilters.isActive !== 'all' ||
    !!currentFilters.parentId ||
    !!currentFilters.startDate ||
    !!currentFilters.endDate;

  const notFound = !tableData.length && canReset;

  const fetchMenus = useCallback(async () => {
    try {
      setLoading(true);
      const response = await MenuService.getMenus({
        page: table.page + 1,
        limit: table.rowsPerPage,
        search: currentFilters.name,
        parentId: currentFilters.parentId,
        startDate: currentFilters.startDate?.toISOString(),
        endDate: currentFilters.endDate?.toISOString(),
      });

      setTableData(response.data.menus);
      setTotalCount(response.data.pagination.total);
    } catch (error) {
      console.error('Error fetching menus:', error);
      toast.error('Failed to fetch menus');
    } finally {
      setLoading(false);
    }
  }, [
    table.page,
    table.rowsPerPage,
    currentFilters.name,
    currentFilters.isActive,
    currentFilters.parentId,
    currentFilters.startDate,
    currentFilters.endDate,
  ]);

  useEffect(() => {
    fetchMenus();
  }, [fetchMenus]);

  const handleDeleteRow = useCallback(
    async (id: string) => {
      try {
        await MenuService.deleteMenu(id);
        toast.success('Menu deleted successfully!');
        fetchMenus();
        table.onUpdatePageDeleteRow(tableData.length);
      } catch (error) {
        console.error('Error deleting menu:', error);
        toast.error('Failed to delete menu');
      }
    },
    [table, fetchMenus, tableData.length]
  );

  const handleDeleteRows = useCallback(async () => {
    try {
      const deletePromises = table.selected.map((id) => MenuService.deleteMenu(id));
      await Promise.all(deletePromises);
      
      toast.success('Menus deleted successfully!');
      fetchMenus();
      table.onUpdatePageDeleteRows(tableData.length, tableData.length);
    } catch (error) {
      console.error('Error deleting menus:', error);
      toast.error('Failed to delete menus');
    }
  }, [table, fetchMenus, tableData.length]);

  const handleEditRow = useCallback((id: string) => {
    // Navigate to edit page - will implement later
    console.log('Edit menu:', id);
  }, []);

  const handleExportMenus = useCallback(async () => {
    try {
      // Build export parameters based on current filters
      const params: any = {};

      if (currentFilters.name) {
        params.search = currentFilters.name;
      }

      if (currentFilters.isActive !== 'all') {
        params.isActive = currentFilters.isActive === 'active';
      }

      if (currentFilters.parentId) {
        params.parentId = currentFilters.parentId;
      }

      if (currentFilters.startDate) {
        params.startDate = currentFilters.startDate.toISOString();
      }
      if (currentFilters.endDate) {
        params.endDate = currentFilters.endDate.toISOString();
      }

      const blob = await MenuService.exportMenus(params);
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `menus_export_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success('Menus exported successfully!');
      menuActions.onClose();
    } catch (error) {
      console.error('Error exporting menus:', error);
      toast.error('Failed to export menus');
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
        <MenuItem onClick={handleExportMenus}>
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
          heading="Menu Management"
          links={[
            { name: 'Dashboard', href: paths.dashboard.root },
            { name: 'Menu Management' },
          ]}
          action={
            <Button
              variant="contained"
              startIcon={<Iconify icon="mingcute:add-line" />}
              onClick={() => {
                // Navigate to create page - will implement later
                console.log('Create new menu');
              }}
            >
              New Menu
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
            <MenuSearch filters={filters} onResetPage={table.onResetPage} />

            <MenuFilters
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
            <MenuTableFiltersResult
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
                  {tableData.map((row) => (
                      <MenuTableRow
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
