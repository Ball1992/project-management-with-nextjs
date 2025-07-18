import React, { useCallback, useState, useEffect } from 'react'
import { useDropzone } from 'react-dropzone'
import {
  Box,
  Typography,
  Button,
  Alert,
  Grid,
  LinearProgress,
  Paper
} from '@mui/material'
import CloudUploadIcon from '@mui/icons-material/CloudUpload'
import { FilePreview } from './FilePreview'
import {
  validateFile,
  validateFileCount,
  getFileTypeLabel,
  FILE_UPLOAD_LIMITS,
  type FileUploadType
} from '@/utils/fileValidation'
import {
  compressImage,
  isImageFile,
  getFilePreviewUrl
} from '@/utils/imageCompression'

interface FileWithPreview extends File {
  preview?: string
  compressed?: File
}

interface FileUploadZoneProps {
  uploadType: FileUploadType
  files: FileWithPreview[]
  onFilesChange: (files: FileWithPreview[]) => void
  disabled?: boolean
  existingFilesCount?: number
}

export const FileUploadZone: React.FC<FileUploadZoneProps> = ({
  uploadType,
  files,
  onFilesChange,
  disabled = false,
  existingFilesCount = 0
}) => {
  const [error, setError] = useState<string>('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [processingProgress, setProcessingProgress] = useState(0)

  const limits = FILE_UPLOAD_LIMITS[uploadType]

  const processFiles = async (newFiles: File[]): Promise<FileWithPreview[]> => {
    const processedFiles: FileWithPreview[] = []
    setProcessingProgress(0)

    for (let i = 0; i < newFiles.length; i++) {
      const file = newFiles[i]
      let processedFile: FileWithPreview = file

      try {
        // Generate preview URL
        if (isImageFile(file)) {
          const previewUrl = await getFilePreviewUrl(file)
          processedFile.preview = previewUrl

          // Compress image if needed
          const compressedFile = await compressImage(file, {
            maxSizeMB: 1,
            maxWidthOrHeight: 1024,
            useWebWorker: true
          })
          
          if (compressedFile.size < file.size) {
            processedFile.compressed = compressedFile
            // Update preview with compressed file
            const compressedPreview = await getFilePreviewUrl(compressedFile)
            processedFile.preview = compressedPreview
          }
        }

        processedFiles.push(processedFile)
        setProcessingProgress(((i + 1) / newFiles.length) * 100)
      } catch (error) {
        console.error('Error processing file:', file.name, error)
        // Still add the file even if processing fails
        processedFiles.push(processedFile)
      }
    }

    return processedFiles
  }

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setError('')
    setIsProcessing(true)

    try {
      // Validate file count
      const countValidation = validateFileCount(
        files.length + existingFilesCount,
        acceptedFiles.length,
        uploadType
      )

      if (!countValidation.isValid) {
        setError(countValidation.error || 'File count validation failed')
        setIsProcessing(false)
        return
      }

      // Validate each file
      const validFiles: File[] = []
      for (const file of acceptedFiles) {
        const validation = validateFile(file, uploadType)
        if (validation.isValid) {
          validFiles.push(file)
        } else {
          setError(validation.error || 'File validation failed')
          setIsProcessing(false)
          return
        }
      }

      // Process files (compression, preview generation)
      const processedFiles = await processFiles(validFiles)
      
      // Add to existing files
      onFilesChange([...files, ...processedFiles])
    } catch (error) {
      console.error('Error processing files:', error)
      setError('Error processing files. Please try again.')
    } finally {
      setIsProcessing(false)
      setProcessingProgress(0)
    }
  }, [files, onFilesChange, uploadType, existingFilesCount])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    disabled: disabled || isProcessing,
    accept: limits.allowedTypes.reduce((acc, type) => {
      acc[type] = []
      return acc
    }, {} as Record<string, string[]>),
    maxFiles: limits.maxFiles - files.length - existingFilesCount
  })

  const removeFile = (index: number) => {
    const newFiles = [...files]
    // Revoke preview URL to prevent memory leaks
    if (newFiles[index].preview) {
      URL.revokeObjectURL(newFiles[index].preview!)
    }
    newFiles.splice(index, 1)
    onFilesChange(newFiles)
  }

  // Cleanup preview URLs on unmount
  useEffect(() => {
    return () => {
      files.forEach(file => {
        if (file.preview) {
          URL.revokeObjectURL(file.preview)
        }
      })
    }
  }, [])

  const canAddMore = (files.length + existingFilesCount) < limits.maxFiles

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        {getFileTypeLabel(uploadType)}
      </Typography>
      
      <Typography variant="body2" color="text.secondary" gutterBottom>
        Maximum {limits.maxFiles} file{limits.maxFiles > 1 ? 's' : ''}, 
        up to {limits.maxSizeMB}MB each
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {isProcessing && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" gutterBottom>
            Processing files... {Math.round(processingProgress)}%
          </Typography>
          <LinearProgress variant="determinate" value={processingProgress} />
        </Box>
      )}

      {canAddMore && (
        <Paper
          {...getRootProps()}
          sx={{
            p: 3,
            mb: 2,
            border: '2px dashed',
            borderColor: isDragActive ? 'primary.main' : 'grey.300',
            bgcolor: isDragActive ? 'action.hover' : 'background.paper',
            cursor: disabled || isProcessing ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s ease',
            '&:hover': {
              borderColor: disabled || isProcessing ? 'grey.300' : 'primary.main',
              bgcolor: disabled || isProcessing ? 'background.paper' : 'action.hover'
            }
          }}
        >
          <input {...getInputProps()} />
          <Box sx={{ textAlign: 'center' }}>
            <CloudUploadIcon sx={{ fontSize: 48, color: 'grey.400', mb: 1 }} />
            <Typography variant="h6" gutterBottom>
              {isDragActive ? 'Drop files here' : 'Drag & drop files here'}
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              or
            </Typography>
            <Button variant="outlined" disabled={disabled || isProcessing}>
              Browse Files
            </Button>
            <Typography variant="caption" display="block" sx={{ mt: 1 }}>
              Accepted: {limits.allowedTypes.map(type => {
                if (type.includes('image')) return type.split('/')[1].toUpperCase()
                if (type.includes('pdf')) return 'PDF'
                if (type.includes('word')) return 'DOC'
                return type.split('/')[1]?.toUpperCase() || type
              }).join(', ')}
            </Typography>
          </Box>
        </Paper>
      )}

      {files.length > 0 && (
        <Box>
          <Typography variant="subtitle2" gutterBottom>
            Selected Files ({files.length}/{limits.maxFiles})
          </Typography>
          <Grid container spacing={2}>
            {files.map((file, index) => (
              <Grid item key={`${file.name}-${index}`}>
                <FilePreview
                  file={file.compressed || file}
                  previewUrl={file.preview}
                  onRemove={() => removeFile(index)}
                  isUploading={isProcessing}
                />
              </Grid>
            ))}
          </Grid>
        </Box>
      )}
    </Box>
  )
}
