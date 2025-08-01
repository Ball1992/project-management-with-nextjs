// src/app/page.tsx - Complete Fix for Infinite Loop
'use client'

import { useEffect, useState, useCallback, useMemo, useRef } from 'react'
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
  Stack,
  Card,
  CardContent,
  IconButton,
  Divider,
  Grid,
  LinearProgress,
  Skeleton
} from '@mui/material'
import { DataGrid, GridColDef, GridActionsCellItem } from '@mui/x-data-grid'
import {
  Assignment as AssignmentIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckCircleIcon,
  TrendingUp as TrendingUpIcon,
  Add as AddIcon,
  Refresh as RefreshIcon,
  ArrowForward as ArrowForwardIcon,
  MoreVert as MoreVertIcon,
  Logout as LogoutIcon,
  Visibility as VisibilityIcon
} from '@mui/icons-material'
import { getStoredUser, logout, type User } from '@/lib/auth'
import { WorkOrderCustom, WorkOrderSummary } from '@/types/workorderCustom'
import { getStatusLabel, getStatusColor } from '@/types/workorderCustom'
import { useWorkOrders } from '../hooks/useWorkOrders'
import { QueryParams, SalesforceQueryResponse, WorkOrder } from '@/types/salesforce'
import { WorkOrderService } from '@/services/WorkOrderService'
import { transformWorkOrdersToCustom } from '@/helpers/helpersWorkOrders'
import { salesforceAPI } from '../lib/salesforce-server'
import { apiClient } from '../utils/api-client'
import { WorkOrderFilters, IWorkOrderTableFilters } from '@/components/WorkOrderFilters'
import { WorkOrderSearch, IWorkOrderSearchFilters } from '@/components/WorkOrderSearch'
import { formatDateForTable } from '@/utils/dateFormatter'

// Custom hook to replace useSetState and fix infinite loop
function useStableState<T>(initialState: T) {
  const [state, setState] = useState<T>(initialState)
  const initialStateRef = useRef(initialState)
  
  const updateState = useCallback((newState: Partial<T>) => {
    setState((prevState) => ({ ...prevState, ...newState }))
  }, [])

  const resetState = useCallback(() => {
    setState(initialStateRef.current)
  }, [])

  return {
    state,
    setState: updateState,
    resetState,
  }
}

