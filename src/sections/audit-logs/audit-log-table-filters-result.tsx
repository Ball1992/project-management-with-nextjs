import type { UseSetStateReturn } from 'minimal-shared/hooks';
import type { FiltersResultProps } from 'src/components/filters-result';

import { useCallback } from 'react';

import Chip from '@mui/material/Chip';

import { chipProps, FiltersBlock, FiltersResult } from 'src/components/filters-result';

// ----------------------------------------------------------------------

interface IAuditLogTableFilters {
  name: string;
  action: string;
  module: string;
  startDate: Date | null;
  endDate: Date | null;
}

type Props = FiltersResultProps & {
  onResetPage: () => void;
  filters: UseSetStateReturn<IAuditLogTableFilters>;
};

export function AuditLogTableFiltersResult({ filters, onResetPage, totalResults, sx }: Props) {
  const { state: currentFilters, setState: updateFilters, resetState: resetFilters } = filters;

  const handleRemoveKeyword = useCallback(() => {
    onResetPage();
    updateFilters({ name: '' });
  }, [onResetPage, updateFilters]);

  const handleRemoveAction = useCallback(() => {
    onResetPage();
    updateFilters({ action: 'all' });
  }, [onResetPage, updateFilters]);

  const handleRemoveModule = useCallback(() => {
    onResetPage();
    updateFilters({ module: 'all' });
  }, [onResetPage, updateFilters]);

  const handleRemoveStartDate = useCallback(() => {
    onResetPage();
    updateFilters({ startDate: null });
  }, [onResetPage, updateFilters]);

  const handleRemoveEndDate = useCallback(() => {
    onResetPage();
    updateFilters({ endDate: null });
  }, [onResetPage, updateFilters]);

  const handleReset = useCallback(() => {
    onResetPage();
    resetFilters();
  }, [onResetPage, resetFilters]);

  return (
    <FiltersResult totalResults={totalResults} onReset={handleReset} sx={sx}>
      <FiltersBlock label="Action:" isShow={currentFilters.action !== 'all'}>
        <Chip
          {...chipProps}
          label={currentFilters.action}
          onDelete={handleRemoveAction}
          sx={{ textTransform: 'capitalize' }}
        />
      </FiltersBlock>

      <FiltersBlock label="Module:" isShow={currentFilters.module !== 'all'}>
        <Chip
          {...chipProps}
          label={currentFilters.module}
          onDelete={handleRemoveModule}
          sx={{ textTransform: 'capitalize' }}
        />
      </FiltersBlock>

      <FiltersBlock label="Keyword:" isShow={!!currentFilters.name}>
        <Chip {...chipProps} label={currentFilters.name} onDelete={handleRemoveKeyword} />
      </FiltersBlock>

      <FiltersBlock label="Start date:" isShow={!!currentFilters.startDate}>
        <Chip
          {...chipProps}
          label={currentFilters.startDate?.toLocaleDateString()}
          onDelete={handleRemoveStartDate}
        />
      </FiltersBlock>

      <FiltersBlock label="End date:" isShow={!!currentFilters.endDate}>
        <Chip
          {...chipProps}
          label={currentFilters.endDate?.toLocaleDateString()}
          onDelete={handleRemoveEndDate}
        />
      </FiltersBlock>
    </FiltersResult>
  );
}
