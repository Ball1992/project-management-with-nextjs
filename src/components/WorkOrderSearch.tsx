import type { Theme, SxProps } from '@mui/material/styles';
import { useCallback } from 'react';
import { UseSetStateReturn } from '@/hooks/useSetState';

import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import { Box } from '@mui/material';

import SearchIcon from '@mui/icons-material/Search';

// ----------------------------------------------------------------------

export interface IWorkOrderSearchFilters {
  name: string;
}

type Props = {
  sx?: SxProps<Theme>;
  onResetPage: () => void;
  filters: UseSetStateReturn<IWorkOrderSearchFilters>;
};

export function WorkOrderSearch({ filters, onResetPage, sx }: Props) {
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
        placeholder="Search by WO No., Customer, or Land No..."
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon sx={{ color: 'text.disabled' }} />
            </InputAdornment>
          ),
        }}
        sx={{
          '& .MuiOutlinedInput-root': {
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
          }
        }}
        size="small"
      />
    </Box>
  );
}
