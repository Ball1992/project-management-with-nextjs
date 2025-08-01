'use client';

import type { TableHeadCellProps } from 'src/components/table';
import { useState, useCallback, useEffect } from 'react';
import { useBoolean, useSetState } from 'minimal-shared/hooks';
import { usePopover } from 'minimal-shared/hooks';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import { Card, IconButton, MenuItem, MenuList, Table, TableBody, Tooltip, Typography, Stack, Select, FormControl, Chip } from '@mui/material';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import { DashboardContent } from 'src/layouts/dashboard';
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

import { exclusiveNeighborhoodsLocationsService } from 'src/services/exclusive-neighborhoods-locations.service';
import { languageService } from 'src/services/language.service';
import type { IExclusiveNeighborhoodsLocation } from 'src/services/exclusive-neighborhoods-locations.service';
import type { ILanguage } from 'src/types/language';

import { ExclusiveNeighborhoodsLocationsSearch } from '../exclusive-neighborhoods-locations-search';
import { ExclusiveNeighborhoodsLocationsTableRow } from '../exclusive-neighborhoods-locations-table-row';
import { ExclusiveNeighborhoodsLocationsTableFiltersResult } from '../exclusive-neighborhoods-locations-table-filters-result';

// ----------------------------------------------------------------------

const TABLE_HEAD: TableHeadCellProps[] = [
  { id: 'name', label: 'Name' },
  { id: 'isActive', label: 'Status', width: 100 },
  { id: 'date', label: 'Updated', width: 180 },
  { id: '', label: 'Manage', width: 90 },
];

interface IExclusiveNeighborhoodsLocationTableFilters {
  name: string;
  status: string;
  startDate: Date | null;
  endDate: Date | null;
}

