'use client';

import { useState, useEffect, useCallback } from 'react';

import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Chip from '@mui/material/Chip';
import Box from '@mui/material/Box';
import TablePagination from '@mui/material/TablePagination';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';

import { paths } from 'src/routes/paths';

import { useSettingsContext } from 'src/components/settings';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { AuditLogService } from 'src/services/audit-log.service';
import type { IAuditLog } from 'src/types/audit-log';

// ----------------------------------------------------------------------

export function SystemActivityLogView() {
  const settings = useSettingsContext();

  const [activityLogs, setActivityLogs] = useState<IAuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

  const fetchActivityLogs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await AuditLogService.getActivityLogs({
        page: page + 1, // API uses 1-based pagination
        limit: rowsPerPage,
      });

      if (response.success) {
        setActivityLogs(response.data.auditLogs);
        setTotalCount(response.data.pagination.total);
      } else {
        setError(response.message || 'Failed to fetch activity logs');
      }
    } catch (err) {
      console.error('Error fetching activity logs:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch activity logs');
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage]);

  useEffect(() => {
    fetchActivityLogs();
  }, [fetchActivityLogs]);

  const handlePageChange = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const getActionColor = (action: string) => {
    if (action.toLowerCase().includes('login')) {
      return 'info';
    }
    if (action.toLowerCase().includes('create')) {
      return 'success';
    }
    if (action.toLowerCase().includes('delete')) {
      return 'error';
    }
    if (action.toLowerCase().includes('update')) {
      return 'warning';
    }
    if (action.toLowerCase().includes('failed')) {
      return 'error';
    }
    if (action.toLowerCase().includes('view')) {
      return 'default';
    }
    return 'default';
  };

  const formatDateTime = (dateString: string) => {
    // Handle the date format from API (DD/MM/YYYY HH:mm:ss)
    const [datePart, timePart] = dateString.split(' ');
    const [day, month, year] = datePart.split('/');
    const formattedDate = `${year}-${month}-${day}T${timePart}`;
    const date = new Date(formattedDate);
    
    return date.toLocaleString('th-TH', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <Container maxWidth="lg">
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
        <Box sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            System Activity Log
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Track all system activities and user actions
          </Typography>
        </Box>

        {error && (
          <Box sx={{ p: 3 }}>
            <Alert severity="error">{error}</Alert>
          </Box>
        )}

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Timestamp</TableCell>
                <TableCell>Action</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>User</TableCell>
                <TableCell>Module</TableCell>
                <TableCell>Target ID</TableCell>
                <TableCell>IP Address</TableCell>
                <TableCell>User Agent</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : activityLogs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                    <Typography variant="body2" color="text.secondary">
                      No activity logs found
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                activityLogs.map((log) => (
                  <TableRow key={log.id} hover>
                    <TableCell>
                      <Typography variant="body2">
                        {formatDateTime(log.createdDate)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={log.action}
                        color={getActionColor(log.action) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {log.description}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="medium">
                        {log.user.email}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" display="block">
                        {log.user.firstName} {log.user.lastName}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {log.module}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {log.targetId}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {log.ipAddress}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {log.userAgent.length > 50 
                          ? `${log.userAgent.substring(0, 50)}...` 
                          : log.userAgent
                        }
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          component="div"
          count={totalCount}
          page={page}
          onPageChange={handlePageChange}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleRowsPerPageChange}
          rowsPerPageOptions={[5, 10, 25, 50]}
        />
      </Card>
    </Container>
  );
}
