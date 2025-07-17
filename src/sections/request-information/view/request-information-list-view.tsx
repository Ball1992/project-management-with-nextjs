'use client';

import type { TableHeadCellProps } from 'src/components/table';
import type { IRequestInformation } from 'src/types/request-information';

import { useState, useCallback, useEffect } from 'react';
import { useBoolean, useSetState } from 'minimal-shared/hooks';
import { usePopover } from 'minimal-shared/hooks';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import { Card, IconButton, MenuItem, MenuList, Table, TableBody, Tooltip } from '@mui/material';

import { paths } from 'src/routes/paths';

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

import { requestInformationService } from 'src/services/request-information.service';

import { RequestInformationSearch } from '../request-information-search';
import { RequestInformationFilters } from '../request-information-filters';
import { RequestInformationTableRow } from '../request-information-table-row';
import { RequestInformationTableFiltersResult } from '../request-information-table-filters-result';

// ----------------------------------------------------------------------

const TABLE_HEAD: TableHeadCellProps[] = [
  { id: 'name', label: 'Name' },
  { id: 'email', label: 'Email' },
  { id: 'message', label: 'Message' },
  { id: 'status', label: 'Status', width: 120 },
  { id: 'createdDate', label: 'Date', width: 180 },
  { id: '', label: 'Manage', width: 90 },
];

interface IRequestInformationTableFilters {
  name: string;
  status: string;
  startDate: Date | null;
  endDate: Date | null;
}

export function RequestInformationListView() {
  const table = useTable();
  const openFilters = useBoolean();
  const confirmDialog = useBoolean();
  const menuActions = usePopover();

  const filters = useSetState<IRequestInformationTableFilters>({
    name: '',
    status: 'all',
    startDate: null,
    endDate: null,
  });
  const { state: currentFilters, setState: updateFilters } = filters;

  const [tableData, setTableData] = useState<IRequestInformation[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    const fetchRequestInformation = async () => {
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

        if (currentFilters.startDate) {
          params.startDate = currentFilters.startDate.toISOString();
        }
        if (currentFilters.endDate) {
          params.endDate = currentFilters.endDate.toISOString();
        }

        const response = await requestInformationService.getRequestInformation(params);

        setTableData(response.data);
        setTotalCount(response.total || response.data.length);
      } catch (error) {
        console.error('Error fetching request information:', error);
        toast.error('Failed to load request information');
      } finally {
        setLoading(false);
      }
    };

    fetchRequestInformation();
  }, [
    table.page,
    table.rowsPerPage,
    currentFilters.name,
    currentFilters.status,
    currentFilters.startDate,
    currentFilters.endDate,
  ]);

  const canReset =
    !!currentFilters.name ||
    currentFilters.status !== 'all' ||
    !!currentFilters.startDate ||
    !!currentFilters.endDate;

  const notFound = (!tableData.length && canReset) || !tableData.length;

  const handleDeleteRow = useCallback(
    async (id: string) => {
      try {
        await requestInformationService.deleteRequestInformation(id);
        const deleteRow = tableData.filter((row) => row.id !== id);
        setTableData(deleteRow);
        table.onUpdatePageDeleteRow(tableData.length);
        toast.success('Delete success!');
      } catch (error) {
        toast.error('Failed to delete request information');
      }
    },
    [table, tableData]
  );

  const handleDeleteRows = useCallback(async () => {
    try {
      await Promise.all(table.selected.map((id) => requestInformationService.deleteRequestInformation(id)));
      const deleteRows = tableData.filter((row) => !table.selected.includes(row.id));
      setTableData(deleteRows);
      table.onUpdatePageDeleteRows(tableData.length, tableData.length);
      toast.success('Delete success!');
    } catch (error) {
      toast.error('Failed to delete request information');
    }
  }, [table, tableData]);

  const handleExportRequestInformation = useCallback(async () => {
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

      const blob = await requestInformationService.exportRequestInformation(params);
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `request_information_export_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success('Request information exported successfully!');
      menuActions.onClose();
    } catch (error) {
      console.error('Error exporting request information:', error);
      toast.error('Failed to export request information');
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
        <MenuItem onClick={handleExportRequestInformation}>
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
          heading="Information Requests"
          links={[
            { name: 'Menu', href: '/menu' },
            { name: 'Our Penthouses', href: '/menu/our-penthouses' },
            { name: 'Request Information' },
          ]}
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
            <RequestInformationSearch filters={filters} onResetPage={table.onResetPage} />

            <RequestInformationFilters
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
            <RequestInformationTableFiltersResult
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
                    <RequestInformationTableRow
                      key={row.id}
                      row={row}
                      selected={table.selected.includes(row.id)}
                      onSelectRow={() => table.onSelectRow(row.id)}
                      onDeleteRow={() => handleDeleteRow(row.id)}
                      editHref={`/menu/our-penthouses/request-information/${row.id}`}
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
