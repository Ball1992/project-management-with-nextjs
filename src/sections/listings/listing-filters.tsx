import type { UseSetStateReturn } from 'minimal-shared/hooks';

import dayjs from 'dayjs';
import { useCallback } from 'react';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Badge from '@mui/material/Badge';
import Drawer from '@mui/material/Drawer';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

// ----------------------------------------------------------------------

interface IListingTableFilters {
  name: string;
  status: string;
  location: string;
  propertyType: string;
  offerType: string;
  startDate: Date | null;
  endDate: Date | null;
}

type Props = {
  open: boolean;
  canReset: boolean;
  onOpen: () => void;
  onClose: () => void;
  filters: UseSetStateReturn<IListingTableFilters>;
};

const STATUS_OPTIONS = [
  { value: 'all', label: 'All Status' },
  { value: 'published', label: 'Published' },
  { value: 'draft', label: 'Draft' },
  { value: 'archived', label: 'Archived' },
];

const LOCATION_OPTIONS = [
  { value: 'all', label: 'All Locations' },
  { value: 'bangkok', label: 'Bangkok' },
  { value: 'phuket', label: 'Phuket' },
  { value: 'pattaya', label: 'Pattaya' },
  { value: 'koh-samui', label: 'Koh Samui' },
];

const PROPERTY_TYPE_OPTIONS = [
  { value: 'all', label: 'All Property Types' },
  { value: 'penthouse', label: 'Penthouse' },
  { value: 'condo', label: 'Condo' },
  { value: 'villa', label: 'Villa' },
  { value: 'apartment', label: 'Apartment' },
];

const OFFER_TYPE_OPTIONS = [
  { value: 'all', label: 'All Offer Types' },
  { value: 'sale', label: 'For Sale' },
  { value: 'rent', label: 'For Rent' },
  { value: 'rent-daily', label: 'Daily Rental' },
];

export function ListingFilters({ open, canReset, onOpen, onClose, filters }: Props) {
  const { state: currentFilters, setState: updateFilters, resetState: resetFilters } = filters;

  const handleFilterStatus = useCallback(
    (event: any) => {
      updateFilters({ status: event.target.value });
    },
    [updateFilters]
  );

  const handleFilterLocation = useCallback(
    (event: any) => {
      updateFilters({ location: event.target.value });
    },
    [updateFilters]
  );

  const handleFilterPropertyType = useCallback(
    (event: any) => {
      updateFilters({ propertyType: event.target.value });
    },
    [updateFilters]
  );

  const handleFilterOfferType = useCallback(
    (event: any) => {
      updateFilters({ offerType: event.target.value });
    },
    [updateFilters]
  );

  const handleFilterStartDate = useCallback(
    (newValue: dayjs.Dayjs | null) => {
      updateFilters({ startDate: newValue ? newValue.toDate() : null });
    },
    [updateFilters]
  );

  const handleFilterEndDate = useCallback(
    (newValue: dayjs.Dayjs | null) => {
      updateFilters({ endDate: newValue ? newValue.toDate() : null });
    },
    [updateFilters]
  );

  const handleAcceptStartDate = useCallback(
    (newValue: dayjs.Dayjs | null) => {
      updateFilters({ startDate: newValue ? newValue.toDate() : null });
      onClose();
    },
    [updateFilters, onClose]
  );

  const handleAcceptEndDate = useCallback(
    (newValue: dayjs.Dayjs | null) => {
      updateFilters({ endDate: newValue ? newValue.toDate() : null });
      onClose();
    },
    [updateFilters, onClose]
  );

  const renderHead = () => (
    <>
      <Box
        sx={{
          py: 2,
          pr: 1,
          pl: 2.5,
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          Filters
        </Typography>

        <Tooltip title="Reset">
          <IconButton onClick={() => resetFilters()}>
            <Badge color="error" variant="dot" invisible={!canReset}>
              <Iconify icon="solar:restart-bold" />
            </Badge>
          </IconButton>
        </Tooltip>

        <IconButton onClick={onClose}>
          <Iconify icon="mingcute:close-line" />
        </IconButton>
      </Box>

      <Divider sx={{ borderStyle: 'dashed' }} />
    </>
  );

  const renderStatus = () => (
    <FormControl fullWidth>
      <InputLabel>Status</InputLabel>
      <Select
        value={currentFilters.status}
        onChange={handleFilterStatus}
        label="Status"
      >
        {STATUS_OPTIONS.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );

  const renderLocation = () => (
    <FormControl fullWidth>
      <InputLabel>Location</InputLabel>
      <Select
        value={currentFilters.location}
        onChange={handleFilterLocation}
        label="Location"
      >
        {LOCATION_OPTIONS.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );

  const renderPropertyType = () => (
    <FormControl fullWidth>
      <InputLabel>Property Type</InputLabel>
      <Select
        value={currentFilters.propertyType}
        onChange={handleFilterPropertyType}
        label="Property Type"
      >
        {PROPERTY_TYPE_OPTIONS.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );

  const renderOfferType = () => (
    <FormControl fullWidth>
      <InputLabel>Offer Type</InputLabel>
      <Select
        value={currentFilters.offerType}
        onChange={handleFilterOfferType}
        label="Offer Type"
      >
        {OFFER_TYPE_OPTIONS.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );

  const renderDateRange = () => (
    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
      <Typography variant="subtitle2" sx={{ mb: 1.5 }}>
        Date Range
      </Typography>

      <DatePicker
        label="Start date"
        value={currentFilters.startDate ? dayjs(currentFilters.startDate) : null}
        onChange={handleFilterStartDate}
        onAccept={handleAcceptStartDate}
        sx={{ mb: 2.5 }}
      />

      <DatePicker
        label="End date"
        value={currentFilters.endDate ? dayjs(currentFilters.endDate) : null}
        onChange={handleFilterEndDate}
        onAccept={handleAcceptEndDate}
      />
    </Box>
  );

  return (
    <>
      <Button
        sx={{ px: 3.5 }}
        disableRipple
        color="inherit"
        endIcon={
          <Badge color="error" variant="dot" invisible={!canReset}>
            <Iconify icon="ic:round-filter-list" />
          </Badge>
        }
        onClick={onOpen}
      >
        Filters
      </Button>

      <Drawer
        anchor="right"
        open={open}
        onClose={onClose}
        slotProps={{ backdrop: { invisible: true } }}
        PaperProps={{ sx: { width: 320 } }}
      >
        {renderHead()}

        <Scrollbar sx={{ px: 2.5, py: 3 }}>
          <Stack spacing={3}>
            {renderStatus()}
            {renderLocation()}
            {renderPropertyType()}
            {renderOfferType()}
            {renderDateRange()}
          </Stack>
        </Scrollbar>
      </Drawer>
    </>
  );
}
