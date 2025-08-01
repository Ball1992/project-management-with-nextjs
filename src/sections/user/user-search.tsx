import type { IJobItem } from 'src/types/job';
import type { Theme, SxProps } from '@mui/material/styles';

import parse from 'autosuggest-highlight/parse';
import match from 'autosuggest-highlight/match';
import { useDebounce } from 'minimal-shared/hooks';
import { useState, useEffect, useCallback } from 'react';
import { usePopover, UseSetStateReturn } from 'minimal-shared/hooks';

import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Link, { linkClasses } from '@mui/material/Link';
import InputAdornment from '@mui/material/InputAdornment';
import Autocomplete, { autocompleteClasses } from '@mui/material/Autocomplete';
import { Box, Checkbox, FormControl, InputLabel, MenuItem, MenuList, OutlinedInput, Select, SelectChangeEvent } from '@mui/material';

import { useRouter } from 'src/routes/hooks';
import { RouterLink } from 'src/routes/components';

import { _jobs } from 'src/_mock';

import { Iconify } from 'src/components/iconify';
import { CustomPopover } from 'src/components/custom-popover';
import { SearchNotFound } from 'src/components/search-not-found';

import { IUserTableFilters } from 'src/types/user';


// ----------------------------------------------------------------------

type Props = {
  sx?: SxProps<Theme>;
  redirectPath: (id: string) => string;
  onResetPage: () => void;
  filters: UseSetStateReturn<IUserTableFilters>;
  options: {
    roles: string[];
  };
};

export function UserSearch({ filters, options, onResetPage, redirectPath, sx }: Props) {
  const router = useRouter();
  const menuActions = usePopover();

  const { state: currentFilters, setState: updateFilters } = filters;


  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState<IJobItem | null>(null);

  const debouncedQuery = useDebounce(searchQuery);
  // const { searchResults: options, searchLoading: loading } = useSearchData(debouncedQuery);

  const handleChange = useCallback(
    (item: IJobItem | null) => {
      setSelectedItem(item);
      if (item) {
        router.push(redirectPath(item.id));
      }
    },
    [redirectPath, router]
  );

  const paperStyles: SxProps<Theme> = {
    width: 320,
    [` .${autocompleteClasses.listbox}`]: {
      [` .${autocompleteClasses.option}`]: {
        p: 0,
        [` .${linkClasses.root}`]: {
          px: 1,
          py: 0.75,
          width: 1,
        },
      },
    },
  };

  const renderMenuActions = () => (
    <CustomPopover
      open={menuActions.open}
      anchorEl={menuActions.anchorEl}
      onClose={menuActions.onClose}
      slotProps={{ arrow: { placement: 'right-top' } }}
    >
      <MenuList>
        <MenuItem onClick={() => menuActions.onClose()}>
          <Iconify icon="solar:printer-minimalistic-bold" />
          Print
        </MenuItem>

        <MenuItem onClick={() => menuActions.onClose()}>
          <Iconify icon="solar:import-bold" />
          Import
        </MenuItem>

        <MenuItem onClick={() => menuActions.onClose()}>
          <Iconify icon="solar:export-bold" />
          Export
        </MenuItem>
      </MenuList>
    </CustomPopover>
  );

  const handleFilterName = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      onResetPage();
      updateFilters({ name: event.target.value });
    },
    [onResetPage, updateFilters]
  );

  const handleFilterRole = useCallback(
    (event: SelectChangeEvent<string[]>) => {
      const newValue =
        typeof event.target.value === 'string' ? event.target.value.split(',') : event.target.value;

      onResetPage();
      updateFilters({ roles: newValue });
    },
    [onResetPage, updateFilters]
  );

  return (
    
      <><FormControl sx={{ flexShrink: 0, width: { xs: 1, md: 400 } }}>
      <InputLabel htmlFor="filter-role-select">Role</InputLabel>
      <Select
        multiple
        value={currentFilters.roles}
        onChange={handleFilterRole}
        input={<OutlinedInput label="Role  " />}
        renderValue={(selected) => selected.map((value) => value).join(', ')}
        inputProps={{ id: 'filter-role-select' }}
        MenuProps={{ PaperProps: { sx: { maxHeight: 400 } } }}
      >
        {options.roles.map((option) => (
          <MenuItem key={option} value={option}>
            <Checkbox
              disableRipple
              size="small"
              checked={currentFilters.roles.includes(option)} />
            {option}
          </MenuItem>
        ))}
      </Select>
    </FormControl><Box
      sx={{
        gap: 2,
        width: 1,
        flexGrow: 1,
        display: 'flex',
        alignItems: 'center',
      }}
    >
        <TextField
          fullWidth
          value={currentFilters.name}
          onChange={handleFilterName}
          placeholder="Search..."
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
                </InputAdornment>
              ),
            },
          }} />

        {/* <IconButton onClick={menuActions.onOpen}>
      <Iconify icon="eva:more-vertical-fill" />
    </IconButton> */}
      </Box></>
  
    // {renderMenuActions()}
    
  );
}

// ----------------------------------------------------------------------

function useSearchData(searchQuery: string) {
  const [searchResults, setSearchResults] = useState<IJobItem[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);

  const fetchSearchResults = useCallback(async () => {
    setSearchLoading(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 500));

      const results = _jobs.filter(({ title }) =>
        [title].some((field) => field?.toLowerCase().includes(searchQuery.toLowerCase()))
      );

      setSearchResults(results);
    } catch (error) {
      console.error(error);
    } finally {
      setSearchLoading(false);
    }
  }, [searchQuery]);

  useEffect(() => {
    if (searchQuery) {
      fetchSearchResults();
    } else {
      setSearchResults([]);
    }
  }, [fetchSearchResults, searchQuery]);

  return { searchResults, searchLoading };
}
