'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import {
  Container,
  Typography,
  Box,
  Button,
  AppBar,
  Toolbar,
  Paper,
  Grid,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider
} from '@mui/material'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import LogoutIcon from '@mui/icons-material/Logout'
import AttachFileIcon from '@mui/icons-material/AttachFile'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import EditIcon from '@mui/icons-material/Edit'
import dayjs, { Dayjs } from 'dayjs'
import { getStoredUser, logout, type User } from '@/lib/auth'
import { WorkOrderCustom, getStatusLabel, getStatusColor, WorkOrderAttachment } from '@/types/workorderCustom'
import { FileUploadZone } from '@/components/FileUpload'
import { convertFileToBase64 } from '@/utils/imageCompression'
import { apiClient } from '@/utils/api-client'
import { deserializeWorkOrderCustom } from '@/helpers/helpersWorkOrders'
import { QueryParams, SalesforceQueryResponse } from '@/types/salesforce'

interface FileWithPreview extends File {
  preview?: string
  compressed?: File
}

export default function WorkOrderDetailPage() {
  const [user, setUser] = useState<User | null>(null)
  const [workOrder, setWorkOrder] = useState<WorkOrderCustom | null>(null)
  const [loading, setLoading] = useState(true)
  const [actualStart, setActualStart] = useState<Dayjs | null>(null)
  const [actualFinished, setActualFinished] = useState<Dayjs | null>(null)
  const [remark, setRemark] = useState('')
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')
  
  // New file upload states
  const [handOverDocFiles, setHandOverDocFiles] = useState<FileWithPreview[]>([])
  const [installationPhotoFiles, setInstallationPhotoFiles] = useState<FileWithPreview[]>([])
  const [testRunReportFiles, setTestRunReportFiles] = useState<FileWithPreview[]>([])
  const [othersFiles, setOthersFiles] = useState<FileWithPreview[]>([])
  const [isUploading, setIsUploading] = useState(false)
  
  const router = useRouter()
  const params = useParams()

  useEffect(() => {
    const fetchWorkOrder = async () => {
      const currentUser = getStoredUser()
      if (!currentUser) {
        router.push('/auth/login')
        return
      }

      setUser(currentUser)
      const id = params.id as string
       const queryParams: QueryParams = {
              limit: 1,
              offset: 0,
              orderBy: 'CreatedDate DESC',
              where: `Id='${id}'`,
            };
      try {
        const response = await apiClient.get<SalesforceQueryResponse<WorkOrderCustom>>('/workorders', queryParams);
        if (response.success && response.data) {
          const order = deserializeWorkOrderCustom(response.data.records[0])
          
          // Check if user has access to this work order
         // if (currentUser.role === 'sub_contractor' && order.refKey !== currentUser.refKey) {
           // router.push('/')
           // return
        //  }

          setWorkOrder(order)
          setActualStart(order.actualStart ? dayjs(order.actualStart) : null)
          setActualFinished(order.actualFinished ? dayjs(order.actualFinished) : null)
          setRemark(order.remark)
        } else {
          router.push('/')
          return
        }
      } catch (error) {
        console.error('Error fetching work order:', error)
        router.push('/')
        return
      } finally {
        setLoading(false)
      }
    }

    fetchWorkOrder()
  }, [router, params.id])

  const handleLogout = () => {
    logout()
    router.push('/auth/login')
  }

  const handleBack = () => {
    router.push('/')
  }

  const handleSubContractorUpdate = async () => {
    if (!workOrder || !user) return

    setIsUploading(true)
    setError('')

    try {
      // Convert files to base64 and create attachment objects
      const processFileAttachments = async (files: FileWithPreview[], type: WorkOrderAttachment['type']) => {
        const attachments: WorkOrderAttachment[] = []
        
        for (let i = 0; i < files.length; i++) {
          const file = files[i]
          const fileToProcess = file.compressed || file
          const base64 = await convertFileToBase64(fileToProcess)
          
          attachments.push({
            id: `${type}_${Date.now()}_${i}`,
            filename: fileToProcess.name,
            type,
            url: '', // Will be set by server after upload
            uploadedAt: new Date(),
            size: fileToProcess.size,
            base64
          })
        }
        
        return attachments
      }

      // Process all file types
      const handOverDocAttachments = await processFileAttachments(handOverDocFiles, 'hand_over_doc')
      const installationPhotoAttachments = await processFileAttachments(installationPhotoFiles, 'installation_photo')
      const testRunReportAttachments = await processFileAttachments(testRunReportFiles, 'test_run_report')
      const othersAttachments = await processFileAttachments(othersFiles, 'others')

      const updates: Partial<WorkOrderCustom> = {
        actualStart: actualStart?.toDate(),
        actualFinished: actualFinished?.toDate(),
        remark,
        status: 'waiting_install_admin',
        handOverDocAttachments: [...workOrder.handOverDocAttachments, ...handOverDocAttachments],
        installationPhotoAttachments: [...workOrder.installationPhotoAttachments, ...installationPhotoAttachments],
        testRunReportAttachments: [...workOrder.testRunReportAttachments, ...testRunReportAttachments],
        othersAttachments: [...workOrder.othersAttachments, ...othersAttachments]
      }

      // In a real implementation, you would send this to your Salesforce API
      // const response = await fetch('/api/salesforce/workorder', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ workOrderId: workOrder.id, updates })
      // })

      const response = await apiClient.patch(`/workorders/${workOrder.id}`, updates)
      if (response.success && response.data) {
        setWorkOrder(deserializeWorkOrderCustom(response.data))
        setSuccess('Work order updated successfully!')
        
        // Clear file states after successful upload
        setHandOverDocFiles([])
        setInstallationPhotoFiles([])
        setTestRunReportFiles([])
        setOthersFiles([])
      } else {
        setError('Failed to update work order')
      }
    } catch (error) {
      console.error('Error updating work order:', error)
      setError('Error uploading files. Please try again.')
    } finally {
      setIsUploading(false)
    }
  }

  const handleInstallAdminConfirm = async () => {
    if (!workOrder || !user) return

    const updates: Partial<WorkOrderCustom> = {
      status: 'waiting_credit_admin',
      installStaff: user.username
    }

    try {
      const response = await apiClient.patch(`/workorders/${workOrder.id}`, updates)
      if (response.success && response.data) {
        setWorkOrder(deserializeWorkOrderCustom(response.data))
        setSuccess('Status confirmed successfully!')
        setError('')
      } else {
        setError('Failed to confirm status')
      }
    } catch (error) {
      console.error('Error confirming status:', error)
      setError('Failed to confirm status')
    }
  }

  const handleCreditAdminUpdate = async () => {
    if (!workOrder || !user) return

    const updates: Partial<WorkOrderCustom> = {
      creditStaff: user.username
    }

    try {
      const response = await apiClient.patch(`/workorders/${workOrder.id}`, updates)
      if (response.success && response.data) {
        setWorkOrder(deserializeWorkOrderCustom(response.data))
        setSuccess('Document status updated successfully!')
        setError('')
      } else {
        setError('Failed to update document status')
      }
    } catch (error) {
      console.error('Error updating document status:', error)
      setError('Failed to update document status')
    }
  }

  const handleFileUpload = (type: 'work_report' | 'other') => {
    // Mock file upload - in real implementation, this would handle actual file upload
    setSuccess(`${type === 'work_report' ? 'Work report' : 'Other'} file uploaded successfully!`)
  }

  const canEditDates = user?.role === 'sub_contractor' && workOrder?.status === 'waiting_sub_contractor'
  const canConfirmInstall = user?.role === 'admin_install' && workOrder?.status === 'waiting_install_admin'
  const canUpdateCredit = user?.role === 'admin_credit' && workOrder?.status === 'waiting_credit_admin'

  if (loading) {
    return (
      <Container>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
          <Typography>Loading...</Typography>
        </Box>
      </Container>
    )
  }

  if (!workOrder) {
    return (
      <Container>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
          <Typography>Work order not found</Typography>
        </Box>
      </Container>
    )
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
        <AppBar position="static">
          <Toolbar>
            <Button color="inherit" onClick={handleBack} startIcon={<ArrowBackIcon />} sx={{ mr: 2 }}>
              Back
            </Button>
            <Typography color={"#FFFFFF"} variant="h6" component="div" sx={{ flexGrow: 1 }}>
              WorkOrder Details - {user?.role.replace('_', ' ').toUpperCase()}
            </Typography>
            <Typography variant="body2" sx={{ mr: 2 }}>
              Welcome, {user?.username}
            </Typography>
            <Button color="inherit" onClick={handleLogout} startIcon={<LogoutIcon />}>
              Logout
            </Button>
          </Toolbar>
        </AppBar>

        <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
          <Typography color={"#0066CC"} variant="h4" component="h1" gutterBottom>
            Work Order: {workOrder.woNo}
          </Typography>

          {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          <Grid container spacing={3}>
            {/* Basic Information */}
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Basic Information
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="textSecondary">WO No.</Typography>
                    <Typography variant="body1">{workOrder.woNo}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="textSecondary">Status</Typography>
                    <Chip
                      label={getStatusLabel(workOrder.status)}
                      color={getStatusColor(workOrder.status)}
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="textSecondary">Sub (Vendor)</Typography>
                    <Typography variant="body1">{workOrder.sub}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="textSecondary">Account (Customer)</Typography>
                    <Typography variant="body1">{workOrder.account}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="textSecondary">Created Date</Typography>
                    <Typography variant="body1">{workOrder.createdDate.toLocaleDateString()}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="textSecondary">Land No</Typography>
                    <Typography variant="body1">{workOrder.landNo}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="textSecondary">DO No</Typography>
                    <Typography variant="body1">{workOrder.doNo}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="textSecondary">DO Date</Typography>
                    <Typography variant="body1">{workOrder.doDate.toLocaleDateString()}</Typography>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>

            {/* Schedule Information */}
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Schedule Information
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="textSecondary">Plan Start</Typography>
                    <Typography variant="body1">{workOrder.planStart.toLocaleDateString()}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="textSecondary">Plan Finished</Typography>
                    <Typography variant="body1">{workOrder.planFinished.toLocaleDateString()}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="textSecondary">Actual Start</Typography>
                    {canEditDates ? (
                      <DatePicker
                        value={actualStart}
                        onChange={setActualStart}
                        slotProps={{ textField: { size: 'small', fullWidth: true } }}
                      />
                    ) : (
                      <Typography variant="body1">
                        {workOrder.actualStart ? workOrder.actualStart.toLocaleDateString() : 'Not set'}
                      </Typography>
                    )}
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="textSecondary">Actual Finished</Typography>
                    {canEditDates ? (
                      <DatePicker
                        value={actualFinished}
                        onChange={setActualFinished}
                        slotProps={{ textField: { size: 'small', fullWidth: true } }}
                      />
                    ) : (
                      <Typography variant="body1">
                        {workOrder.actualFinished ? workOrder.actualFinished.toLocaleDateString() : 'Not set'}
                      </Typography>
                    )}
                  </Grid>
                </Grid>
              </Paper>
            </Grid>

            {/* Models and Serial Numbers */}
            <Grid item xs={12}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Models and Serial Numbers
                </Typography>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Model</TableCell>
                        <TableCell>Serial Number</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {workOrder.models.map((model) => (
                        <TableRow key={model.id}>
                          <TableCell>{model.model}</TableCell>
                          <TableCell>{model.serialNo}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            </Grid>

            {/* File Upload Sections - Only show for SubContractors who can edit */}
            {canEditDates && (
              <>
                {/* Hand Over Document */}
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 3 }}>
                    <FileUploadZone
                      uploadType="hand_over_doc"
                      files={handOverDocFiles}
                      onFilesChange={setHandOverDocFiles}
                      disabled={isUploading}
                      existingFilesCount={workOrder.handOverDocAttachments.length}
                    />
                  </Paper>
                </Grid>

                {/* Installation Photos */}
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 3 }}>
                    <FileUploadZone
                      uploadType="installation_photo"
                      files={installationPhotoFiles}
                      onFilesChange={setInstallationPhotoFiles}
                      disabled={isUploading}
                      existingFilesCount={workOrder.installationPhotoAttachments.length}
                    />
                  </Paper>
                </Grid>

                {/* Test Run Report */}
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 3 }}>
                    <FileUploadZone
                      uploadType="test_run_report"
                      files={testRunReportFiles}
                      onFilesChange={setTestRunReportFiles}
                      disabled={isUploading}
                      existingFilesCount={workOrder.testRunReportAttachments.length}
                    />
                  </Paper>
                </Grid>

                {/* Others */}
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 3 }}>
                    <FileUploadZone
                      uploadType="others"
                      files={othersFiles}
                      onFilesChange={setOthersFiles}
                      disabled={isUploading}
                      existingFilesCount={workOrder.othersAttachments.length}
                    />
                  </Paper>
                </Grid>
              </>
            )}

            {/* Existing Attachments Display - Show for all users */}
            {(workOrder.handOverDocAttachments.length > 0 || 
              workOrder.installationPhotoAttachments.length > 0 || 
              workOrder.testRunReportAttachments.length > 0 || 
              workOrder.othersAttachments.length > 0 ||
              workOrder.workReportAttachments.length > 0 ||
              workOrder.otherAttachments.length > 0) && (
              <Grid item xs={12}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Uploaded Attachments
                  </Typography>
                  <Grid container spacing={2}>
                    {/* Hand Over Documents */}
                    {workOrder.handOverDocAttachments.length > 0 && (
                      <Grid item xs={12} md={6}>
                        <Typography color={"#0066CC"} variant="subtitle2" gutterBottom>
                          Hand Over Documents
                        </Typography>
                        <List dense>
                          {workOrder.handOverDocAttachments.map((attachment) => (
                            <ListItem key={attachment.id}>
                              <ListItemIcon>
                                <AttachFileIcon />
                              </ListItemIcon>
                              <ListItemText
                                primary={attachment.filename}
                                secondary={`Uploaded: ${attachment.uploadedAt.toLocaleDateString()}`}
                              />
                            </ListItem>
                          ))}
                        </List>
                      </Grid>
                    )}

                    {/* Installation Photos */}
                    {workOrder.installationPhotoAttachments.length > 0 && (
                      <Grid item xs={12} md={6}>
                        <Typography color={"#0066CC"} variant="subtitle2" gutterBottom>
                          Installation Photos
                        </Typography>
                        <List dense>
                          {workOrder.installationPhotoAttachments.map((attachment) => (
                            <ListItem key={attachment.id}>
                              <ListItemIcon>
                                <AttachFileIcon />
                              </ListItemIcon>
                              <ListItemText
                                primary={attachment.filename}
                                secondary={`Uploaded: ${attachment.uploadedAt.toLocaleDateString()}`}
                              />
                            </ListItem>
                          ))}
                        </List>
                      </Grid>
                    )}

                    {/* Test Run Reports */}
                    {workOrder.testRunReportAttachments.length > 0 && (
                      <Grid item xs={12} md={6}>
                        <Typography color={"#0066CC"} variant="subtitle2" gutterBottom>
                          Test Run Reports
                        </Typography>
                        <List dense>
                          {workOrder.testRunReportAttachments.map((attachment) => (
                            <ListItem key={attachment.id}>
                              <ListItemIcon>
                                <AttachFileIcon />
                              </ListItemIcon>
                              <ListItemText
                                primary={attachment.filename}
                                secondary={`Uploaded: ${attachment.uploadedAt.toLocaleDateString()}`}
                              />
                            </ListItem>
                          ))}
                        </List>
                      </Grid>
                    )}

                    {/* Others */}
                    {workOrder.othersAttachments.length > 0 && (
                      <Grid item xs={12} md={6}>
                        <Typography color={"#0066CC"} variant="subtitle2" gutterBottom>
                          Other Documents
                        </Typography>
                        <List dense>
                          {workOrder.othersAttachments.map((attachment) => (
                            <ListItem key={attachment.id}>
                              <ListItemIcon>
                                <AttachFileIcon />
                              </ListItemIcon>
                              <ListItemText
                                primary={attachment.filename}
                                secondary={`Uploaded: ${attachment.uploadedAt.toLocaleDateString()}`}
                              />
                            </ListItem>
                          ))}
                        </List>
                      </Grid>
                    )}

                    {/* Legacy Work Report Attachments */}
                    {workOrder.workReportAttachments.length > 0 && (
                      <Grid item xs={12} md={6}>
                        <Typography variant="subtitle2" gutterBottom>
                          Work Report Attachments (Legacy)
                        </Typography>
                        <List dense>
                          {workOrder.workReportAttachments.map((attachment) => (
                            <ListItem key={attachment.id}>
                              <ListItemIcon>
                                <AttachFileIcon />
                              </ListItemIcon>
                              <ListItemText
                                primary={attachment.filename}
                                secondary={`Uploaded: ${attachment.uploadedAt.toLocaleDateString()}`}
                              />
                            </ListItem>
                          ))}
                        </List>
                      </Grid>
                    )}

                    {/* Legacy Other Attachments */}
                    {workOrder.otherAttachments.length > 0 && (
                      <Grid item xs={12} md={6}>
                        <Typography variant="subtitle2" gutterBottom>
                          Other Attachments (Legacy)
                        </Typography>
                        <List dense>
                          {workOrder.otherAttachments.map((attachment) => (
                            <ListItem key={attachment.id}>
                              <ListItemIcon>
                                <AttachFileIcon />
                              </ListItemIcon>
                              <ListItemText
                                primary={attachment.filename}
                                secondary={`Uploaded: ${attachment.uploadedAt.toLocaleDateString()}`}
                              />
                            </ListItem>
                          ))}
                        </List>
                      </Grid>
                    )}
                  </Grid>
                </Paper>
              </Grid>
            )}

            {/* Remarks and Actions */}
            <Grid item xs={12}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Remarks and Actions
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    {canEditDates ? (
                      <TextField
                        fullWidth
                        label="Remark"
                        multiline
                        rows={3}
                        value={remark}
                        onChange={(e) => setRemark(e.target.value)}
                      />
                    ) : (
                      <>
                        <Typography variant="body2" color="textSecondary">Remark</Typography>
                        <Typography variant="body1">{workOrder.remark || 'No remarks'}</Typography>
                      </>
                    )}
                  </Grid>
                  {workOrder.installStaff && (
                    <Grid item xs={6}>
                      <Typography variant="body2" color="textSecondary">Install Staff</Typography>
                      <Typography variant="body1">{workOrder.installStaff}</Typography>
                    </Grid>
                  )}
                  {workOrder.creditStaff && (
                    <Grid item xs={6}>
                      <Typography variant="body2" color="textSecondary">Credit Staff</Typography>
                      <Typography variant="body1">{workOrder.creditStaff}</Typography>
                    </Grid>
                  )}
                </Grid>

                <Divider sx={{ my: 3 }} />

                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  {canEditDates && (
                    <Button
                      variant="contained"
                      startIcon={<EditIcon />}
                      onClick={handleSubContractorUpdate}
                      disabled={isUploading}
                    >
                      {isUploading ? 'Uploading...' : 'Update Work Order'}
                    </Button>
                  )}
                  {canConfirmInstall && (
                    <Button
                      variant="contained"
                      color="success"
                      startIcon={<CheckCircleIcon />}
                      onClick={handleInstallAdminConfirm}
                    >
                      Confirm Installation
                    </Button>
                  )}
                  {canUpdateCredit && (
                    <Button
                      variant="contained"
                      color="info"
                      startIcon={<EditIcon />}
                      onClick={handleCreditAdminUpdate}
                    >
                      Update Document Status
                    </Button>
                  )}
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </Container>
    </LocalizationProvider>
  )
}
