'use client'

import React, { useState } from 'react'
import {
  Box,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Typography,
  CircularProgress,
  Alert,
  Chip
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import ImageIcon from '@mui/icons-material/Image'
import DownloadIcon from '@mui/icons-material/Download'
import VisibilityIcon from '@mui/icons-material/Visibility'

interface ImagePreviewProps {
  attachmentId: string
  filename: string
  jwtToken: string
  onDownload?: (attachmentId: string, filename: string) => void
}

export const ImagePreview: React.FC<ImagePreviewProps> = ({
  attachmentId,
  filename,
  jwtToken,
  onDownload
}) => {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [imageUrl, setImageUrl] = useState<string | null>(null)

  // Check if file is likely an image based on filename
  const isLikelyImage = (filename: string): boolean => {
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp']
    const ext = filename.toLowerCase().substring(filename.lastIndexOf('.'))
    return imageExtensions.includes(ext)
  }

  const handlePreview = async () => {
    if (!isLikelyImage(filename)) {
      setError('This file does not appear to be an image')
      return
    }

    setOpen(true)
    setLoading(true)
    setError('')

    try {
      const previewUrl = `/api/workorders/attachments/preview/${attachmentId}?jwtToken=${encodeURIComponent(jwtToken)}`
      
      // Test if the image can be loaded
      const response = await fetch(previewUrl)
      
      if (response.ok) {
        const contentType = response.headers.get('content-type')
        if (contentType && contentType.startsWith('image/')) {
          setImageUrl(previewUrl)
        } else {
          // Try to get error message from JSON response
          try {
            const errorData = await response.json()
            setError(errorData.error || 'File is not an image')
          } catch {
            setError('File is not an image')
          }
        }
      } else {
        // Handle error response
        try {
          const errorData = await response.json()
          setError(errorData.error || `Failed to load image (Status: ${response.status})`)
        } catch {
          setError(`Failed to load image (Status: ${response.status})`)
        }
      }
    } catch (error: any) {
      console.error('Error loading image preview:', error)
      setError(`Failed to load image: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setOpen(false)
    setImageUrl(null)
    setError('')
  }

  const [downloadLoading, setDownloadLoading] = useState(false)

  const handleDownload = async () => {
    if (onDownload) {
      setDownloadLoading(true)
      try {
        await onDownload(attachmentId, filename)
      } finally {
        setDownloadLoading(false)
      }
    }
  }

  const handleImageError = () => {
    setError('Failed to display image')
    setLoading(false)
  }

  const handleImageLoad = () => {
    setLoading(false)
  }

  return (
    <>
      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
        {isLikelyImage(filename) && (
          <Chip
            icon={<ImageIcon />}
            label="Image"
            size="small"
            color="primary"
            variant="outlined"
          />
        )}
        
        <Box sx={{ display: 'flex', gap: 1 }}>
          {isLikelyImage(filename) && (
            <IconButton
              size="small"
              onClick={handlePreview}
              title="Preview Image"
              color="primary"
            >
              <VisibilityIcon />
            </IconButton>
          )}
          
          <IconButton
            size="small"
            onClick={handleDownload}
            title="Download File"
            color="secondary"
            disabled={downloadLoading}
          >
            {downloadLoading ? (
              <CircularProgress size={16} />
            ) : (
              <DownloadIcon />
            )}
          </IconButton>
        </Box>
      </Box>

      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column'
          }
        }}
      >
        <DialogTitle sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          pb: 1
        }}>
          <Typography variant="h6" component="div" sx={{ 
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            maxWidth: '80%'
          }}>
            {filename}
          </Typography>
          <IconButton
            edge="end"
            color="inherit"
            onClick={handleClose}
            aria-label="close"
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        
        <DialogContent sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '400px',
          overflow: 'hidden'
        }}>
          {loading && (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
              <CircularProgress />
              <Typography variant="body2" color="textSecondary">
                Loading image preview...
              </Typography>
            </Box>
          )}
          
          {error && (
            <Alert severity="error" sx={{ width: '100%', maxWidth: '500px' }}>
              {error}
            </Alert>
          )}
          
          {imageUrl && !loading && !error && (
            <Box sx={{ 
              width: '100%', 
              height: '100%',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              overflow: 'hidden'
            }}>
              <img
                src={imageUrl}
                alt={filename}
                onLoad={handleImageLoad}
                onError={handleImageError}
                style={{
                  maxWidth: '100%',
                  maxHeight: '70vh',
                  objectFit: 'contain',
                  borderRadius: '4px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}
              />
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}

export default ImagePreview
