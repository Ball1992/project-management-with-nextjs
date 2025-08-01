'use client';

import { useFormContext, Controller } from 'react-hook-form';
import { useCallback } from 'react';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import FormHelperText from '@mui/material/FormHelperText';
import { alpha, styled } from '@mui/material/styles';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

const StyledDropZone = styled(Box)(({ theme }) => ({
  width: '100%',
  height: 200,
  outline: 'none',
  display: 'flex',
  cursor: 'pointer',
  overflow: 'hidden',
  position: 'relative',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: theme.shape.borderRadius,
  transition: theme.transitions.create(['opacity', 'border']),
  backgroundColor: alpha(theme.palette.grey[500], 0.08),
  border: `2px dashed ${alpha(theme.palette.grey[500], 0.2)}`,
  '&:hover': {
    opacity: 0.72,
    borderColor: theme.palette.primary.main,
  },
}));

const StyledPlaceholder = styled(Stack)(({ theme }) => ({
  spacing: 2,
  alignItems: 'center',
  justifyContent: 'center',
  color: theme.palette.text.secondary,
}));

// ----------------------------------------------------------------------

type Props = {
  name: string;
  label?: string;
  helperText?: React.ReactNode;
  placeholder?: string;
};

export function RHFImageUpload({ name, label, helperText, placeholder }: Props) {
  const { control, setValue } = useFormContext();

  const handleImageChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setValue(name, reader.result as string);
        };
        reader.readAsDataURL(file);
      }
    },
    [name, setValue]
  );

  const handleRemove = useCallback(() => {
    setValue(name, '');
  }, [name, setValue]);

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <Stack spacing={1}>
          {label && (
            <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
              {label}
            </Typography>
          )}

          <Box sx={{ position: 'relative' }}>
            <StyledDropZone
              sx={{
                ...(error && {
                  borderColor: 'error.main',
                  backgroundColor: (theme) => alpha(theme.palette.error.main, 0.08),
                }),
              }}
            >
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                style={{
                  position: 'absolute',
                  width: '100%',
                  height: '100%',
                  opacity: 0,
                  cursor: 'pointer',
                }}
              />

              {field.value ? (
                <Box
                  component="img"
                  src={field.value}
                  sx={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                />
              ) : (
                <StyledPlaceholder spacing={2}>
                  <Iconify icon="solar:gallery-add-bold" width={48} />
                  <Typography variant="body2">
                    {placeholder || 'Click or drag image here'}
                  </Typography>
                </StyledPlaceholder>
              )}
            </StyledDropZone>

            {field.value && (
              <IconButton
                size="small"
                onClick={handleRemove}
                sx={{
                  top: 8,
                  right: 8,
                  position: 'absolute',
                  bgcolor: 'background.paper',
                  boxShadow: (theme) => theme.shadows[8],
                  '&:hover': {
                    bgcolor: 'background.paper',
                  },
                }}
              >
                <Iconify icon="solar:trash-bin-trash-bold" width={18} />
              </IconButton>
            )}
          </Box>

          {(!!error || helperText) && (
            <FormHelperText error={!!error}>
              {error ? error?.message : helperText}
            </FormHelperText>
          )}
        </Stack>
      )}
    />
  );
}

// ----------------------------------------------------------------------

type MultipleProps = {
  name: string;
  label?: string;
  helperText?: React.ReactNode;
  maxImages?: number;
};

export function RHFMultiImageUpload({ 
  name, 
  label, 
  helperText, 
  maxImages = 10 
}: MultipleProps) {
  const { control, setValue } = useFormContext();

  const handleImageAdd = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>, currentImages: string[]) => {
      const files = event.target.files;
      if (files) {
        const newImages: string[] = [];
        let processed = 0;

        Array.from(files).forEach((file) => {
          if (currentImages.length + newImages.length < maxImages) {
            const reader = new FileReader();
            reader.onloadend = () => {
              newImages.push(reader.result as string);
              processed++;
              
              if (processed === files.length) {
                setValue(name, [...currentImages, ...newImages]);
              }
            };
            reader.readAsDataURL(file);
          }
        });
      }
    },
    [name, setValue, maxImages]
  );

  const handleRemove = useCallback(
    (index: number, currentImages: string[]) => {
      const newImages = currentImages.filter((_, i) => i !== index);
      setValue(name, newImages);
    },
    [name, setValue]
  );

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => {
        const images = field.value || [];

        return (
          <Stack spacing={1}>
            {label && (
              <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                {label}
              </Typography>
            )}

            <Box
              sx={{
                display: 'grid',
                gap: 2,
                gridTemplateColumns: {
                  xs: 'repeat(2, 1fr)',
                  sm: 'repeat(3, 1fr)',
                  md: 'repeat(4, 1fr)',
                },
              }}
            >
              {images.map((image: string, index: number) => (
                <Box
                  key={index}
                  sx={{
                    position: 'relative',
                    paddingTop: '100%',
                    borderRadius: 1,
                    overflow: 'hidden',
                    border: (theme) => `1px solid ${alpha(theme.palette.grey[500], 0.2)}`,
                  }}
                >
                  <Box
                    component="img"
                    src={image}
                    sx={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                    }}
                  />
                  <IconButton
                    size="small"
                    onClick={() => handleRemove(index, images)}
                    sx={{
                      position: 'absolute',
                      top: 4,
                      right: 4,
                      bgcolor: 'background.paper',
                      boxShadow: (theme) => theme.shadows[8],
                      '&:hover': {
                        bgcolor: 'background.paper',
                      },
                    }}
                  >
                    <Iconify icon="solar:close-circle-bold" width={18} />
                  </IconButton>
                </Box>
              ))}

              {images.length < maxImages && (
                <Box
                  sx={{
                    position: 'relative',
                    paddingTop: '100%',
                    borderRadius: 1,
                    overflow: 'hidden',
                  }}
                >
                  <StyledDropZone
                    sx={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      ...(error && {
                        borderColor: 'error.main',
                        backgroundColor: (theme) => alpha(theme.palette.error.main, 0.08),
                      }),
                    }}
                  >
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={(e) => handleImageAdd(e, images)}
                      style={{
                        position: 'absolute',
                        width: '100%',
                        height: '100%',
                        opacity: 0,
                        cursor: 'pointer',
                      }}
                    />
                    <StyledPlaceholder>
                      <Iconify icon="solar:add-circle-bold" width={32} />
                      <Typography variant="caption">Add Image</Typography>
                    </StyledPlaceholder>
                  </StyledDropZone>
                </Box>
              )}
            </Box>

            {(!!error || helperText) && (
              <FormHelperText error={!!error}>
                {error ? error?.message : helperText}
              </FormHelperText>
            )}
          </Stack>
        );
      }}
    />
  );
}
