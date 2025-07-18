'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  Container,
  Typography,
  Box,
  Button,
  AppBar,
  Toolbar,
  Chip,
  Paper,
  Stack
} from '@mui/material'
import { DataGrid, GridColDef, GridActionsCellItem } from '@mui/x-data-grid'
import VisibilityIcon from '@mui/icons-material/Visibility'
import LogoutIcon from '@mui/icons-material/Logout'
import { getStoredUser, logout, type User } from '@/lib/auth'
import { WorkOrderCustom, WorkOrderSummary } from '@/types/workorderCustom'
import { getStatusLabel, getStatusColor } from '@/types/workorderCustom'
import { useWorkOrders } from '../hooks/useWorkOrders';
import { QueryParams, SalesforceQueryResponse, WorkOrder } from '@/types/salesforce'
import { WorkOrderService } from '@/services/WorkOrderService'
import { transformWorkOrdersToCustom } from '@/helpers/helpersWorkOrders'
import { salesforceAPI } from '../lib/salesforce-server';
import { apiClient } from '../utils/api-client';
import { useSetState } from '@/hooks/useSetState';
import { WorkOrderFilters, IWorkOrderTableFilters } from '@/components/WorkOrderFilters';
import { WorkOrderSearch, IWorkOrderSearchFilters } from '@/components/WorkOrderSearch';