export default function MinimalHomePage() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [workOrders, setWorkOrders] = useState<WorkOrderCustom[]>([])
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 10,
  })
  const [rowCount, setRowCount] = useState(0)
  const [workOrderSummary, setWorkOrderSummary] = useState<WorkOrderSummary>({
    total: 0,
    totalWaitingInstall: 0,
    totalInstallationComplete: 0,
    totalWaitingCreditAdmin: 0,
  })

  // Fixed filter states using stable hook
  const searchFilters = useStableState<IWorkOrderSearchFilters>({ name: '' })
  const tableFilters = useStableState<IWorkOrderTableFilters>({ status: '' })
  const [openFilters, setOpenFilters] = useState(false)
  
  const router = useRouter()

  // Stabilize the fetch function with proper dependencies and correct status filtering
  const fetchWorkOrders = useCallback(async (
    page: number = 0, 
    pageSize: number = 10, 
    searchName?: string, 
    statusFilter?: string
  ) => {
    try {
      const currentUser = getStoredUser();
      if (!currentUser) {
        router.push('/auth/login')
        return;
      }

      if (!user) {
        setUser(currentUser);
      }
      
      setLoading(true);

      let whereClause = '';
      
      // Only apply refKey filtering for non-admin roles
      if (currentUser.role !== 'admin_install' && currentUser.role !== 'admin_credit') {
        whereClause = ` AND ( Vendor_Name__r.ERP_Customer_ID__c='${currentUser.refKey}'   or Vendor_Name__r.ERP_Customer_ID__c='000${currentUser.refKey}'  ) `;
      }
      
      if (searchName) {
        whereClause += ` AND (WorkOrderNumber LIKE '%${searchName}%'  )`;
      }
      
      // Handle status filter with correct Salesforce status values
      if (statusFilter) {
        if (statusFilter.includes(',')) {
          // Handle multiple statuses (like 'Reception')
          const statuses = statusFilter.split(',').map(s => `'${s.trim()}'`).join(',');
          // console.log(statuses)
          whereClause += ` AND Status IN (${statuses})`;
        } else {
          // Single status
          if(statusFilter!=='Closed'){
             whereClause += ` AND Status = '${statusFilter}'`;
          }else{
             whereClause += ` AND Status = '${statusFilter}' AND  IsCreditHandoverReceived__c = false  `;
          }
          
        }
      }

      const queryParams: QueryParams = {
        limit: pageSize,
        offset: page * pageSize,
        orderBy: 'CreatedDate DESC',
        where: whereClause,
      };

      // console.log(`Fetching page ${page + 1}, limit: ${pageSize}, offset: ${page * pageSize}`);
      // console.log(`Where clause: ${whereClause}`);

      const response = await apiClient.get<SalesforceQueryResponse<WorkOrderCustom>>('/workorders', queryParams);
      // console.log(response);
      if (response.success && response.data) {
        setWorkOrders(response.data.records);
        // console.log(`Received ${response.data.records.length} records`);
      }

      const responseWorkOrderSummary = await apiClient.get<WorkOrderSummary>('/workorders/metrics', { 
        refKey: currentUser.refKey,
        userRole: currentUser.role 
      });
      if (responseWorkOrderSummary.success && responseWorkOrderSummary.data) {
        setWorkOrderSummary(responseWorkOrderSummary.data);
        
        // Set rowCount based on current filter with correct mapping
        if (!statusFilter) {
          setRowCount(responseWorkOrderSummary.data.total);
        } else if (statusFilter === 'Reception') {
          setRowCount(responseWorkOrderSummary.data.totalWaitingInstall); // Waiting Install card count
        } else if (statusFilter === 'Done (Operation)') {
          setRowCount(responseWorkOrderSummary.data.totalInstallationComplete); // Installation Completed card count
        } else if (statusFilter === 'Closed') {
          setRowCount(responseWorkOrderSummary.data.totalWaitingCreditAdmin);
        } else {
          setRowCount(responseWorkOrderSummary.data.total);
        }
        
        // console.log(`Total records from metrics: ${responseWorkOrderSummary.data.total}`);
      } else {
        setRowCount(response.data?.totalSize || 0);
        // console.log(`Fallback total: ${response.data?.totalSize || 0}`);
      }
        
    } catch (error) {
      // console.error('Error fetching work orders:', error)
      setWorkOrders([]);
      setWorkOrderSummary({
        total: 0,
        totalWaitingInstall: 0, 
        totalInstallationComplete: 0,
        totalWaitingCreditAdmin: 0
      });
      setRowCount(0);
      // console.log('API failed, showing empty state');
    } finally {
      setLoading(false);
    }
  }, [router, user])

  // Handle summary card click with correct mapping
  const handleSummaryCardClick = useCallback((filterType: string) => {
    let statusFilter = '';
    
    switch (filterType) {
      case 'total':
        statusFilter = 'Reception,Done (Operation),Closed'; // Show all
        break;
      case 'waiting_install':
        statusFilter = 'Reception'; // Waiting Install shows Reception
        break;
      case 'installation_completed':
        statusFilter = 'Done (Operation)'; // Installation Completed shows Done (Operation)
        break;
      case 'credit_review':
        statusFilter = 'Closed'; // Credit Review shows Closed
        break;
      default:
        statusFilter = '';
    }
    
    tableFilters.setState({ status: statusFilter });
    setPaginationModel(prev => ({ ...prev, page: 0 }));
    // console.log(`Summary card clicked: ${filterType}, filter set to: ${statusFilter}`);
  }, [tableFilters])

  // Event handlers
  const handlePaginationModelChange = useCallback((newModel: typeof paginationModel) => {
    // console.log('Pagination changed:', newModel)
    setPaginationModel(newModel)
  }, [])

  const handleResetPage = useCallback(() => {
    setPaginationModel(prev => ({ ...prev, page: 0 }))
  }, [])

  const handleOpenFilters = useCallback(() => {
    setOpenFilters(true)
  }, [])

  const handleCloseFilters = useCallback(() => {
    setOpenFilters(false)
  }, [])

  const handleViewDetails = useCallback((id: string) => {
    router.push(`/workorders/${id}`)
  }, [router])

  const handleRefreshData = useCallback(() => {
    const searchName = searchFilters.state.name;
    const statusFilter = tableFilters.state.status;
    fetchWorkOrders(paginationModel.page, paginationModel.pageSize, searchName, statusFilter)
  }, [fetchWorkOrders, paginationModel.page, paginationModel.pageSize, searchFilters.state.name, tableFilters.state.status])

  const handleLogout = useCallback(() => {
    logout()
    router.push('/auth/login')
  }, [router])

  // Memoized values
  const canReset = useMemo(() => 
    tableFilters.state.status !== '' || searchFilters.state.name !== '',
    [tableFilters.state.status, searchFilters.state.name]
  )

  // Get unique statuses for filter (updated with correct Salesforce statuses)
  const uniqueStatuses = useMemo(() => 
    workOrders.length > 0 
      ? [...new Set(workOrders.map(wo => wo.status))]
      : ['Pending', 'Reception', 'Done (Operation)', 'Closed'],
    [workOrders]
  )

  // Summary Cards Component with memoized dependency and default styling
  const MinimalSummaryCards = useCallback(() => {
    // Determine default card based on user role
    const getDefaultCard = () => {
      if (!user) return '';
      switch (user.role) {
        case 'sub_contractor':
          return 'waiting_install'; // Waiting Install card
        case 'admin_install':
          return 'installation_completed'; // Installation Completed card
        case 'admin_credit':
          return 'credit_review'; // Credit Review card
        case 'admin':
        case 'manager':
          return 'total'; // Total card for admin/manager roles
        default:
          return 'total'; // Default to total card for unknown roles
      }
    };

    const defaultCard = getDefaultCard();
    
    const allSummaryData = [
      { 
        title: 'Total', 
        value: workOrderSummary.total, 
        icon: <AssignmentIcon />,
        color: '#64748b',
        filterType: 'total',
        isActive: tableFilters.state.status === 'Reception,Done (Operation),Closed',
        isDefault: defaultCard === 'total'
      },
      { 
        title: 'Waiting Install', 
        value: workOrderSummary.totalWaitingInstall, 
        icon: <ScheduleIcon />,
        color: '#f59e0b',
        filterType: 'waiting_install',
        isActive: tableFilters.state.status === 'Reception',
        isDefault: defaultCard === 'waiting_install'
      },
      { 
        title: 'Installation Completed', 
        value: workOrderSummary.totalInstallationComplete, 
        icon: <CheckCircleIcon />,
        color: '#10b981',
        filterType: 'installation_completed',
        isActive: tableFilters.state.status === 'Done (Operation)',
        isDefault: defaultCard === 'installation_completed'
      },
      { 
        title: 'Credit Review', 
        value: workOrderSummary.totalWaitingCreditAdmin, 
        icon: <TrendingUpIcon />,
        color: '#3b82f6',
        filterType: 'credit_review',
        isActive: tableFilters.state.status === 'Closed',
        isDefault: defaultCard === 'credit_review'
      }
    ];

    // Filter out Credit Review card for sub_contractor users
    const summaryData = user?.role === 'sub_contractor' 
      ? allSummaryData.filter(item => item.filterType !== 'credit_review')
      : allSummaryData;

    return (
      <Grid container spacing={2} sx={{ mb: 4 }}>
        {summaryData.map((item, index) => (
          <Grid item xs={6} md={3} key={index}>
            <Paper
              elevation={0}
              onClick={() => handleSummaryCardClick(item.filterType)}
              sx={{
                p: 3,
                textAlign: 'center',
                position: 'relative',
                border: item.isActive 
                  ? `2px solid ${item.color}` 
                  : item.isDefault && !item.isActive
                  ? `2px dashed ${item.color}60`
                  : '1px solid #f1f5f9',
                borderRadius: 2,
                transition: 'all 0.2s ease',
                cursor: 'pointer',
                backgroundColor: item.isActive 
                  ? `${item.color}08` 
                  : item.isDefault && !item.isActive
                  ? `${item.color}03`
                  : '#ffffff',
                transform: item.isActive 
                  ? 'translateY(-2px)' 
                  : item.isDefault && !item.isActive
                  ? 'translateY(-1px)'
                  : 'none',
                boxShadow: item.isActive 
                  ? `0 8px 25px ${item.color}30` 
                  : item.isDefault && !item.isActive
                  ? `0 4px 15px ${item.color}15`
                  : 'none',
                '&:hover': {
                  borderColor: item.color,
                  transform: 'translateY(-4px)',
                  boxShadow: `0 8px 25px ${item.color}25`,
                  backgroundColor: `${item.color}05`
                }
              }}
            >
              <Box sx={{ color: item.color, mb: 1 }}>
                {item.icon}
              </Box>
              <Typography 
                variant="h4" 
                sx={{ 
                  fontWeight: 600, 
                  mb: 0.5, 
                  color: item.isActive ? item.color : '#1e293b',
                  transition: 'color 0.2s ease'
                }}
              >
                {item.value}
              </Typography>
              <Typography 
                variant="body2" 
                sx={{ 
                  color: item.isActive ? item.color : 'text.secondary',
                  fontWeight: item.isActive ? 600 : 400,
                  transition: 'all 0.2s ease'
                }}
              >
                {item.title}
              </Typography>
              
              {item.isActive && (
                <Box
                  sx={{
                    position: 'absolute',
                    bottom: 0,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: 40,
                    height: 3,
                    backgroundColor: item.color,
                    borderRadius: '3px 3px 0 0'
                  }}
                />
              )}
            </Paper>
          </Grid>
        ))}
      </Grid>
    );
  }, [workOrderSummary, tableFilters.state.status, handleSummaryCardClick]);

  // DataGrid columns
  const columns: GridColDef[] = useMemo(() => [
    { 
      field: 'woNo', 
      headerName: 'Work Order', 
      width: 140,
      flex: 0,
      renderCell: (params) => (
        <Typography 
          variant="body2" 
          sx={{ 
            fontWeight: 600, 
            color: '#1e293b',
            fontFamily: 'monospace',
            letterSpacing: '0.025em'
          }}
        >
          {params.value}
        </Typography>
      )
    },
    { 
      field: 'account', 
      headerName: 'Customer', 
      width: 220,
      flex: 1,
      minWidth: 180,
      renderCell: (params) => (
        <Typography 
          variant="body2" 
          sx={{ 
            color: '#374151',
            fontWeight: 500,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}
        >
          {params.value}
        </Typography>
      )
    },
    { 
      field: 'sub', 
      headerName: 'Sub-contractor', 
      width: 160,
      flex: 0,
      renderCell: (params) => (
        <Typography 
          variant="body2" 
          sx={{ 
            color: '#6b7280',
            fontSize: '0.875rem'
          }}
        >
          {params.value || 'Not assigned'}
        </Typography>
      )
    },
    {
      field: 'createdDate',
      headerName: 'Created',
      width: 110,
      flex: 0,
      valueFormatter: (params) => formatDateForTable(params.value),
      renderCell: (params) => (
        <Typography 
          variant="caption" 
          sx={{ 
            color: '#6b7280',
            fontSize: '0.8rem',
            fontWeight: 500
          }}
        >
          {params.formattedValue}
        </Typography>
      )
    },
    {
      field: 'actualStart',
      headerName: 'Actual Start',
      width: 120,
      flex: 0,
      valueFormatter: (params) => formatDateForTable(params.value),
      renderCell: (params) => (
        <Typography 
          variant="caption" 
          sx={{ 
            color: params.value ? '#059669' : '#9ca3af',
            fontSize: '0.8rem',
            fontWeight: params.value ? 600 : 400
          }}
        >
          {params.formattedValue}
        </Typography>
      )
    },
    {
      field: 'actualFinished',
      headerName: 'Actual Finished',
      width: 130,
      flex: 0,
      valueFormatter: (params) => formatDateForTable(params.value),
      renderCell: (params) => (
        <Typography 
          variant="caption" 
          sx={{ 
            color: params.value ? '#059669' : '#9ca3af',
            fontSize: '0.8rem',
            fontWeight: params.value ? 600 : 400
          }}
        >
          {params.formattedValue}
        </Typography>
      )
    },
    { 
      field: 'subject', 
      headerName: 'Subject', 
      width: 200,
      flex: 1,
      minWidth: 150,
      renderCell: (params) => (
        <Typography 
          variant="body2" 
          sx={{ 
            color: '#374151',
            fontSize: '0.875rem',
            fontWeight: 500,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}
        >
          {params.value || 'No subject'}
        </Typography>
      )
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 180,
      flex: 0,
      renderCell: (params) => (
        <Chip
          label={getStatusLabel(params.value) || 'Unknown'}
          color={getStatusColor(params.value)}
          size="small"
          variant="outlined"
          sx={{ 
            fontSize: '0.75rem',
            borderRadius: 1.5,
            fontWeight: 500,
            height: 28,
            '& .MuiChip-label': { 
              px: 1.5,
              py: 0.5
            },
            border: '1.5px solid',
            backgroundColor: 'transparent'
          }}
        />
      )
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: '',
      width: 80,
      flex: 0,
      sortable: false,
      filterable: false,
      disableColumnMenu: true,
      getActions: (params) => [
        <GridActionsCellItem
          key="view"
          icon={
            <VisibilityIcon 
              sx={{ 
                fontSize: 18,
                color: '#6b7280',
                '&:hover': {
                  color: '#374151'
                }
              }} 
            />
          }
          label="View Details"
          onClick={() => handleViewDetails(params.id as string)}
          sx={{ 
            '&:hover': {
              backgroundColor: '#f3f4f6'
            }
          }}
        />
      ]
    }
  ], [handleViewDetails]);

  // Loading Skeleton
  const LoadingSkeleton = () => (
    <Grid container spacing={3}>
      {[1, 2, 3, 4, 5, 6].map((item) => (
        <Grid item xs={12} md={6} lg={4} key={item}>
          <Paper elevation={0} sx={{ p: 3, border: '1px solid #f1f5f9', borderRadius: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Skeleton variant="text" width={120} height={24} />
              <Skeleton variant="circular" width={24} height={24} />
            </Box>
            <Skeleton variant="rounded" width={80} height={20} sx={{ mb: 2 }} />
            <Skeleton variant="rectangular" width="100%" height={4} sx={{ borderRadius: 2, mb: 2 }} />
            <Skeleton variant="text" width="60%" height={16} sx={{ mb: 1 }} />
            <Skeleton variant="text" width="80%" height={16} sx={{ mb: 2 }} />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Skeleton variant="text" width={80} height={16} />
              <Skeleton variant="rounded" width={60} height={24} />
            </Box>
          </Paper>
        </Grid>
      ))}
    </Grid>
  );

  // Single useEffect for initial load and set default filter immediately
  useEffect(() => {
    const currentUser = getStoredUser();
    if (!currentUser) {
      router.push('/auth/login');
      return;
    }
    
    setUser(currentUser);
    
    // Set default filter based on user role immediately - only if not already set
    if (tableFilters.state.status === '') {
      let defaultStatus = '';
      switch (currentUser.role) {
        case 'sub_contractor':
          defaultStatus = 'Reception'; // waiting_install -> Installation Completed
          break;
        case 'admin_install':
          defaultStatus = 'Done (Operation)'; // installation_completed -> Waiting Install
          break;
        case 'admin_credit':
          defaultStatus = 'Closed'; // credit_review -> Credit Review
          break;
        default:
          defaultStatus = '';
      }
      
      if (defaultStatus) {
        tableFilters.setState({ status: defaultStatus });
      }
    }
  }, [router]); // Remove tableFilters from dependency array to prevent infinite loop

  // Single useEffect for fetching data when filters or pagination change
  useEffect(() => {
    if (user) {
      const searchName = searchFilters.state.name;
      const statusFilter = tableFilters.state.status;
      fetchWorkOrders(paginationModel.page, paginationModel.pageSize, searchName, statusFilter);
    }
  }, [
    user,
    searchFilters.state.name, 
    tableFilters.state.status, 
    paginationModel.page, 
    paginationModel.pageSize,
    fetchWorkOrders
  ]);

  // Remove the separate useEffect for setting default filter since it's now handled in the initial load useEffect

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
      bgcolor: '#fafafa'
    }}>


// แทนที่ส่วน AppBar ใน src/app/page.tsx เดิม

{/* Minimal Daikin Header - โทนฟ้า Daikin กับตัวอักษรขาว */}
<AppBar 
  position="fixed" 
  elevation={0} 
  sx={{ 
    bgcolor: '#0066CC',
    background: 'linear-gradient(135deg, #0066CC 0%, #00A0E6 100%)',
    color: 'white',
    backdropFilter: 'blur(8px)',
    zIndex: 1100
  }}
>
  <Toolbar 
    sx={{ 
      minHeight: '56px !important',
      px: { xs: 2, sm: 3 },
      py: 0
    }}
  >
    {/* Left Side - Minimal Daikin Logo */}
    <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
      {/* Simple Daikin Logo */}
      <Box
        sx={{
          width: 32,
          height: 32,
          borderRadius: '6px',
          background: 'linear-gradient(135deg, #0066CC 0%, #00A0E6 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mr: 2,
          boxShadow: '0 2px 8px rgba(0, 102, 204, 0.2)'
        }}
      >
        <Typography 
          sx={{ 
            fontWeight: 700,
            color: 'white',
            fontSize: '14px'
          }}
        >
          D
        </Typography>
      </Box>
      
      {/* DAIKIN Text - สีขาวบนโทนฟ้า */}
      <Typography 
        variant="h6" 
        sx={{ 
          fontWeight: 700,
          color: 'white',
          fontSize: '18px',
          letterSpacing: '0.5px'
        }}
      >
        DAIKIN
      </Typography>

      {/* System Name - สีขาวอ่อน */}
      <Typography 
        variant="body2" 
        sx={{ 
          fontWeight: 400,
          color: 'rgba(255, 255, 255, 0.9)',
          fontSize: '13px',
          ml: 2,
          display: { xs: 'none', md: 'block' }
        }}
      >
        WorkOrder Management
      </Typography>
    </Box>
    
    {/* Right Side - Minimal User Info */}
    <Stack direction="row" spacing={1.5} alignItems="center">
      {/* User Info - Clean */}
      <Box sx={{ 
        display: { xs: 'none', sm: 'flex' }, 
        alignItems: 'center', 
        gap: 1.5
      }}>
        <Box sx={{ textAlign: 'right' }}>
          <Typography 
            variant="body2" 
            sx={{ 
              fontWeight: 600,
              color: 'white',
              lineHeight: 1.2,
              fontSize: '13px'
            }}
          >
            {user?.username}
          </Typography>
          <Typography 
            variant="caption" 
            sx={{ 
              color: 'rgba(255, 255, 255, 0.8)',
              lineHeight: 1.2,
              fontSize: '11px'
            }}
          >
            {user?.role}
          </Typography>
        </Box>
        
        {/* User Avatar - Minimal */}
        <Box
          sx={{
            width: 28,
            height: 28,
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.2)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <Typography 
            sx={{ 
              color: 'white',
              fontSize: '12px',
              fontWeight: 700
            }}
          >
            {user?.username?.charAt(0)}
          </Typography>
        </Box>
      </Box>

      {/* Mobile User Avatar */}
      <Box
        sx={{
          width: 28,
          height: 28,
          borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.1)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          display: { xs: 'flex', sm: 'none' },
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <Typography 
          sx={{ 
            color: '#f1f5f9',
            fontSize: '12px',
            fontWeight: 600
          }}
        >
          {user?.username?.charAt(0)}
        </Typography>
      </Box>

      {/* Logout Button - Minimal */}
      <Button 
        color="inherit" 
        onClick={handleLogout} 
        startIcon={<LogoutIcon />}
        sx={{
          color: 'white',
          textTransform: 'none',
          fontWeight: 500,
          fontSize: '13px',
          px: { xs: 1.5, sm: 2 },
          py: 0.75,
          borderRadius: 2,
          border: '1px solid rgba(255, 255, 255, 0.2)',
          transition: 'all 0.2s ease',
          '&:hover': {
            bgcolor: 'rgba(255, 255, 255, 0.1)',
            borderColor: 'rgba(255, 255, 255, 0.3)',
            color: 'white'
          },
          '& .MuiButton-startIcon': {
            display: { xs: 'none', sm: 'flex' },
            margin: 0,
            mr: 0.75
          }
        }}
      >
        <Box component="span" sx={{ display: { xs: 'none', sm: 'block' } }}>
          Logout
        </Box>
        <LogoutIcon sx={{ 
          display: { xs: 'block', sm: 'none' },
          fontSize: '18px'
        }} />
      </Button>
    </Stack>
  </Toolbar>
</AppBar>

{/* ต้องเพิ่ม Toolbar ว่างเพื่อ offset content เนื่องจากใช้ position="fixed" */}
<Toolbar sx={{ minHeight: '56px' }} />


      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography 
            variant="h4" 
            sx={{ 
              fontWeight: 700, 
              mb: 1,
              color: '#1e293b'
            }}
          >
            Work Orders
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage and track your work orders
          </Typography>
        </Box>

        {/* Summary Cards */}
        <MinimalSummaryCards />

        {/* Search and Filters */}
        <Paper
          elevation={0}
          sx={{
            p: 3,
            mb: 3,
            borderRadius: 2,
            border: '1px solid #f1f5f9'
          }}
        >
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
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
        </Paper>

        {/* Work Orders Section */}
        <Paper
          elevation={0}
          sx={{
            p: 4,
            borderRadius: 2,
            border: '1px solid #f1f5f9'
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Box>
              
              <Typography variant="body2" color="text.secondary">
                {workOrders && workOrders.length > 0 
                  ? `Showing ${workOrders.length} of ${rowCount} orders`
                  : 'No orders found'
                }
              </Typography>
            </Box>
            
            <Stack direction="row" spacing={2}>
              <Button
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={handleRefreshData}
                disabled={loading}
                size="small"
                sx={{
                  textTransform: 'none',
                  borderColor: '#e2e8f0',
                  color: '#64748b',
                  '&:hover': {
                    borderColor: '#cbd5e1',
                    bgcolor: '#f8fafc'
                  }
                }}
              >
                {loading ? 'Refreshing...' : 'Refresh'}
              </Button>
            </Stack>
          </Box>

          {/* DataGrid or Empty State */}
          {workOrders.length > 0 ? (
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
                scrollbarSize={12}
                sx={{
                  border: 'none',
                  borderRadius: 3,
                  overflow: 'hidden',
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05), 0 1px 2px rgba(0, 0, 0, 0.1)',
                  '& .MuiDataGrid-main': {
                    overflow: 'auto'
                  },
                  '& .MuiDataGrid-virtualScroller': {
                    overflow: 'auto'
                  },
                  '& .MuiDataGrid-columnHeaders': {
                    backgroundColor: '#ffffff',
                    borderBottom: '2px solid #f1f5f9',
                    '& .MuiDataGrid-columnHeader': {
                      color: '#1e293b',
                      fontWeight: 600,
                      fontSize: '0.875rem',
                      letterSpacing: '0.025em',
                      '&:focus': {
                        outline: 'none'
                      },
                      '&:focus-within': {
                        outline: 'none'
                      }
                    },
                    '& .MuiDataGrid-columnHeaderTitle': {
                      fontWeight: 600
                    }
                  },
                  '& .MuiDataGrid-row': {
                    backgroundColor: '#ffffff',
                    '&:nth-of-type(even)': {
                      backgroundColor: '#fafbfc'
                    },
                    '&:hover': {
                      backgroundColor: '#f8fafc',
                      transition: 'all 0.15s ease'
                    },
                    '& .MuiDataGrid-cell': {
                      borderBottom: '1px solid #f1f5f9',
                      padding: '12px 16px',
                      '&:focus': {
                        outline: 'none'
                      },
                      '&:focus-within': {
                        outline: 'none'
                      }
                    }
                  },
                  '& .MuiDataGrid-footerContainer': {
                    borderTop: '2px solid #f1f5f9',
                    backgroundColor: '#ffffff',
                    '& .MuiTablePagination-root': {
                      color: '#64748b'
                    },
                    '& .MuiIconButton-root': {
                      color: '#64748b',
                      '&:hover': {
                        backgroundColor: '#f8fafc'
                      }
                    }
                  },
                  width: '100%',
                  minWidth: '800px'
                }}
              />
            </Box>
          ) : loading ? (
            <LoadingSkeleton />
          ) : (
            <Box sx={{ 
              textAlign: 'center', 
              py: 8,
              color: '#6b7280'
            }}>
              <Typography variant="h6" sx={{ mb: 1, color: '#374151' }}>
                No Work Orders Found
              </Typography>
              <Typography variant="body2">
                No work orders available for your account or current filter criteria.
              </Typography>
            </Box>
          )}
        </Paper>
      </Container>
    </Box>
  )
}
