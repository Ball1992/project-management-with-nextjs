'use client';

import type { TableHeadCellProps } from 'src/components/table';
import { useState, useCallback, useEffect } from 'react';
import { useBoolean, useSetState } from 'minimal-shared/hooks';
import { usePopover } from 'minimal-shared/hooks';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import { Card, IconButton, MenuItem, MenuList, Table, TableBody, Tooltip } from '@mui/material';

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

import { penthouseService } from 'src/services/penthouse.service';
import type { IPenthouse } from 'src/types/penthouse';

import { ListingSearch } from 'src/sections/listings/listing-search';
import { ListingFilters } from 'src/sections/listings/listing-filters';
import { ListingTableRow } from 'src/sections/listings/listing-table-row';
import { ListingTableFiltersResult } from 'src/sections/listings/listing-table-filters-result';

// ----------------------------------------------------------------------

const TABLE_HEAD: TableHeadCellProps[] = [
  { id: 'title', label: 'Property' },
  { id: 'location', label: 'Location' },
  { id: 'propertyType', label: 'Property Type' },
  { id: 'propertyPrice', label: 'Price (THB)', width: 140 },
  { id: 'status', label: 'Status', width: 100 },
  { id: 'createdDate', label: 'Date', width: 180 },
  { id: '', label: 'Manage', width: 90 },
];

interface IListingTableFilters {
  name: string;
  status: string;
  location: string;
  propertyType: string;
  startDate: Date | null;
  endDate: Date | null;
}

export function ListingsListView() {
  const table = useTable();
  const openFilters = useBoolean();
  const confirmDialog = useBoolean();
  const menuActions = usePopover();

  const filters = useSetState<IListingTableFilters>({
    name: '',
    status: 'all',
    location: 'all',
    propertyType: 'all',
    startDate: null,
    endDate: null,
  });
  const { state: currentFilters, setState: updateFilters } = filters;

  const [tableData, setTableData] = useState<IPenthouse[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    const fetchListings = async () => {
      try {
        setLoading(true);

        const params: any = {
          page: table.page + 1,
          limit: table.rowsPerPage,
        };

        if (currentFilters.name) {
          params.search = currentFilters.name;
        }

        if (currentFilters.status !== 'all') {
          params.status = currentFilters.status;
        }

        if (currentFilters.location !== 'all') {
          params.location = currentFilters.location;
        }

        if (currentFilters.propertyType !== 'all') {
          params.propertyType = currentFilters.propertyType;
        }

        if (currentFilters.startDate) {
          params.startDate = currentFilters.startDate.toISOString();
        }
        if (currentFilters.endDate) {
          params.endDate = currentFilters.endDate.toISOString();
        }

        const response = await penthouseService.getPenthouses(params);

        setTableData(response.data);
        setTotalCount(response.total || response.data.length);
      } catch (error) {
        console.error('Error fetching listings:', error);
        toast.error('Failed to load listings');
      } finally {
        setLoading(false);
      }
    };

    fetchListings();
  }, [
    table.page,
    table.rowsPerPage,
    currentFilters.name,
    currentFilters.status,
    currentFilters.location,
    currentFilters.propertyType,
    currentFilters.startDate,
    currentFilters.endDate,
  ]);

  const canReset =
    !!currentFilters.name ||
    currentFilters.status !== 'all' ||
    currentFilters.location !== 'all' ||
    currentFilters.propertyType !== 'all' ||
    !!currentFilters.startDate ||
    !!currentFilters.endDate;

  const notFound = (!tableData.length && canReset) || !tableData.length;

  const handleDeleteRow = useCallback(
    async (id: string) => {
      try {
        await penthouseService.deletePenthouse(id);
        const deleteRow = tableData.filter((row) => row.id !== id);
        setTableData(deleteRow);
        table.onUpdatePageDeleteRow(tableData.length);
        toast.success('Delete success!');
      } catch (error) {
        toast.error('Failed to delete listing');
      }
    },
    [table, tableData]
  );

  const handleDeleteRows = useCallback(async () => {
    try {
      await Promise.all(table.selected.map((id) => penthouseService.deletePenthouse(id)));
      const deleteRows = tableData.filter((row) => !table.selected.includes(row.id));
      setTableData(deleteRows);
      table.onUpdatePageDeleteRows(tableData.length, tableData.length);
      toast.success('Delete success!');
    } catch (error) {
      toast.error('Failed to delete listings');
    }
  }, [table, tableData]);

  const handleExportListings = useCallback(async () => {
    try {
      // Build export parameters based on current filters
      const params: any = {};

      if (currentFilters.name) {
        params.search = currentFilters.name;
      }

      if (currentFilters.status !== 'all') {
        params.status = currentFilters.status;
      }

      if (currentFilters.location !== 'all') {
        params.location = currentFilters.location;
      }

      if (currentFilters.propertyType !== 'all') {
        params.propertyType = currentFilters.propertyType;
      }

      if (currentFilters.startDate) {
        params.startDate = currentFilters.startDate.toISOString();
      }
      if (currentFilters.endDate) {
        params.endDate = currentFilters.endDate.toISOString();
      }

      const blob = await penthouseService.exportListings(params);
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `listings_export_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success('Listings exported successfully!');
      menuActions.onClose();
    } catch (error) {
      console.error('Error exporting listings:', error);
      toast.error('Failed to export listings');
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
        <MenuItem onClick={handleExportListings}>
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
          heading="Property Listings"
          links={[
            { name: 'Dashboard', href: paths.dashboard.root },
            { name: 'Property Listings' },
          ]}
          action={
            <Button
              component={RouterLink}
              href="/menu/our-penthouses/listings/new"
              variant="contained"
              startIcon={<Iconify icon="mingcute:add-line" />}
            >
              New Listing
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
            <ListingSearch filters={filters} onResetPage={table.onResetPage} />

            <ListingFilters
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
            <ListingTableFiltersResult
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
                    <ListingTableRow
                      key={row.id}
                      row={row}
                      selected={table.selected.includes(row.id)}
                      onSelectRow={() => table.onSelectRow(row.id)}
                      onDeleteRow={() => handleDeleteRow(row.id)}
                      editHref={`/menu/our-penthouses/listings/${row.id}`}
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
