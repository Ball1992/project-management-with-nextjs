import { useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { varAlpha, mergeClasses } from 'minimal-shared/utils';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import { Iconify } from '../iconify';
import { uploadClasses } from './classes';
import { RejectionFiles } from './components/rejection-files';
import { getImageUrl } from 'src/utils/image-url';

import type { UploadProps } from './types';

// ----------------------------------------------------------------------

export function UploadCoverImage({
  sx,
  error,
  value,
  disabled,
  helperText,
  className,
  ...other
}: UploadProps) {
  const { getRootProps, getInputProps, isDragActive, isDragReject, fileRejections } = useDropzone({
    multiple: false,
    disabled,
    accept: { 'image/*': [] },
    ...other,
  });

  const hasFile = !!value;

  const hasError = isDragReject || !!error;

  const [preview, setPreview] = useState('');

  useEffect(() => {
    if (typeof value === 'string') {
      setPreview(getImageUrl(value));
    } else if (value instanceof File) {
      setPreview(URL.createObjectURL(value));
    }
  }, [value]);

  const renderPreview = () => {
    if (!hasFile || !preview) return null;
    
    return (
      <Box
        component="img"
        alt="Cover Image" 
        src={preview}
        crossOrigin="anonymous"
        sx={{ 
          width: '100%', 
          height: '100%', 
          borderRadius: 1,
          objectFit: 'cover'
        }} 
      />
    );
  };

  const renderPlaceholder = () => (
    <Box
      className="upload-placeholder"
      sx={(theme) => ({
        top: 0,
        gap: 1,
        left: 0,
        width: 1,
        height: 1,
        zIndex: 9,
        display: 'flex',
        borderRadius: 1,
        position: 'absolute',
        alignItems: 'center',
        color: 'text.disabled',
        flexDirection: 'column',
        justifyContent: 'center',
        bgcolor: varAlpha(theme.vars.palette.grey['500Channel'], 0.08),
        transition: theme.transitions.create(['opacity'], {
          duration: theme.transitions.duration.shorter,
        }),
        '&:hover': { opacity: 0.72 },
        ...(hasError && {
          color: 'error.main',
          bgcolor: varAlpha(theme.vars.palette.error.mainChannel, 0.08),
        }),
        ...(hasFile && {
          zIndex: 9,
          opacity: 0,
          color: 'common.white',
          bgcolor: varAlpha(theme.vars.palette.grey['900Channel'], 0.64),
        }),
      })}
    >
      <Iconify icon="solar:gallery-add-bold" width={48} />

      <Typography variant="body2" sx={{ mt: 1 }}>
        {hasFile ? 'Update cover image' : 'Upload cover image'}
      </Typography>
      
      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
        Drag & drop or click to browse
      </Typography>
    </Box>
  );

  const renderContent = () => (
    <Box
      sx={{
        width: 1,
        height: 1,
        overflow: 'hidden',
        borderRadius: 1,
        position: 'relative',
      }}
    >
      {renderPreview()}
      {renderPlaceholder()}
    </Box>
  );

  return (
    <>
      <Box
        {...getRootProps()}
        className={mergeClasses([uploadClasses.uploadBox, className])}
        sx={[
          (theme) => ({
            p: 1,
            width: '100%',
            height: 200,
            cursor: 'pointer',
            overflow: 'hidden',
            borderRadius: 1,
            border: `1px dashed ${varAlpha(theme.vars.palette.grey['500Channel'], 0.2)}`,
            ...(isDragActive && { opacity: 0.72 }),
            ...(disabled && { opacity: 0.48, pointerEvents: 'none' }),
            ...(hasError && { borderColor: 'error.main' }),
            ...(hasFile && {
              ...(hasError && { bgcolor: varAlpha(theme.vars.palette.error.mainChannel, 0.08) }),
              '&:hover .upload-placeholder': { opacity: 1 },
            }),
          }),
          ...(Array.isArray(sx) ? sx : [sx]),
        ]}
      >
        <input {...getInputProps()} />

        {renderContent()}
      </Box>

      {helperText && helperText}

      {!!fileRejections.length && <RejectionFiles files={fileRejections} />}
    </>
  );
}