export function ExclusiveNeighborhoodsLocationsView() {
  const table = useTable();
  const openFilters = useBoolean();
  const confirmDialog = useBoolean();
  const menuActions = usePopover();

  const filters = useSetState<IExclusiveNeighborhoodsLocationTableFilters>({
    name: '',
    status: 'all',
    startDate: null,
    endDate: null,
  });
  const { state: currentFilters, setState: updateFilters } = filters;

  const [tableData, setTableData] = useState<IExclusiveNeighborhoodsLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  // Get current language from localStorage (set by language-popover)
  const getCurrentLanguage = useCallback(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('selectedLanguageCode') || 'en';
    }
    return 'en';
  }, []);

  const fetchLocations = useCallback(async () => {
    try {
      setLoading(true);
      const currentLang = getCurrentLanguage();

      const params: any = {
        page: table.page + 1,
        limit: table.rowsPerPage,
        lang: currentLang, // Include language parameter
      };

      if (currentFilters.name) {
        params.search = currentFilters.name;
      }

      if (currentFilters.status !== 'all') {
        params.isActive = currentFilters.status === 'enable';
      }

      if (currentFilters.startDate) {
        params.startDate = currentFilters.startDate.toISOString();
      }
      if (currentFilters.endDate) {
        params.endDate = currentFilters.endDate.toISOString();
      }

      const response = await exclusiveNeighborhoodsLocationsService.getLocations(params);

      setTableData(response.data);
      setTotalCount(response.total || response.data.length);
    } catch (error) {
      console.error('Error fetching exclusive neighborhoods locations:', error);
      toast.error('Failed to load locations');
    } finally {
      setLoading(false);
    }
  }, [table.page, table.rowsPerPage, currentFilters, getCurrentLanguage]);

  useEffect(() => {
    fetchLocations();
  }, [fetchLocations]);

  // Listen for language changes in localStorage
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'selectedLanguageCode') {
        console.log('Language changed, refetching exclusive neighborhoods locations...');
        fetchLocations();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [fetchLocations]);

  const canReset =
    !!currentFilters.name ||
    currentFilters.status !== 'all' ||
    !!currentFilters.startDate ||
    !!currentFilters.endDate;

  const notFound = (!tableData.length && canReset) || !tableData.length;

  const handleDeleteRow = useCallback(
    async (id: number) => {
      try {
        await exclusiveNeighborhoodsLocationsService.deleteLocation(id);
        const deleteRow = tableData.filter((row) => row.id !== id);
        setTableData(deleteRow);
        table.onUpdatePageDeleteRow(tableData.length);
        toast.success('Delete success!');
      } catch (error) {
        toast.error('Failed to delete location');
      }
    },
    [table, tableData]
  );

  const handleDeleteRows = useCallback(async () => {
    try {
      await Promise.all(table.selected.map((id) => exclusiveNeighborhoodsLocationsService.deleteLocation(Number(id))));
      const deleteRows = tableData.filter((row) => !table.selected.includes(row.id.toString()));
      setTableData(deleteRows);
      table.onUpdatePageDeleteRows(tableData.length, tableData.length);
      toast.success('Delete success!');
    } catch (error) {
      toast.error('Failed to delete locations');
    }
  }, [table, tableData]);

  const handleExportLocations = useCallback(async () => {
    try {
      // Build export parameters based on current filters
      const params: any = {};
      const currentLang = getCurrentLanguage();

      if (currentLang) {
        params.lang = currentLang;
      }

      if (currentFilters.name) {
        params.search = currentFilters.name;
      }

      if (currentFilters.status !== 'all') {
        params.isActive = currentFilters.status === 'enable';
      }

      if (currentFilters.startDate) {
        params.startDate = currentFilters.startDate.toISOString();
      }
      if (currentFilters.endDate) {
        params.endDate = currentFilters.endDate.toISOString();
      }

      const blob = await exclusiveNeighborhoodsLocationsService.exportLocations(params);
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `exclusive_neighborhoods_locations_export_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success('Locations exported successfully!');
      menuActions.onClose();
    } catch (error) {
      console.error('Error exporting locations:', error);
      toast.error('Failed to export locations');
    }
  }, [currentFilters, menuActions, getCurrentLanguage]);

  const renderMenuActions = () => (
    <CustomPopover
      open={menuActions.open}
      anchorEl={menuActions.anchorEl}
      onClose={menuActions.onClose}
      slotProps={{ arrow: { placement: 'right-top' } }}
    >
      <MenuList>
        <MenuItem onClick={handleExportLocations}>
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
          heading="Locations"
          links={[
            { name: 'Dashboard', href: paths.dashboard.root },
            { name: 'Guide Explore' },
            { name: 'Exclusive Neighborhoods' },
            { name: 'Locations' },
          ]}
          action={
            <Button
              component={RouterLink}
              href="/menu/guide-explore/exclusive-neighborhoods/locations/new"
              variant="contained"
              startIcon={<Iconify icon="mingcute:add-line" />}
            >
              New Location
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
              // pr: { xs: 2.5, md: 1 },
              flexDirection: { xs: 'column', md: 'row' },
              alignItems: { xs: 'flex-end', md: 'center' },
            }}
          >
            <ExclusiveNeighborhoodsLocationsSearch filters={filters} onResetPage={table.onResetPage} />

            {/* <IconButton onClick={menuActions.onOpen}>
              <Iconify icon="eva:more-vertical-fill" />
            </IconButton> */}
          </Box>

          {canReset && (
            <ExclusiveNeighborhoodsLocationsTableFiltersResult
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
                  tableData.map((row) => row.id.toString())
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
                      tableData.map((row) => row.id.toString())
                    )
                  }
                />

                <TableBody>
                  {tableData.map((row) => (
                    <ExclusiveNeighborhoodsLocationsTableRow
                      key={row.id}
                      row={row}
                      selected={table.selected.includes(row.id.toString())}
                      onSelectRow={() => table.onSelectRow(row.id.toString())}
                      onDeleteRow={() => handleDeleteRow(row.id)}
                      editHref={`/menu/guide-explore/exclusive-neighborhoods/locations/${row.id}`}
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
