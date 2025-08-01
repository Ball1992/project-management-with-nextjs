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
  Divider,
  CircularProgress
} from '@mui/material'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import 'dayjs/locale/th'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import LogoutIcon from '@mui/icons-material/Logout'
import AttachFileIcon from '@mui/icons-material/AttachFile'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import EditIcon from '@mui/icons-material/Edit'
import PrintIcon from '@mui/icons-material/Print'
import DownloadIcon from '@mui/icons-material/Download'
import dayjs, { Dayjs } from 'dayjs'
import jsPDF from 'jspdf'
import { getStoredUser, logout, type User } from '@/lib/auth'
import { salesforceDEVAPI } from '@/lib/salesforce-server-dev'
import { WorkOrderCustom, getStatusLabel, getStatusColor, WorkOrderAttachment } from '@/types/workorderCustom'
import { FileUploadZone } from '@/components/FileUpload'
import { convertFileToBase64 } from '@/utils/imageCompression'
import { apiClient } from '@/utils/api-client'
import { MemberService } from '@/services/MemberService'
import { deserializeWorkOrderCustom } from '@/helpers/helpersWorkOrders'
import { DODataParams, QueryParams, SalesforceQueryResponse } from '@/types/salesforce'
import { DOModel } from '@/types/do'
import { loadThaiFont } from '@/utils/fontLoader'
import ImagePreview from '@/components/ImagePreview'
import { formatDateForDisplay, getCurrentDateFormatted } from '@/utils/dateFormatter'

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
  
  // Attachment states for admin users
  const [attachmentData, setAttachmentData] = useState<any>(null)
  const [loadingAttachments, setLoadingAttachments] = useState(false)
  const [downloadingAttachments, setDownloadingAttachments] = useState<Set<string>>(new Set())
  
  const router = useRouter()
  const params = useParams()

  useEffect(() => {
    const fetchWorkOrder = async () => {
      const currentUser = getStoredUser()
      if (!currentUser) {
        router.push('/auth/login')
        return
      }

       const token = localStorage.getItem('token')
          if (!token) {
            setError('Authentication token not found. Please login again.')
            return
          }

      setUser(currentUser)
      const id = params.id as string
       const queryParams: QueryParams = {
              limit: 1,
              offset: 0,
              orderBy: 'CreatedDate DESC',
              where: `AND Id='${id}'`,
              id:`${id}`,
              jwtToken:token
            };
      try {
        const response = await apiClient.get<SalesforceQueryResponse<WorkOrderCustom>>('/workorders', queryParams);
        
        if (response.success && response.data) {
          const order = deserializeWorkOrderCustom(response.data.records[0])
          
          // Check if user has access to this work order
          if (currentUser.role === 'sub_contractor' && order.refKey !== currentUser.refKey) {
            router.push('/')
            return
          }

          setWorkOrder(order)
          setActualStart(order.actualStart ? dayjs(order.actualStart) : null)
          setActualFinished(order.actualFinished ? dayjs(order.actualFinished) : null)
          setRemark(order.remark)
           const queryDoParams: DODataParams = {
              jwtToken:token,
              doNo: '4010002949'
            };
          
        //  const responseDO = await apiClient.get<SalesforceQueryResponse<DOModel>>('/do', queryDoParams);
        //   if (responseDO.success && responseDO.data) {
        //      console.log('responseDO')
        //      console.log(responseDO)
        //   }
          
          
        } else {
          router.push('/')
          return
        }
      } catch (error) {
        // console.error('Error fetching work order:', error)
        router.push('/')
        return
      } finally {
        setLoading(false)
      }
    }

    fetchWorkOrder()
  }, [router, params.id])

  // Fetch attachments when work order status is waiting_install_admin or waiting_credit_admin
  useEffect(() => {
    if (workOrder && user && 
        (workOrder.status === 'waiting_install_admin' || workOrder.status === 'waiting_credit_admin') &&
        (user.role === 'admin_install' || user.role === 'admin_credit' || user.role === 'sub_contractor')) {
      fetchWorkOrderAttachments()
    }
  }, [workOrder, user])

  const handleLogout = () => {
    logout()
    router.push('/auth/login')
  }

  const handleBack = () => {
    router.push('/')
  }

  const handleSubContractorUpdate = async () => {
    if (!workOrder || !user) return

    // Validate required fields
    if (!actualStart || !actualFinished) {
      setError('กรุณากรอกวันที่เริ่มงานจริง (Actual Start) และวันที่เสร็จงานจริง (Actual Finished)')
      return
    }

    // Validate that actualFinished is not before actualStart
    if (actualFinished.isBefore(actualStart)) {
      setError('วันที่เสร็จงานจริงต้องไม่เป็นวันก่อนวันที่เริ่มงานจริง')
      return
    }

    setIsUploading(true)
    setError('')

    try {
      // Get JWT token from localStorage
      const token = localStorage.getItem('token')
      if (!token) {
        setError('Authentication token not found. Please login again.')
        return
      }

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

      const updates = {
        workOrderId: workOrder.id,
        appointmentId: workOrder.appointmentId,
        actualStart: actualStart?.toDate(),
        actualFinished: actualFinished?.toDate(),
        remark,
        status: 'waiting_install_admin',
        handOverDocAttachments: [...workOrder.handOverDocAttachments, ...handOverDocAttachments],
        installationPhotoAttachments: [...workOrder.installationPhotoAttachments, ...installationPhotoAttachments],
        testRunReportAttachments: [...workOrder.testRunReportAttachments, ...testRunReportAttachments],
        othersAttachments: [...workOrder.othersAttachments, ...othersAttachments]
      }

      // Call the API route
      const response = await fetch('/api/workorders/createorupdate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          workOrderData: updates,
          token: token
        })
      })

      const result = await response.json()
      
      if (result.success) {
        // Show success notification
        setSuccess('Work order updated successfully!')
        
        // Clear file states after successful upload
        setHandOverDocFiles([])
        setInstallationPhotoFiles([])
        setTestRunReportFiles([])
        setOthersFiles([])

        // Fetch data again to get the latest information
        const id = params.id as string
        const queryParams: QueryParams = {
          limit: 1,
          offset: 0,
          orderBy: 'CreatedDate DESC',
          where: `AND Id='${id}'`,
        };

        const fetchResponse = await apiClient.get<SalesforceQueryResponse<WorkOrderCustom>>('/workorders', queryParams);
        if (fetchResponse.success && fetchResponse.data) {
          const order = deserializeWorkOrderCustom(fetchResponse.data.records[0])
          
          // Admin roles have access to all work orders, sub_contractors are filtered by refKey
          const currentUser = getStoredUser()
          if (currentUser && currentUser.role === 'sub_contractor' && order.refKey !== currentUser.refKey) {
            router.push('/')
            return
          }

          setWorkOrder(order)
          setActualStart(order.actualStart ? dayjs(order.actualStart) : null)
          setActualFinished(order.actualFinished ? dayjs(order.actualFinished) : null)
          setRemark(order.remark)
        } else {
          setError('Failed to fetch updated work order data')
        }
      } else {
        // Handle backend validation errors
        setError(result.error || 'Failed to update work order')
      }
    } catch (error) {
      // console.error('Error updating work order:', error)
      setError('Error uploading files. Please try again.')
    } finally {
      setIsUploading(false)
    }
  }

  const handleInstallAdminConfirm = async () => {
     if (!workOrder || !user) return

   
    setIsUploading(true)
    setError('')

    try {
      // Get JWT token from localStorage
      const token = localStorage.getItem('token')
      if (!token) {
        setError('Authentication token not found. Please login again.')
        return
      }

   
    
      const updates = {
        workOrderId: workOrder.id,
        appointmentId: workOrder.appointmentId,
        currentStatusId: "Done (Operation)",
        statusId: "Closed",
      }

      // Call the API route
      const response = await fetch('/api/workorders/updateStatus', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          workOrderData: updates,
          token: token
        })
      })

      const result = await response.json()
      
      if (result.success) {
        // Show success notification
        setSuccess('Work order updated successfully!')
        
        // Clear file states after successful upload
        setHandOverDocFiles([])
        setInstallationPhotoFiles([])
        setTestRunReportFiles([])
        setOthersFiles([])

        // Fetch data again to get the latest information
        const id = params.id as string
        const queryParams: QueryParams = {
          limit: 1,
          offset: 0,
          orderBy: 'CreatedDate DESC',
          where: `AND Id='${id}'`,
        };

        const fetchResponse = await apiClient.get<SalesforceQueryResponse<WorkOrderCustom>>('/workorders', queryParams);
        if (fetchResponse.success && fetchResponse.data) {
          const order = deserializeWorkOrderCustom(fetchResponse.data.records[0])
          
          // Check if user has access to this work order
          // if (currentUser.role === 'sub_contractor' && order.refKey !== currentUser.refKey) {
          //   router.push('/')
          //   return
          // }

          setWorkOrder(order)
          setActualStart(order.actualStart ? dayjs(order.actualStart) : null)
          setActualFinished(order.actualFinished ? dayjs(order.actualFinished) : null)
          setRemark(order.remark)
        } else {
          setError('Failed to fetch updated work order data')
        }
      } else {
        // Handle backend validation errors
        setError(result.error || 'Failed to update work order')
      }
    } catch (error) {
      // console.error('Error updating work order:', error)
      setError('Error uploading files. Please try again.')
    } finally {
      setIsUploading(false)
    }
  }

  const handleCreditAdminUpdate = async () => {
       if (!workOrder || !user) return

   
    setIsUploading(true)
    setError('')

    try {
      // Get JWT token from localStorage
      const token = localStorage.getItem('token')
      if (!token) {
        setError('Authentication token not found. Please login again.')
        return
      }

   
    
      const updates = {
        workOrderId: workOrder.id,
        appointmentId: workOrder.appointmentId,
        currentStatusId: "Closed",
        statusId: "Closed",
      }

      // Call the API route
      const response = await fetch('/api/workorders/updateStatus', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          workOrderData: updates,
          token: token
        })
      })

      const result = await response.json()
      
      if (result.success) {
        // Show success notification
        setSuccess('Work order updated successfully!')
        
        // Clear file states after successful upload
        setHandOverDocFiles([])
        setInstallationPhotoFiles([])
        setTestRunReportFiles([])
        setOthersFiles([])

        // Fetch data again to get the latest information
        const id = params.id as string
        const queryParams: QueryParams = {
          limit: 1,
          offset: 0,
          orderBy: 'CreatedDate DESC',
          where: `AND Id='${id}'`,
        };

        const fetchResponse = await apiClient.get<SalesforceQueryResponse<WorkOrderCustom>>('/workorders', queryParams);
        if (fetchResponse.success && fetchResponse.data) {
          const order = deserializeWorkOrderCustom(fetchResponse.data.records[0])
          
          // Check if user has access to this work order
          // if (currentUser.role === 'sub_contractor' && order.refKey !== currentUser.refKey) {
          //   router.push('/')
          //   return
          // }

          setWorkOrder(order)
          setActualStart(order.actualStart ? dayjs(order.actualStart) : null)
          setActualFinished(order.actualFinished ? dayjs(order.actualFinished) : null)
          setRemark(order.remark)
        } else {
          setError('Failed to fetch updated work order data')
        }
      } else {
        // Handle backend validation errors
        setError(result.error || 'Failed to update work order')
      }
    } catch (error) {
      // console.error('Error updating work order:', error)
      setError('Error uploading files. Please try again.')
    } finally {
      setIsUploading(false)
    }
  }

  const handleFileUpload = (type: 'work_report' | 'other') => {
    // Mock file upload - in real implementation, this would handle actual file upload
    setSuccess(`${type === 'work_report' ? 'Work report' : 'Other'} file uploaded successfully!`)
  }

  // Fetch attachments for admin users when status is waiting_install_admin or waiting_credit_admin
  const fetchWorkOrderAttachments = async () => {
    if (!workOrder || !user) return

    const token = localStorage.getItem('token')
    if (!token) {
      setError('Authentication token not found. Please login again.')
      return
    }

    setLoadingAttachments(true)
    setError('')

    try {
      const response = await apiClient.get(`/workorders/${workOrder.id}/attachments`, {
        jwtToken: token
      })
      
      if (response.success && response.data) {
        setAttachmentData(response.data)
        // Update remark from attachment data if available
        if (response.data && typeof response.data === 'object' && 'remark' in response.data && response.data.remark) {
          setRemark(response.data.remark as string)
        }
      //  setSuccess('Attachments loaded successfully!')
      } else {
        setError(response.error || 'Failed to fetch attachments')
      }
    } catch (error) {
      console.error('Error fetching attachments:', error)
      setError('Failed to fetch attachments. Please try again.')
    } finally {
      setLoadingAttachments(false)
    }
  }

  // Download handover documents using API route
  const handleDownloadHandOverDocuments = async () => {
    if (!workOrder || !user) return

    const token = localStorage.getItem('token')
    if (!token) {
      setError('Authentication token not found. Please login again.')
      return
    }

    setIsUploading(true)
    setError('')
    setSuccess('')

    try {
      console.log('Frontend: Starting handover documents download for workOrder:', workOrder.id)
      
      // Use the API route similar to attachment download
      const downloadUrl = `/api/workorders/handover-documents/download/${workOrder.id}?jwtToken=${encodeURIComponent(token)}`
      console.log('Frontend: Download URL:', downloadUrl)
      
      // Use fetch to get the file as blob from our API route
      const response = await fetch(downloadUrl, {
        method: 'GET',
        headers: {
          'Accept': '*/*',
        },
      })
      
      console.log('Frontend: Response status:', response.status)
      console.log('Frontend: Response statusText:', response.statusText)
      console.log('Frontend: Response headers:', Object.fromEntries(response.headers.entries()))
      
      if (response.ok) {
        const contentType = response.headers.get('content-type')
        const contentLength = response.headers.get('content-length')
        const contentDisposition = response.headers.get('content-disposition')
        
        console.log('Frontend: Content-Type:', contentType)
        console.log('Frontend: Content-Length:', contentLength)
        console.log('Frontend: Content-Disposition:', contentDisposition)
        
        // Check if response is actually JSON (error response)
        if (contentType && contentType.includes('application/json')) {
          try {
            const errorData = await response.json()
            console.error('Frontend: Received JSON error response:', errorData)
            setError(errorData.error || 'Server returned an error response')
            return
          } catch (parseError) {
            console.error('Frontend: Failed to parse JSON error response:', parseError)
            // If we can't parse as JSON, treat as binary data and continue
          }
        }
        
        const blob = await response.blob()
        console.log('Frontend: Blob created - size:', blob.size, 'type:', blob.type)
        
        if (blob.size === 0) {
          setError('Downloaded file is empty. Please check if the file exists.')
          return
        }
        
        // Extract filename from Content-Disposition header if available
        let downloadFilename = `handover_documents_${workOrder.woNo}.pdf`
        if (contentDisposition) {
          const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/)
          if (filenameMatch && filenameMatch[1]) {
            downloadFilename = filenameMatch[1].replace(/['"]/g, '')
            downloadFilename = decodeURIComponent(downloadFilename)
          }
        }
        
        console.log('Frontend: Using filename for download:', downloadFilename)
        
        const url = window.URL.createObjectURL(blob)
        
        // Create a temporary link element and trigger download
        const link = document.createElement('a')
        link.href = url
        link.download = downloadFilename
        link.style.display = 'none'
        document.body.appendChild(link)
        
        console.log('Frontend: Triggering handover documents download...')
        link.click()
        
        // Clean up
        setTimeout(() => {
          document.body.removeChild(link)
          window.URL.revokeObjectURL(url)
          console.log('Frontend: Handover documents download cleanup completed')
        }, 100)
        
        setSuccess(`Handover documents "${downloadFilename}" downloaded successfully!`)
      } else {
        console.error('Frontend: Download failed with status:', response.status, response.statusText)
        
        // Try to get error details from response
        const contentType = response.headers.get('content-type')
        if (contentType && contentType.includes('application/json')) {
          try {
            const errorData = await response.json()
            console.error('Frontend: Error data:', errorData)
            setError(errorData.error || `Failed to download handover documents (Status: ${response.status})`)
            
            // Log additional details if available
            if (errorData.details) {
              console.error('Frontend: Error details:', errorData.details)
            }
          } catch (parseError) {
            console.error('Frontend: Could not parse error response:', parseError)
            setError(`Failed to download handover documents (Status: ${response.status} - ${response.statusText})`)
          }
        } else {
          // Non-JSON error response
          const errorText = await response.text()
          console.error('Frontend: Error response text:', errorText)
          setError(`Failed to download handover documents (Status: ${response.status} - ${response.statusText})`)
        }
      }
    } catch (error: any) {
      console.error('Frontend: Error downloading handover documents:', error)
      console.error('Frontend: Error stack:', error.stack)
      
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        setError('Network error: Unable to connect to the server. Please check your connection.')
      } else if (error.name === 'AbortError') {
        setError('Download was cancelled or timed out. Please try again.')
      } else {
        setError(`Failed to download handover documents: ${error.message}`)
      }
    } finally {
      setIsUploading(false)
    }
  }

  // Download attachment by ID
  const handleDownloadAttachment = async (attachmentId: string, filename: string) => {
    const token = localStorage.getItem('token')
    if (!token) {
      setError('Authentication token not found. Please login again.')
      return
    }

    // Add to downloading set
    setDownloadingAttachments(prev => new Set(prev).add(attachmentId))

    // Clear previous messages
    setError('')
    setSuccess('')

    try {
      console.log('Frontend: Starting download for attachment:', attachmentId, 'filename:', filename)
      
      // Show loading state
      const downloadUrl = `/api/workorders/attachments/download/${attachmentId}?jwtToken=${encodeURIComponent(token)}&filename=${encodeURIComponent(filename)}`
      console.log('Frontend: Download URL:', downloadUrl)
      
      // Use fetch to get the file as blob from our API route
      const response = await fetch(downloadUrl, {
        method: 'GET',
        headers: {
          'Accept': '*/*',
        },
      })
      
      console.log('Frontend: Response status:', response.status)
      console.log('Frontend: Response statusText:', response.statusText)
      console.log('Frontend: Response headers:', Object.fromEntries(response.headers.entries()))
      
      if (response.ok) {
        const contentType = response.headers.get('content-type')
        const contentLength = response.headers.get('content-length')
        const contentDisposition = response.headers.get('content-disposition')
        
        console.log('Frontend: Content-Type:', contentType)
        console.log('Frontend: Content-Length:', contentLength)
        console.log('Frontend: Content-Disposition:', contentDisposition)
        
        // Check if response is actually JSON (error response)
        if (contentType && contentType.includes('application/json')) {
          try {
            const errorData = await response.json()
            console.error('Frontend: Received JSON error response:', errorData)
            setError(errorData.error || 'Server returned an error response')
            return
          } catch (parseError) {
            console.error('Frontend: Failed to parse JSON error response:', parseError)
            // If we can't parse as JSON, treat as binary data and continue
          }
        }
        
        const blob = await response.blob()
        console.log('Frontend: Blob created - size:', blob.size, 'type:', blob.type)
        
        if (blob.size === 0) {
          setError('Downloaded file is empty. Please check if the file exists.')
          return
        }
        
        // Extract filename from Content-Disposition header if available
        let downloadFilename = filename
        if (contentDisposition) {
          const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/)
          if (filenameMatch && filenameMatch[1]) {
            downloadFilename = filenameMatch[1].replace(/['"]/g, '')
            downloadFilename = decodeURIComponent(downloadFilename)
          }
        }
        
        console.log('Frontend: Using filename for download:', downloadFilename)
        
        const url = window.URL.createObjectURL(blob)
        
        // Create a temporary link element and trigger download
        const link = document.createElement('a')
        link.href = url
        link.download = downloadFilename
        link.style.display = 'none'
        document.body.appendChild(link)
        
        console.log('Frontend: Triggering download...')
        link.click()
        
        // Clean up
        setTimeout(() => {
          document.body.removeChild(link)
          window.URL.revokeObjectURL(url)
          console.log('Frontend: Download cleanup completed')
        }, 100)
        
       // setSuccess(`File "${downloadFilename}" downloaded successfully!`)
      } else {
        console.error('Frontend: Download failed with status:', response.status, response.statusText)
        
        // Try to get error details from response
        const contentType = response.headers.get('content-type')
        if (contentType && contentType.includes('application/json')) {
          try {
            const errorData = await response.json()
            console.error('Frontend: Error data:', errorData)
            setError(errorData.error || `Failed to download file (Status: ${response.status})`)
            
            // Log additional details if available
            if (errorData.details) {
              console.error('Frontend: Error details:', errorData.details)
            }
          } catch (parseError) {
            console.error('Frontend: Could not parse error response:', parseError)
            setError(`Failed to download file (Status: ${response.status} - ${response.statusText})`)
          }
        } else {
          // Non-JSON error response
          const errorText = await response.text()
          console.error('Frontend: Error response text:', errorText)
          setError(`Failed to download file (Status: ${response.status} - ${response.statusText})`)
        }
      }
    } catch (error: any) {
      console.error('Frontend: Error downloading attachment:', error)
      console.error('Frontend: Error stack:', error.stack)
      
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        setError('Network error: Unable to connect to the server. Please check your connection.')
      } else if (error.name === 'AbortError') {
        setError('Download was cancelled or timed out. Please try again.')
      } else {
        setError(`Failed to download file: ${error.message}`)
      }
    } finally {
      // Remove from downloading set
      setDownloadingAttachments(prev => {
        const newSet = new Set(prev)
        newSet.delete(attachmentId)
        return newSet
      })
    }
  }

  const handlePrintPDF = async () => {
    if (!workOrder) return

    try {
      const pdf = new jsPDF('p', 'mm', 'a4')
      
      // Load Thai fonts
      let useThaiFont = false
      try {
        const fonts = await loadThaiFont()
        
        // Add Thai fonts to PDF using base64
        pdf.addFileToVFS('THSarabunNew.ttf', fonts.normal)
        pdf.addFont('THSarabunNew.ttf', 'THSarabunNew', 'normal')
        
        pdf.addFileToVFS('THSarabunNew-Bold.ttf', fonts.bold)
        pdf.addFont('THSarabunNew-Bold.ttf', 'THSarabunNew', 'bold')
        
        // Set default font to normal Thai font
        pdf.setFont('THSarabunNew', 'normal')
        useThaiFont = true
      } catch (fontError) {
        console.warn('Could not load Thai fonts, using default font:', fontError)
        // Continue with default font
        pdf.setFont('helvetica')
        useThaiFont = false
      }

      // Page margins
      const margin = 20
      const pageWidth = 210
      const pageHeight = 297
      
      // Helper function to load image as base64
      const loadImageAsBase64 = (src: string): Promise<string> => {
        return new Promise((resolve, reject) => {
          const img = new Image()
          img.crossOrigin = 'anonymous'
          img.onload = () => {
            const canvas = document.createElement('canvas')
            const ctx = canvas.getContext('2d')
            if (!ctx) {
              reject(new Error('Could not get canvas context'))
              return
            }
            canvas.width = img.width
            canvas.height = img.height
            ctx.drawImage(img, 0, 0)
            resolve(canvas.toDataURL('image/png'))
          }
          img.onerror = () => reject(new Error(`Failed to load image: ${src}`))
          img.src = src
        })
      }

      // Add logos at the top
      try {
        const logoBase64 = await loadImageAsBase64('/images/logo.png')
        pdf.addImage(logoBase64, 'PNG', margin, 10, 25, 12)
      } catch (error) {
        console.warn('Could not load logo image:', error)
      }

      try {
        const pisonkongBase64 = await loadImageAsBase64('/images/pisonkong.png')
        pdf.addImage(pisonkongBase64, 'PNG', pageWidth - margin - 25, 10, 25, 12)
      } catch (error) {
        console.warn('Could not load pisonkong image:', error)
      }
      
      // Header
      pdf.setFontSize(16)
      if (useThaiFont) {
        pdf.setFont('THSarabunNew', 'bold')
      } else {
        pdf.setFont('helvetica', 'bold')
      }
      pdf.text('หนังสือส่งมอบงานติดตั้งเครื่องปรับอากาศ "ไดกิ้น"', pageWidth/2, 30, { align: 'center' })
      
      // Customer and project info
      pdf.setFontSize(14)
      if (useThaiFont) {
        pdf.setFont('THSarabunNew', 'normal')
      } else {
        pdf.setFont('helvetica', 'normal')
      }
      let yPos = 45
      
      // First row
      pdf.text(`ลูกค้า : ${workOrder.account}`, margin, yPos)
      pdf.text(`โครงการ : ${workOrder.subject}`, 110, yPos)
      yPos += 10
      
      // Second row
      pdf.text(`บ้านเลขที่ : ${workOrder.landNo}`, margin, yPos)
      pdf.text(`ผู้ติดตั้ง : ${workOrder.installStaff || workOrder.sub}`, 110, yPos)
      yPos += 10
      
      // Third row
      pdf.text('เบอร์โทรศัพท์ : ..........................................', margin, yPos)
      pdf.text('โทร : ................................................', 110, yPos)
      yPos += 10
      
      // Date
      pdf.text(`วันที่ : ${new Date().toLocaleDateString('th-TH')}`, margin, yPos)
      yPos += 15
      
      // Description
      const description1 = 'บริษัทสยามไดกิ้นเซลส์ จำกัด ได้ดำเนินการติดตั้งเครื่องปรับอากาศรุ่นดังกล่าวเสร็จสิ้นเป็นที่เรียบร้อยแล้ว'
      const description2 = 'และจึงเรียนมาเพื่อขอส่งมอบงานติดตั้งเครื่องปรับอากาศในส่วนดังกล่าว'
      
      // Split text properly for Thai font
      const splitText1 = pdf.splitTextToSize(description1, pageWidth - 2 * margin)
      const splitText2 = pdf.splitTextToSize(description2, pageWidth - 2 * margin)
      
      pdf.text(splitText1, margin, yPos)
      yPos += splitText1.length * 6
      pdf.text(splitText2, margin, yPos)
      yPos += splitText2.length * 6 + 10
      
      // Standard installation note with background (above table)
      const standardNote = 'มาตรฐานการติดตั้งเครื่องปรับอากาศ ความยาวท่อน้ำยาพร้อมรางครอบท่อยาวไม่เกิน 5 เมตร'
      const splitStandardNote = pdf.splitTextToSize(standardNote, pageWidth - 2 * margin - 4)
      const standardNoteHeight = splitStandardNote.length * 6 + 4
      
      // Draw background for standard note
      pdf.setFillColor(240, 240, 240) // Light gray background
      pdf.rect(margin, yPos, pageWidth - 2 * margin, standardNoteHeight, 'F')
      pdf.rect(margin, yPos, pageWidth - 2 * margin, standardNoteHeight, 'S') // Border
      
      if (useThaiFont) {
        pdf.setFont('THSarabunNew', 'normal')
      } else {
        pdf.setFont('helvetica', 'normal')
      }
      pdf.text(splitStandardNote, margin + 2, yPos + 4)
      yPos += standardNoteHeight + 2
      
      // Table header with borders
      const tableStartY = yPos
      const colWidths = [15, 80, 25, 50] // ลำดับ, รายละเอียด, จำนวน/ชุด, หมายเหตุ
      const rowHeight = 10
      
      if (useThaiFont) {
        pdf.setFont('THSarabunNew', 'bold')
      } else {
        pdf.setFont('helvetica', 'bold')
      }
      
      // Draw table header
      pdf.rect(margin, yPos, colWidths[0], rowHeight)
      pdf.rect(margin + colWidths[0], yPos, colWidths[1], rowHeight)
      pdf.rect(margin + colWidths[0] + colWidths[1], yPos, colWidths[2], rowHeight)
      pdf.rect(margin + colWidths[0] + colWidths[1] + colWidths[2], yPos, colWidths[3], rowHeight)
      
      // Use Thai font for table headers with proper encoding
      if (useThaiFont) {
        pdf.setFont('THSarabunNew', 'bold')
        pdf.setFontSize(12)
        pdf.text('ลำดับ', margin + 7, yPos + 6, { align: 'center' })
        pdf.text('รายละเอียด', margin + colWidths[0] + 35, yPos + 6, { align: 'center' })
        pdf.text('จำนวน / ชุด', margin + colWidths[0] + colWidths[1] + 12, yPos + 6, { align: 'center' })
        pdf.text('หมายเหตุ', margin + colWidths[0] + colWidths[1] + colWidths[2] + 25, yPos + 6, { align: 'center' })
      } else {
        pdf.text('No.', margin + 2, yPos + 6)
        pdf.text('Details', margin + colWidths[0] + 2, yPos + 6)
        pdf.text('Quantity', margin + colWidths[0] + colWidths[1] + 2, yPos + 6)
        pdf.text('Remarks', margin + colWidths[0] + colWidths[1] + colWidths[2] + 2, yPos + 6)
      }
      yPos += rowHeight
      
      // Table content
      if (useThaiFont) {
        pdf.setFont('THSarabunNew', 'normal')
      } else {
        pdf.setFont('helvetica', 'normal')
      }
      
      workOrder.models.forEach((model, index) => {
        const currentRowHeight = rowHeight
        
        // Draw row borders
        pdf.rect(margin, yPos, colWidths[0], currentRowHeight)
        pdf.rect(margin + colWidths[0], yPos, colWidths[1], currentRowHeight)
        pdf.rect(margin + colWidths[0] + colWidths[1], yPos, colWidths[2], currentRowHeight)
        pdf.rect(margin + colWidths[0] + colWidths[1] + colWidths[2], yPos, colWidths[3], currentRowHeight)
        
        // Add content
        pdf.text(`${index + 1}`, margin + 2, yPos + 6)
        const modelText = pdf.splitTextToSize(`${model.material}`, colWidths[1] - 4)
        pdf.text(modelText, margin + colWidths[0] + 2, yPos + 6)
        pdf.text('1', margin + colWidths[0] + colWidths[1] + 2, yPos + 6)
        const serialText = pdf.splitTextToSize(`S/N: ${model.sernr}`, colWidths[3] - 4)
        pdf.text(serialText, margin + colWidths[0] + colWidths[1] + colWidths[2] + 2, yPos + 6)
        
        yPos += currentRowHeight
      })
      
      // Total row
      const totalRowHeight = rowHeight
      pdf.rect(margin, yPos, colWidths[0], totalRowHeight)
      pdf.rect(margin + colWidths[0], yPos, colWidths[1], totalRowHeight)
      pdf.rect(margin + colWidths[0] + colWidths[1], yPos, colWidths[2], totalRowHeight)
      pdf.rect(margin + colWidths[0] + colWidths[1] + colWidths[2], yPos, colWidths[3], totalRowHeight)
      
      if (useThaiFont) {
        pdf.setFont('THSarabunNew', 'bold')
      } else {
        pdf.setFont('helvetica', 'bold')
      }
      pdf.text('รวม', margin + colWidths[0] + 30, yPos + 6)
      pdf.text(`${workOrder.models.length}`, margin + colWidths[0] + colWidths[1] + 2, yPos + 6)
      pdf.text(`( ${workOrder.models.length === 1 ? 'หนึ่ง' : workOrder.models.length} )`, margin + colWidths[0] + colWidths[1] + colWidths[2] + 2, yPos + 6)
      yPos += totalRowHeight + 10
      
      // Description section with background (below table)
      const deliveryDescription = 'ขอส่งมอบงานติดตั้งเครื่องปรับอากาศ " DAIKIN "'
      const splitDeliveryDescription = pdf.splitTextToSize(deliveryDescription, pageWidth - 2 * margin - 4)
      const deliveryDescriptionHeight = splitDeliveryDescription.length * 6 + 4
      
      // Draw background for delivery description
      pdf.setFillColor(240, 240, 240) // Light gray background
      pdf.rect(margin, yPos, pageWidth - 2 * margin, deliveryDescriptionHeight, 'F')
      pdf.rect(margin, yPos, pageWidth - 2 * margin, deliveryDescriptionHeight, 'S') // Border
      
      if (useThaiFont) {
        pdf.setFont('THSarabunNew', 'bold')
      } else {
        pdf.setFont('helvetica', 'bold')
      }
      pdf.text(splitDeliveryDescription, margin + 2, yPos + 4)
      yPos += deliveryDescriptionHeight + 8
      
      // Checkbox sections
      if (useThaiFont) {
        pdf.setFont('THSarabunNew', 'normal')
      } else {
        pdf.setFont('helvetica', 'normal')
      }
      
      // Accept delivery checkbox
      pdf.rect(margin, yPos - 2, 4, 4)
      pdf.text('รับมอบงานติดตั้ง', margin + 8, yPos + 1)
      yPos += 10
      
      // Signature lines for accept delivery
      pdf.text('ผู้รับมอบงาน : ........................................................', margin, yPos)
      pdf.text('ผู้ส่งมอบงาน : ...............................................................', 110, yPos)
      yPos += 12
      
      // Reject delivery checkbox
      pdf.rect(margin, yPos - 2, 4, 4)
      pdf.text('ไม่รับมอบงานติดตั้ง', margin + 8, yPos + 1)
      yPos += 8
      
      pdf.text('สิ่งที่ต้องแก้ไข', margin, yPos)
      yPos += 6
      pdf.text('ผู้ไม่รับมอบงาน : ........................................................', margin, yPos)
      yPos += 12
      
      // Remote and manual delivery
      pdf.text('ส่งรีโมทพร้อมถ่านจำนวน ....... ชุด', margin, yPos)
      yPos += 6
      pdf.text('ส่งคู่มือจำนวน ...... ชุด', margin, yPos)
      yPos += 15
      
      // Final signature sections
      pdf.text('(  ...................................................  )', margin, yPos)
      pdf.text('(  ...................................................  )', 110, yPos)
      yPos += 6
      pdf.text('เจ้าของบ้าน / ตัวแทน', margin + 15, yPos)
      pdf.text('เจ้าของบ้าน / ตัวแทน', 125, yPos)
      yPos += 6
      pdf.text('วันที่ ............/............/.............', margin + 10, yPos)
      pdf.text('วันที่ ............/............/.............', 120, yPos)
      yPos += 10
      
      pdf.text('ผู้ส่งมอบงาน', pageWidth/2 - 15, yPos)
      yPos += 6
      pdf.text('วันที่ ............/............/.............', pageWidth/2 - 20, yPos)
      
      // Add QR Code at bottom right
      try {
        const qrCodeBase64 = await loadImageAsBase64('/images/qrcode.png')
        
        // Add QR code to PDF
        pdf.addImage(qrCodeBase64, 'PNG', pageWidth - 50, yPos - 35, 25, 25)
        
        // QR code description
        pdf.setFontSize(8)
        pdf.text('กรุณาทำการสแกนบาร์โค๊ดเพื่อ', pageWidth - 50, yPos - 8)
        pdf.text('ประเมินความพึงพอใจในการ', pageWidth - 50, yPos - 5)
        pdf.text('ติดตั้งเครื่องปรับอากาศเพื่อ', pageWidth - 50, yPos - 2)
        pdf.text('พัฒนาการบริการต่อไป', pageWidth - 50, yPos + 1)
      } catch (error) {
        console.warn('Could not load QR code image:', error)
        // Continue without QR code
      }
      
      // Save PDF
      pdf.save(`เอกสารส่งมอบงาน_${workOrder.woNo}.pdf`)
      setSuccess('PDF generated successfully!')
      
    } catch (error) {
      console.error('Error generating PDF:', error)
      setError('Failed to generate PDF. Please try again.')
    }
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
    <LocalizationProvider 
      dateAdapter={AdapterDayjs} 
      adapterLocale="th"
      dateFormats={{ keyboardDate: 'DD/MM/YYYY' }}
    >
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
                   <Grid item xs={12}>
                    <Typography variant="body2" color="textSecondary">Subject</Typography>
                    <Typography variant="body1">{workOrder.subject}</Typography>
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
                    <Typography variant="body1">{formatDateForDisplay(workOrder.createdDate)}</Typography>
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
                    <Typography variant="body1">{formatDateForDisplay(workOrder.doDate)}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="textSecondary">Technician's request comment</Typography>
                    <Typography variant="body1">{workOrder.description}</Typography>
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
                    <Typography variant="body1">{formatDateForDisplay(workOrder.planStart)}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="textSecondary">Plan Finished</Typography>
                    <Typography variant="body1">{formatDateForDisplay(workOrder.planFinished)}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="textSecondary">
                      Actual Start {canEditDates && <span style={{ color: 'red' }}>*</span>}
                    </Typography>
                    {canEditDates ? (
                      <DatePicker
                        value={actualStart}
                        onChange={setActualStart}
                        slotProps={{ 
                          textField: { 
                            size: 'small', 
                            fullWidth: true,
                            required: true,
                            error: !actualStart && error.includes('Actual Start'),
                            helperText: !actualStart && error.includes('Actual Start') ? 'This field is required' : ''
                          } 
                        }}
                      />
                    ) : (
                      <Typography variant="body1">
                        {workOrder.actualStart ? formatDateForDisplay(workOrder.actualStart) : 'Not set'}
                      </Typography>
                    )}
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="textSecondary">
                      Actual Finished {canEditDates && <span style={{ color: 'red' }}>*</span>}
                    </Typography>
                    {canEditDates ? (
                      <DatePicker
                        value={actualFinished}
                        onChange={setActualFinished}
                        slotProps={{ 
                          textField: { 
                            size: 'small', 
                            fullWidth: true,
                            required: true,
                            error: !actualFinished && error.includes('Actual Finished'),
                            helperText: !actualFinished && error.includes('Actual Finished') ? 'This field is required' : ''
                          } 
                        }}
                      />
                    ) : (
                      <Typography variant="body1">
                        {workOrder.actualFinished ? formatDateForDisplay(workOrder.actualFinished) : 'Not set'}
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
                <TableContainer component={Paper} sx={{ mt: 2 }}>
                  <Table sx={{ minWidth: 650 }} aria-label="models table">
                    <TableHead>
                      <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                        <TableCell sx={{ fontWeight: 'bold', fontSize: '1rem' }}>
                          Model
                        </TableCell>
                        <TableCell sx={{ fontWeight: 'bold', fontSize: '1rem' }}>
                          Serial Number
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {workOrder.models.map((model, index) => (
                        <TableRow 
                          key={index}
                          sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                        >
                          <TableCell component="th" scope="row">
                            {model.material}
                          </TableCell>
                          <TableCell>
                            {model.sernr}
                          </TableCell>
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
                                secondary={`Uploaded: ${formatDateForDisplay(attachment.uploadedAt)}`}
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
                                secondary={`Uploaded: ${formatDateForDisplay(attachment.uploadedAt)}`}
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
                                secondary={`Uploaded: ${formatDateForDisplay(attachment.uploadedAt)}`}
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
                                secondary={`Uploaded: ${formatDateForDisplay(attachment.uploadedAt)}`}
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
                                secondary={`Uploaded: ${formatDateForDisplay(attachment.uploadedAt)}`}
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
                                secondary={`Uploaded: ${formatDateForDisplay(attachment.uploadedAt)}`}
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

            {/* API Fetched Attachments - Show for admin users and sub_contractor when status is waiting_install_admin or waiting_credit_admin */}
            {attachmentData && (canConfirmInstall || canUpdateCredit || (user?.role === 'sub_contractor' && (workOrder?.status === 'waiting_install_admin' || workOrder?.status === 'waiting_credit_admin'))) && (
              <Grid item xs={12}>
                <Paper sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6">
                      Work Order Attachments
                    </Typography>
                    <Button
                      variant="outlined"
                      onClick={fetchWorkOrderAttachments}
                      disabled={loadingAttachments}
                      size="small"
                    >
                      {loadingAttachments ? 'Loading...' : 'Refresh Attachments'}
                    </Button>
                  </Box>
                  
                  {loadingAttachments && (
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, p: 3 }}>
                      <CircularProgress />
                      <Typography variant="body2" color="textSecondary">
                        Loading attachments...
                      </Typography>
                    </Box>
                  )}

                  <Grid container spacing={2}>
                    {/* Hand Over Documents */}
                    {attachmentData.handOverDocAttachments && attachmentData.handOverDocAttachments.length > 0 && (
                      <Grid item xs={12} md={6}>
                        <Typography color={"#0066CC"} variant="subtitle2" gutterBottom>
                          Hand Over Documents ({attachmentData.handOverDocAttachments.length})
                        </Typography>
                        <List dense>
                          {attachmentData.handOverDocAttachments.map((attachment: any) => (
                            <ListItem 
                              key={attachment.id}
                              secondaryAction={
                                <ImagePreview
                                  attachmentId={attachment.id}
                                  filename={attachment.filename}
                                  jwtToken={localStorage.getItem('token') || ''}
                                  onDownload={handleDownloadAttachment}
                                />
                              }
                            >
                              <ListItemIcon>
                                <AttachFileIcon />
                              </ListItemIcon>
                              <ListItemText
                                primary={attachment.filename}
                                secondary={
                                  <Box>
                                    <Typography variant="caption" display="block">
                                      Uploaded: {formatDateForDisplay(new Date(attachment.uploadedAt))}
                                    </Typography>
                                    <Typography variant="caption" display="block">
                                      Size: {(attachment.size / 1024).toFixed(1)} KB
                                    </Typography>
                                  </Box>
                                }
                              />
                            </ListItem>
                          ))}
                        </List>
                      </Grid>
                    )}

                    {/* Installation Photos */}
                    {attachmentData.installationPhotoAttachments && attachmentData.installationPhotoAttachments.length > 0 && (
                      <Grid item xs={12} md={6}>
                        <Typography color={"#0066CC"} variant="subtitle2" gutterBottom>
                          Installation Photos ({attachmentData.installationPhotoAttachments.length})
                        </Typography>
                        <List dense>
                          {attachmentData.installationPhotoAttachments.map((attachment: any) => (
                            <ListItem 
                              key={attachment.id}
                              secondaryAction={
                                <ImagePreview
                                  attachmentId={attachment.id}
                                  filename={attachment.filename}
                                  jwtToken={localStorage.getItem('token') || ''}
                                  onDownload={handleDownloadAttachment}
                                />
                              }
                            >
                              <ListItemIcon>
                                <AttachFileIcon />
                              </ListItemIcon>
                              <ListItemText
                                primary={attachment.filename}
                                secondary={
                                  <Box>
                                    <Typography variant="caption" display="block">
                                      Uploaded: {formatDateForDisplay(new Date(attachment.uploadedAt))}
                                    </Typography>
                                    <Typography variant="caption" display="block">
                                      Size: {(attachment.size / 1024).toFixed(1)} KB
                                    </Typography>
                                  </Box>
                                }
                              />
                            </ListItem>
                          ))}
                        </List>
                      </Grid>
                    )}

                    {/* Test Run Reports */}
                    {attachmentData.testRunReportAttachments && attachmentData.testRunReportAttachments.length > 0 && (
                      <Grid item xs={12} md={6}>
                        <Typography color={"#0066CC"} variant="subtitle2" gutterBottom>
                          Test Run Reports ({attachmentData.testRunReportAttachments.length})
                        </Typography>
                        <List dense>
                          {attachmentData.testRunReportAttachments.map((attachment: any) => (
                            <ListItem 
                              key={attachment.id}
                              secondaryAction={
                                <ImagePreview
                                  attachmentId={attachment.id}
                                  filename={attachment.filename}
                                  jwtToken={localStorage.getItem('token') || ''}
                                  onDownload={handleDownloadAttachment}
                                />
                              }
                            >
                              <ListItemIcon>
                                <AttachFileIcon />
                              </ListItemIcon>
                              <ListItemText
                                primary={attachment.filename}
                                secondary={
                                  <Box>
                                    <Typography variant="caption" display="block">
                                      Uploaded: {new Date(attachment.uploadedAt).toLocaleDateString()}
                                    </Typography>
                                    <Typography variant="caption" display="block">
                                      Size: {(attachment.size / 1024).toFixed(1)} KB
                                    </Typography>
                                  </Box>
                                }
                              />
                            </ListItem>
                          ))}
                        </List>
                      </Grid>
                    )}

                    {/* Others */}
                    {attachmentData.othersAttachments && attachmentData.othersAttachments.length > 0 && (
                      <Grid item xs={12} md={6}>
                        <Typography color={"#0066CC"} variant="subtitle2" gutterBottom>
                          Other Documents ({attachmentData.othersAttachments.length})
                        </Typography>
                        <List dense>
                          {attachmentData.othersAttachments.map((attachment: any) => (
                            <ListItem 
                              key={attachment.id}
                              secondaryAction={
                                <ImagePreview
                                  attachmentId={attachment.id}
                                  filename={attachment.filename}
                                  jwtToken={localStorage.getItem('token') || ''}
                                  onDownload={handleDownloadAttachment}
                                />
                              }
                            >
                              <ListItemIcon>
                                <AttachFileIcon />
                              </ListItemIcon>
                              <ListItemText
                                primary={attachment.filename}
                                secondary={
                                  <Box>
                                    <Typography variant="caption" display="block">
                                      Uploaded: {new Date(attachment.uploadedAt).toLocaleDateString()}
                                    </Typography>
                                    <Typography variant="caption" display="block">
                                      Size: {(attachment.size / 1024).toFixed(1)} KB
                                    </Typography>
                                  </Box>
                                }
                              />
                            </ListItem>
                          ))}
                        </List>
                      </Grid>
                    )}

                    {/* Show summary information 
                    <Grid item xs={12}>
                      <Divider sx={{ my: 2 }} />
                      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                        <Typography variant="body2" color="textSecondary">
                          Work Order ID: {attachmentData.workorderId}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          Status: {attachmentData.status}
                        </Typography>
                        {attachmentData.actualStart && (
                          <Typography variant="body2" color="textSecondary">
                            Actual Start: {new Date(attachmentData.actualStart).toLocaleDateString()}
                          </Typography>
                        )}
                        {attachmentData.actualFinished && (
                          <Typography variant="body2" color="textSecondary">
                            Actual Finished: {new Date(attachmentData.actualFinished).toLocaleDateString()}
                          </Typography>
                        )}
                      </Box>
                      {attachmentData.remark && (
                        <Box sx={{ mt: 1 }}>
                          <Typography variant="body2" color="textSecondary">Remark:</Typography>
                          <Typography variant="body2">{attachmentData.remark}</Typography>
                        </Box>
                      )}
                    </Grid>*/}
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
                        <Typography variant="body1">
                          {remark || workOrder.remark || 'No remarks'}
                        </Typography>
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
         
                  <Button
                    variant="outlined"
                    color="secondary"
                    startIcon={<DownloadIcon />}
                    onClick={handleDownloadHandOverDocuments}
                    disabled={isUploading}
                  >
                    {isUploading ? 'กำลังดาวน์โหลด...' : 'ดาวน์โหลดเอกสารส่งมอบ'}
                  </Button>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </Container>
    </LocalizationProvider>
  )
}
