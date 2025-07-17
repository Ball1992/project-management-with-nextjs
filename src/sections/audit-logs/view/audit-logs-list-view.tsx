'use client';

import type { TableHeadCellProps } from 'src/components/table';
import { useState, useCallback, useEffect } from 'react';
import { useBoolean, useSetState } from 'minimal-shared/hooks';
import { usePopover } from 'minimal-shared/hooks';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import { Card, IconButton, MenuItem, MenuList, Table, TableBody, Tooltip, Chip, Typography } from '@mui/material';

import { paths } from 'src/routes/paths';
import { fDateTime } from 'src/utils/format-time';

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

import { AuditLogService } from 'src/services/audit-log.service';
import type { IAuditLog } from 'src/types/audit-log';

import { AuditLogSearch } from 'src/sections/audit-logs/audit-log-search';
import { AuditLogFilters } from 'src/sections/audit-logs/audit-log-filters';
import { AuditLogTableRow } from 'src/sections/audit-logs/audit-log-table-row';
import { AuditLogTableFiltersResult } from 'src/sections/audit-logs/audit-log-table-filters-result';

// ----------------------------------------------------------------------

const TABLE_HEAD: TableHeadCellProps[] = [
  { id: 'createdDate', label: 'Timestamp', width: 180 },
  { id: 'action', label: 'Action', width: 120 },
  { id: 'user', label: 'User' },
  { id: 'module', label: 'Resource' },
  { id: 'ipAddress', label: 'IP Address', width: 140 },
  { id: 'userAgent', label: 'User Agent' },
  { id: '', label: 'Manage', width: 90 },
];

interface IAuditLogTableFilters {
  name: string;
  action: string;
  module: string;
  startDate: Date | null;
  endDate: Date | null;
}

export function AuditLogsListView() {
  const table = useTable();
  const openFilters = useBoolean();
  const confirmDialog = useBoolean();
  const menuActions = usePopover();

  const filters = useSetState<IAuditLogTableFilters>({
    name: '',
    action: 'all',
    module: 'all',
    startDate: null,
    endDate: null,
  });
  const { state: currentFilters, setState: updateFilters } = filters;

  const [tableData, setTableData] = useState<IAuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    const fetchAuditLogs = async () => {
      try {
        setLoading(true);

        const params: any = {
          page: table.page + 1,
          limit: table.rowsPerPage,
        };

        if (currentFilters.name) {
          params.search = currentFilters.name;
        }

        if (currentFilters.action !== 'all') {
          params.action = currentFilters.action;
        }

        if (currentFilters.module !== 'all') {
          params.module = currentFilters.module;
        }

        if (currentFilters.startDate) {
          params.startDate = currentFilters.startDate.toISOString();
        }
        if (currentFilters.endDate) {
          params.endDate = currentFilters.endDate.toISOString();
        }

        const response = await AuditLogService.getActivityLogs(params);

        if (response.success) {
          setTableData(response.data.auditLogs);
          setTotalCount(response.data.pagination.total);
        }
      } catch (error) {
        console.error('Error fetching audit logs:', error);
        toast.error('Failed to load audit logs');
      } finally {
        setLoading(false);
      }
    };

    fetchAuditLogs();
  }, [
    table.page,
    table.rowsPerPage,
    currentFilters.name,
    currentFilters.action,
    currentFilters.module,
    currentFilters.startDate,
    currentFilters.endDate,
  ]);

  const canReset =
    !!currentFilters.name ||
    currentFilters.action !== 'all' ||
    currentFilters.module !== 'all' ||
    !!currentFilters.startDate ||
    !!currentFilters.endDate;

  const notFound = (!tableData.length && canReset) || !tableData.length;

  const handleDeleteRow = useCallback(
    async (id: string) => {
      try {
        // Implement delete functionality if needed
        const deleteRow = tableData.filter((row) => row.id !== id);
        setTableData(deleteRow);
        table.onUpdatePageDeleteRow(tableData.length);
        toast.success('Delete success!');
      } catch (error) {
        toast.error('Failed to delete audit log');
      }
    },
    [table, tableData]
  );

  const handleDeleteRows = useCallback(async () => {
    try {
      // Implement bulk delete functionality if needed
      const deleteRows = tableData.filter((row) => !table.selected.includes(row.id));
      setTableData(deleteRows);
      table.onUpdatePageDeleteRows(tableData.length, tableData.length);
      toast.success('Delete success!');
    } catch (error) {
      toast.error('Failed to delete audit logs');
    }
  }, [table, tableData]);

  const handleExportAuditLogs = useCallback(async () => {
    try {
      // Build export parameters based on current filters
      const params: any = {};

      if (currentFilters.name) {
        params.search = currentFilters.name;
      }

      if (currentFilters.action !== 'all') {
        params.action = currentFilters.action;
      }

      if (currentFilters.module !== 'all') {
        params.module = currentFilters.module;
      }

      if (currentFilters.startDate) {
        params.startDate = currentFilters.startDate.toISOString();
      }
      if (currentFilters.endDate) {
        params.endDate = currentFilters.endDate.toISOString();
      }

      // Implement export functionality
      const blob = await AuditLogService.exportAuditLogs(params);
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `audit_logs_export_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success('Audit logs exported successfully!');
      menuActions.onClose();
    } catch (error) {
      console.error('Error exporting audit logs:', error);
      toast.error('Failed to export audit logs');
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
        <MenuItem onClick={handleExportAuditLogs}>
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
          heading="System Activity Log"
          links={[
            { name: 'Dashboard', href: paths.dashboard.root },
            { name: 'Administration Panel' },
            { name: 'System Activity Log' },
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
            <AuditLogSearch filters={filters} onResetPage={table.onResetPage} />

            <AuditLogFilters
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
            <AuditLogTableFiltersResult
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
                    <AuditLogTableRow
                      key={row.id}
                      row={row}
                      selected={table.selected.includes(row.id)}
                      onSelectRow={() => table.onSelectRow(row.id)}
                      onDeleteRow={() => handleDeleteRow(row.id)}
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
