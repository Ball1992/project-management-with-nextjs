import type { UseSetStateReturn } from 'minimal-shared/hooks';
import type { FiltersResultProps } from 'src/components/filters-result';

import { useCallback } from 'react';

import Chip from '@mui/material/Chip';

import { chipProps, FiltersBlock, FiltersResult } from 'src/components/filters-result';

// ----------------------------------------------------------------------

interface IListingTableFilters {
  name: string;
  status: string;
  location: string;
  propertyType: string;
  startDate: Date | null;
  endDate: Date | null;
}

type Props = FiltersResultProps & {
  onResetPage: () => void;
  filters: UseSetStateReturn<IListingTableFilters>;
};

export function ListingTableFiltersResult({ filters, onResetPage, totalResults, sx }: Props) {
  const { state: currentFilters, setState: updateFilters, resetState: resetFilters } = filters;

  const handleRemoveKeyword = useCallback(() => {
    onResetPage();
    updateFilters({ name: '' });
  }, [onResetPage, updateFilters]);

  const handleRemoveStatus = useCallback(() => {
    onResetPage();
    updateFilters({ status: 'all' });
  }, [onResetPage, updateFilters]);

  const handleRemoveLocation = useCallback(() => {
    onResetPage();
    updateFilters({ location: 'all' });
  }, [onResetPage, updateFilters]);

  const handleRemovePropertyType = useCallback(() => {
    onResetPage();
    updateFilters({ propertyType: 'all' });
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
      <FiltersBlock label="Status:" isShow={currentFilters.status !== 'all'}>
        <Chip
          {...chipProps}
          label={currentFilters.status}
          onDelete={handleRemoveStatus}
          sx={{ textTransform: 'capitalize' }}
        />
      </FiltersBlock>

      <FiltersBlock label="Location:" isShow={currentFilters.location !== 'all'}>
        <Chip
          {...chipProps}
          label={currentFilters.location}
          onDelete={handleRemoveLocation}
          sx={{ textTransform: 'capitalize' }}
        />
      </FiltersBlock>

      <FiltersBlock label="Property Type:" isShow={currentFilters.propertyType !== 'all'}>
        <Chip
          {...chipProps}
          label={currentFilters.propertyType}
          onDelete={handleRemovePropertyType}
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
