import type { UseSetStateReturn } from 'minimal-shared/hooks';
import type { Theme, SxProps } from '@mui/material/styles';

import { useCallback } from 'react';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

type Props = {
  filters: UseSetStateReturn<{
    name: string;
    status: string;
    startDate: Date | null;
    endDate: Date | null;
  }>;
  totalResults: number;
  onResetPage: () => void;
  sx?: SxProps<Theme>;
};

export function ExclusiveNeighborhoodsLocationsTableFiltersResult({
  filters,
  totalResults,
  onResetPage,
  sx,
}: Props) {
  const { state: currentFilters, setState: updateFilters } = filters;

  const handleRemoveKeyword = useCallback(() => {
    onResetPage();
    updateFilters({ name: '' });
  }, [onResetPage, updateFilters]);

  const handleRemoveStatus = useCallback(() => {
    onResetPage();
    updateFilters({ status: 'all' });
  }, [onResetPage, updateFilters]);

  const handleRemoveDate = useCallback(() => {
    onResetPage();
    updateFilters({ startDate: null, endDate: null });
  }, [onResetPage, updateFilters]);

  const handleReset = useCallback(() => {
    onResetPage();
    updateFilters({
      name: '',
      status: 'all',
      startDate: null,
      endDate: null,
    });
  }, [onResetPage, updateFilters]);

  return (
    <Box sx={sx}>
      <Box sx={{ typography: 'body2' }}>
        <strong>{totalResults}</strong>
        <Box component="span" sx={{ color: 'text.secondary', ml: 0.25 }}>
          results found
        </Box>
      </Box>

      <Box
        sx={{
          mt: 1,
          gap: 1,
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
        }}
      >
        {!!currentFilters.name && (
          <Chip
            size="small"
            label={currentFilters.name}
            onDelete={handleRemoveKeyword}
            deleteIcon={<Iconify icon="mingcute:close-line" />}
          />
        )}

        {currentFilters.status !== 'all' && (
          <Chip
            size="small"
            label={
              currentFilters.status === 'enable'
                ? 'Enable'
                : currentFilters.status === 'disable'
                ? 'Disable'
                : currentFilters.status
            }
            onDelete={handleRemoveStatus}
            deleteIcon={<Iconify icon="mingcute:close-line" />}
          />
        )}

        {(!!currentFilters.startDate || !!currentFilters.endDate) && (
          <Chip
            size="small"
            label="Date range"
            onDelete={handleRemoveDate}
            deleteIcon={<Iconify icon="mingcute:close-line" />}
          />
        )}

        <Button
          color="error"
          onClick={handleReset}
          startIcon={<Iconify icon="solar:trash-bin-trash-bold" />}
        >
          Clear
        </Button>
      </Box>
    </Box>
  );
}
