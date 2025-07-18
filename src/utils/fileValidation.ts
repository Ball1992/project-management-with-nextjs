export interface FileValidationResult {
  isValid: boolean
  error?: string
}

export interface FileUploadLimits {
  maxFiles: number
  maxSizeMB: number
  allowedTypes: string[]
}

export const FILE_UPLOAD_LIMITS = {
  hand_over_doc: {
    maxFiles: 1,
    maxSizeMB: 10,
    allowedTypes: ['application/pdf', 'image/jpeg', 'image/png']
  },
  installation_photo: {
    maxFiles: 20,
    maxSizeMB: 5,
    allowedTypes: ['image/jpeg', 'image/png']
  },
  test_run_report: {
    maxFiles: 1,
    maxSizeMB: 10,
    allowedTypes: ['application/pdf', 'image/jpeg', 'image/png']
  },
  others: {
    maxFiles: 5,
    maxSizeMB: 10,
    allowedTypes: ['application/pdf', 'image/jpeg', 'image/png', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
  }
} as const

export type FileUploadType = keyof typeof FILE_UPLOAD_LIMITS

export const validateFile = (
  file: File,
  uploadType: FileUploadType
): FileValidationResult => {
  const limits = FILE_UPLOAD_LIMITS[uploadType]

  // Check file type
  if (!limits.allowedTypes.includes(file.type as any)) {
    return {
      isValid: false,
      error: `File type ${file.type} is not allowed. Allowed types: ${limits.allowedTypes.join(', ')}`
    }
  }

  // Check file size
  const fileSizeMB = file.size / (1024 * 1024)
  if (fileSizeMB > limits.maxSizeMB) {
    return {
      isValid: false,
      error: `File size (${fileSizeMB.toFixed(2)}MB) exceeds maximum allowed size (${limits.maxSizeMB}MB)`
    }
  }

  return { isValid: true }
}

export const validateFileCount = (
  currentCount: number,
  newFilesCount: number,
  uploadType: FileUploadType
): FileValidationResult => {
  const limits = FILE_UPLOAD_LIMITS[uploadType]
  const totalCount = currentCount + newFilesCount

  if (totalCount > limits.maxFiles) {
    return {
      isValid: false,
      error: `Cannot upload ${newFilesCount} files. Maximum allowed: ${limits.maxFiles}, current: ${currentCount}`
    }
  }

  return { isValid: true }
}

export const getFileTypeLabel = (uploadType: FileUploadType): string => {
  switch (uploadType) {
    case 'hand_over_doc':
      return 'Hand Over Document'
    case 'installation_photo':
      return 'Installation Photos'
    case 'test_run_report':
      return 'Test Run Report'
    case 'others':
      return 'Other Documents'
    default:
      return 'Files'
  }
}

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}
