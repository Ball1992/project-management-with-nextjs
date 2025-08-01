import type { Theme, SxProps } from '@mui/material/styles';
import { useCallback } from 'react';
import { UseSetStateReturn } from 'minimal-shared/hooks';

import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import { Box } from '@mui/material';

import { Iconify } from 'src/components/iconify';

import { IMenuTableFilters } from 'src/types/menu';

// ----------------------------------------------------------------------

type Props = {
  sx?: SxProps<Theme>;
  onResetPage: () => void;
  filters: UseSetStateReturn<IMenuTableFilters>;
};

export function MenuSearch({ filters, onResetPage, sx }: Props) {
  const { state: currentFilters, setState: updateFilters } = filters;

  const handleFilterName = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      onResetPage();
      updateFilters({ name: event.target.value });
    },
    [onResetPage, updateFilters]
  );

  return (
    <Box
      sx={{
        gap: 2,
        width: 1,
        flexGrow: 1,
        display: 'flex',
        alignItems: 'center',
        ...sx,
      }}
    >
      <TextField
        fullWidth
        value={currentFilters.name}
        onChange={handleFilterName}
        placeholder="Search..."
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
            </InputAdornment>
          ),
        }}
      />
    </Box>
  );
}
