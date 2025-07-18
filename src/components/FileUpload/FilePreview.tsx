import React from 'react'
import {
  Box,
  IconButton,
  Typography,
  Card,
  CardContent,
  CardMedia,
  Chip
} from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf'
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile'
import { formatFileSize } from '@/utils/fileValidation'
import { isImageFile, isPdfFile } from '@/utils/imageCompression'

interface FilePreviewProps {
  file: File
  previewUrl?: string
  onRemove: () => void
  isUploading?: boolean
}

export const FilePreview: React.FC<FilePreviewProps> = ({
  file,
  previewUrl,
  onRemove,
  isUploading = false
}) => {
  const renderFileIcon = () => {
    if (isImageFile(file) && previewUrl) {
      return (
        <CardMedia
          component="img"
          height="120"
          image={previewUrl}
          alt={file.name}
          sx={{ objectFit: 'cover' }}
        />
      )
    }

    if (isPdfFile(file)) {
      return (
        <Box
          sx={{
            height: 120,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: 'grey.100'
          }}
        >
          <PictureAsPdfIcon sx={{ fontSize: 48, color: 'error.main' }} />
        </Box>
      )
    }

    return (
      <Box
        sx={{
          height: 120,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'grey.100'
        }}
      >
        <InsertDriveFileIcon sx={{ fontSize: 48, color: 'grey.600' }} />
      </Box>
    )
  }

  return (
    <Card sx={{ position: 'relative', maxWidth: 200 }}>
      {renderFileIcon()}
      
      <CardContent sx={{ p: 1, '&:last-child': { pb: 1 } }}>
        <Typography
          variant="caption"
          sx={{
            display: 'block',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            mb: 0.5
          }}
          title={file.name}
        >
          {file.name}
        </Typography>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="caption" color="text.secondary">
            {formatFileSize(file.size)}
          </Typography>
          
          {isUploading && (
            <Chip label="Uploading..." size="small" color="info" />
          )}
        </Box>
      </CardContent>

      <IconButton
        size="small"
        onClick={onRemove}
        disabled={isUploading}
        sx={{
          position: 'absolute',
          top: 4,
          right: 4,
          bgcolor: 'rgba(255, 255, 255, 0.8)',
          '&:hover': {
            bgcolor: 'rgba(255, 255, 255, 0.9)'
          }
        }}
      >
        <DeleteIcon fontSize="small" />
      </IconButton>
    </Card>
  )
}
