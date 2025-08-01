'use client';

import type { TableHeadCellProps } from 'src/components/table';
import { useState, useCallback, useEffect } from 'react';
import { useBoolean, useSetState } from 'minimal-shared/hooks';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import { Card, IconButton, Table, TableBody, Tooltip, Typography, Stack, Select, FormControl, Chip } from '@mui/material';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import { DashboardContent } from 'src/layouts/dashboard';
import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { ConfirmDialog } from 'src/components/custom-dialog';
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

import { zoneService } from 'src/services/zone.service';
import type { IZone } from 'src/types/zone';

import { ZoneSearch } from '../zone-search';
import { ZoneFilters } from '../zone-filters';
import { ZoneTableRow } from '../zone-table-row';
import { ZoneTableFiltersResult } from '../zone-table-filters-result';

// ----------------------------------------------------------------------

const TABLE_HEAD: TableHeadCellProps[] = [
  { id: 'name', label: 'Name' },
  { id: 'isActive', label: 'Status', width: 100 },
  { id: 'date', label: 'Updated', width: 180 },
  { id: '', label: 'Manage', width: 90 },
];

interface IZoneTableFilters {
  name: string;
  status: string;
  startDate: Date | null;
  endDate: Date | null;
}

export function ZonesListView() {
  const table = useTable();
  const openFilters = useBoolean();
  const confirmDialog = useBoolean();

  const filters = useSetState<IZoneTableFilters>({
    name: '',
    status: 'all',
    startDate: null,
    endDate: null,
  });
  const { state: currentFilters, setState: updateFilters } = filters;

  const [tableData, setTableData] = useState<IZone[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  // Get current language from localStorage (set by language-popover)
  const getCurrentLanguage = useCallback(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('selectedLanguageCode') || 'en';
    }
    return 'en';
  }, []);

  const fetchZones = useCallback(async () => {
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

      const response = await zoneService.getZones(params);

      setTableData(response.data);
      setTotalCount(response.total || response.data.length);
    } catch (error) {
      console.error('Error fetching zones:', error);
      toast.error('Failed to load zones');
    } finally {
      setLoading(false);
    }
  }, [table.page, table.rowsPerPage, currentFilters, getCurrentLanguage]);

  useEffect(() => {
    fetchZones();
  }, [fetchZones]);

  // Listen for language changes in localStorage
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'selectedLanguageCode') {
        console.log('Language changed, refetching zones...');
        fetchZones();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [fetchZones]);

  const canReset =
    !!currentFilters.name ||
    currentFilters.status !== 'all' ||
    !!currentFilters.startDate ||
    !!currentFilters.endDate;

  const notFound = (!tableData.length && canReset) || !tableData.length;

  const handleDeleteRow = useCallback(
    async (id: string) => {
      try {
        await zoneService.deleteZone(id);
        const deleteRow = tableData.filter((row) => row.id.toString() !== id);
        setTableData(deleteRow);
        table.onUpdatePageDeleteRow(tableData.length);
        toast.success('Delete success!');
      } catch (error) {
        toast.error('Failed to delete zone');
      }
    },
    [table, tableData]
  );

  const handleDeleteRows = useCallback(async () => {
    try {
      await Promise.all(table.selected.map((id) => zoneService.deleteZone(id)));
      const deleteRows = tableData.filter((row) => !table.selected.includes(row.id.toString()));
      setTableData(deleteRows);
      table.onUpdatePageDeleteRows(tableData.length, tableData.length);
      toast.success('Delete success!');
    } catch (error) {
      toast.error('Failed to delete zones');
    }
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
          heading="Zones"
          links={[
            { name: 'Dashboard', href: paths.dashboard.root },
            { name: 'Our Penthouses' },
            { name: 'Zones' },
          ]}
          action={
            <Button
              component={RouterLink}
              href="/menu/our-penthouses/zones/new"
              variant="contained"
              startIcon={<Iconify icon="mingcute:add-line" />}
            >
              New Zone
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
            <ZoneSearch filters={filters} onResetPage={table.onResetPage} />
          </Box>

          {canReset && (
            <ZoneTableFiltersResult
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
                    <ZoneTableRow
                      key={row.id}
                      row={row}
                      selected={table.selected.includes(row.id.toString())}
                      onSelectRow={() => table.onSelectRow(row.id.toString())}
                      onDeleteRow={() => handleDeleteRow(row.id.toString())}
                      editHref={`/menu/our-penthouses/zones/${row.id}`}
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
      {renderConfirmDialog()}
    </>
  );
}