export default function HomePage() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [salesforceWorkOrders, setSalesforceWorkOrders] = useState<WorkOrder[]>([]);
  const [workOrders, setWorkOrders] = useState<WorkOrderCustom[]>([]);
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 10,
  });
  const [rowCount, setRowCount] = useState(0);
  const [workOrderSummary, setWorkOrderSummary] = useState<WorkOrderSummary>({
    total:0,
    totalWaitingInstall:0,
    totalInstallationComplete:0,
    totalWaitingCreditAdmin:0,
  });

  // Filter states using new hooks
  const searchFilters = useSetState<IWorkOrderSearchFilters>({ name: '' });
  const tableFilters = useSetState<IWorkOrderTableFilters>({ status: '' });
  const [openFilters, setOpenFilters] = useState(false);
  
  const router = useRouter()

  const fetchWorkOrders = async (page: number = 0, pageSize: number = 10, searchName?: string, statusFilter?: string) => {
    try {
      const currentUser = getStoredUser();
      if (!currentUser) {
        router.push('/auth/login')
        return;
      }

      setUser(currentUser);
      setLoading(true);

      let whereClause = `Vendor_Name__r.ERP_Customer_ID__c='${currentUser.refKey}'`;
      
      // Add search filter to where clause
      if (searchName) {
        whereClause += ` AND (WorkOrderNumber LIKE '%${searchName}%' OR Account.Name LIKE '%${searchName}%' OR Land_No__c LIKE '%${searchName}%')`;
      }
      
      // Add status filter to where clause
      if (statusFilter) {
        whereClause += ` AND Status = '${statusFilter}'`;
      }

      const queryParams: QueryParams = {
        limit: pageSize,
        offset: page * pageSize,
        orderBy: 'CreatedDate DESC',
        where: whereClause,
      };

      const response = await apiClient.get<SalesforceQueryResponse<WorkOrderCustom>>('/workorders', queryParams);
      if (response.success && response.data) {
        setWorkOrders(response.data.records);
      
      }

      // Get total count from metrics endpoint
      const responseWorkOrderSummary = await apiClient.get<WorkOrderSummary>('/workorders/metrics', { refKey: currentUser.refKey });
      if (responseWorkOrderSummary.success && responseWorkOrderSummary.data) {
        setWorkOrderSummary(responseWorkOrderSummary.data);
          setRowCount(responseWorkOrderSummary.data.total);
      }
        
    } catch (error) {
      console.error('Error fetching work orders:', error);
    } finally {
      setLoading(false);
    }
  };

  // Call API when filters change
  useEffect(() => {
    const searchName = searchFilters.state.name;
    const statusFilter = tableFilters.state.status;
    fetchWorkOrders(paginationModel.page, paginationModel.pageSize, searchName, statusFilter);
  }, [searchFilters.state.name, tableFilters.state.status, paginationModel.page, paginationModel.pageSize]);

  useEffect(() => {
    fetchWorkOrders(paginationModel.page, paginationModel.pageSize);
  }, [router]);

  // Reset page when filters change
  const handleResetPage = useCallback(() => {
    setPaginationModel(prev => ({ ...prev, page: 0 }));
  }, []);

  // Filter handlers
  const handleOpenFilters = useCallback(() => {
    setOpenFilters(true);
  }, []);

  const handleCloseFilters = useCallback(() => {
    setOpenFilters(false);
  }, []);

  // Check if filters can be reset
  const canReset = searchFilters.state.name !== '' || tableFilters.state.status !== '';

  // Get unique statuses for filter dropdown
  const uniqueStatuses = Array.from(new Set(workOrders.map(order => order.status))).filter(Boolean);

  const handlePaginationModelChange = (newPaginationModel: typeof paginationModel) => {
    setPaginationModel(newPaginationModel);
  };

  const handleLogout = () => {
    logout()
    router.push('/auth/login')
  }

  const handleViewDetails = (id: string) => {
    router.push(`/workorders/${id}`)
  }

  const columns: GridColDef[] = [
    { 
      field: 'woNo', 
      headerName: 'WO No.', 
      width: 120,
      flex: 0
    },
    { 
      field: 'account', 
      headerName: 'Customer', 
      width: 200,
      flex: 1,
      minWidth: 150
    },
    {
      field: 'createdDate',
      headerName: 'Created',
      width: 100,
      flex: 0,
      valueFormatter: (params) => params.value ? new Date(params.value).toLocaleDateString() : 'N/A'
    },
    { 
      field: 'landNo', 
      headerName: 'Land No.', 
      width: 90,
      flex: 0
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 160,
      flex: 0,
      renderCell: (params) => (
        <Chip
          label={getStatusLabel(params.value) || 'Unknown'}
          color={getStatusColor(params.value)}
          size="small"
        />
      )
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Actions',
      width: 100,
      flex: 0,
      sortable: false,
      filterable: false,
      disableColumnMenu: true,
      getActions: (params) => [
        <GridActionsCellItem
          key="view"
          icon={<VisibilityIcon />}
          label="View Details"
          onClick={() => handleViewDetails(params.id as string)}
        />
      ]
    }
  ]

  if (loading && !user) {
    return (
      <Container>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
          <Typography>Loading...</Typography>
        </Box>
      </Container>
    )
  }

  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #F8FAFE 0%, #E8F4FD 100%)'
    }}>
      <AppBar position="static" elevation={0}>
        <Toolbar sx={{ py: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
            <Typography 
              variant="h5" 
              component="div" 
              sx={{ 
                fontWeight: 700,
                color: 'white',
                mr: 2
              }}
            >
              DAIKIN
            </Typography>
            <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.9)' }}>
              {user?.role.replace('_', ' ').toUpperCase()} Portal
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'flex-end',
              mr: 1
            }}>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)' }}>
                Welcome back,
              </Typography>
              <Typography variant="subtitle2" sx={{ color: 'white', fontWeight: 600 }}>
                {user?.username}
              </Typography>
            </Box>
            <Button 
              color="inherit" 
              onClick={handleLogout} 
              startIcon={<LogoutIcon />}
              sx={{
                bgcolor: 'rgba(255,255,255,0.1)',
                '&:hover': {
                  bgcolor: 'rgba(255,255,255,0.2)'
                },
                borderRadius: 2,
                px: 2
              }}
            >
              Logout
            </Button>
          </Box>
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Header Section */}
        <Box sx={{ 
          mb: 4,
          p: 3,
          borderRadius: 3,
          background: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(0, 102, 204, 0.1)',
          boxShadow: '0 8px 32px rgba(0, 102, 204, 0.1)'
        }}>
          <Typography 
            variant="h3" 
            component="h1" 
            gutterBottom
            sx={{ 
              fontWeight: 700,
              background: 'linear-gradient(135deg, #0066CC 0%, #00A0E6 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 1
            }}
          >
            Work Orders Dashboard
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage and track your work orders efficiently
          </Typography>
        </Box>

        {/* Statistics Cards */}
        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr 1fr' },
          gap: 3,
          mb: 4
        }}>
          <Paper sx={{ 
            p: 3, 
            textAlign: 'center',
            background: 'linear-gradient(135deg, #0066CC 0%, #00A0E6 100%)',
            color: 'white'
          }}>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
              {workOrderSummary.total}
            </Typography>
            <Typography variant="body2">
              Total Orders
            </Typography>
          </Paper>
          <Paper sx={{ 
            p: 3, 
            textAlign: 'center',
            background: 'linear-gradient(135deg, #00A0E6 0%, #47A7EF 100%)',
            color: 'white'
          }}>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
              {workOrderSummary.totalWaitingInstall}
            </Typography>
            <Typography variant="body2">
              Waiting Install
            </Typography>
          </Paper>
          <Paper sx={{ 
            p: 3, 
            textAlign: 'center',
            background: 'linear-gradient(135deg, #47A7EF 0%, #75BDF3 100%)',
            color: 'white'
          }}>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
              {workOrderSummary.totalInstallationComplete}
            </Typography>
            <Typography variant="body2">
              Installation Complete
            </Typography>
          </Paper>
          <Paper sx={{ 
            p: 3, 
            textAlign: 'center',
            background: 'linear-gradient(135deg, #75BDF3 0%, #A3D3F7 100%)',
            color: 'white'
          }}>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
              {workOrderSummary.totalWaitingCreditAdmin}
            </Typography>
            <Typography variant="body2">
              Waiting Credit Admin
            </Typography>
          </Paper>
        </Box>

        {/* Data Grid */}
        <Paper sx={{ 
          p: 3,
          borderRadius: 3,
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(0, 102, 204, 0.1)',
          boxShadow: '0 8px 32px rgba(0, 102, 204, 0.1)'
        }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h5" sx={{ fontWeight: 600, color: 'primary.main' }}>
              Work Orders List
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {workOrderSummary.total} orders
            </Typography>
          </Box>

          {/* Filter Controls */}
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 3, alignItems: 'center' }}>
            <WorkOrderSearch
              filters={searchFilters}
              onResetPage={handleResetPage}
              sx={{ flex: 1 }}
            />
            
            <WorkOrderFilters
              open={openFilters}
              onOpen={handleOpenFilters}
              onClose={handleCloseFilters}
              canReset={canReset}
              filters={tableFilters}
              statusOptions={uniqueStatuses}
            />
          </Stack>

          <Box sx={{ height: 600, width: '100%' }}>
            <DataGrid
              rows={workOrders}
              columns={columns}
              getRowId={(row) => row.Id || row.id}
              paginationMode="server"
              rowCount={rowCount}
              paginationModel={paginationModel}
              onPaginationModelChange={handlePaginationModelChange}
              pageSizeOptions={[5, 10, 25, 50]}
              loading={loading}
              checkboxSelection={false}
              disableRowSelectionOnClick
              autoHeight={false}
              scrollbarSize={17}
              sx={{
                '& .MuiDataGrid-root': {
                  border: 'none'
                },
                '& .MuiDataGrid-main': {
                  overflow: 'auto'
                },
                '& .MuiDataGrid-virtualScroller': {
                  overflow: 'auto'
                },
                '& .MuiDataGrid-columnHeaders': {
                  backgroundColor: '#f5f5f5'
                },
                width: '100%',
                minWidth: '800px'
              }}
            />
          </Box>
        </Paper>
      </Container>
    </Box>
  )
}
