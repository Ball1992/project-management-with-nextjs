import type { UseSetStateReturn } from '@/hooks/useSetState';
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
import Chip from '@mui/material/Chip';

import FilterListIcon from '@mui/icons-material/FilterList';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import CloseIcon from '@mui/icons-material/Close';

import { getStatusLabel, getStatusColor, WorkOrderStatus } from '@/types/workorderCustom';

// ----------------------------------------------------------------------

export interface IWorkOrderTableFilters {
  status: string;
}

type Props = {
  open: boolean;
  canReset: boolean;
  onOpen: () => void;
  onClose: () => void;
  filters: UseSetStateReturn<IWorkOrderTableFilters>;
  statusOptions: string[];
};

export function WorkOrderFilters({ 
  open, 
  canReset, 
  onOpen, 
  onClose, 
  filters,
  statusOptions 
}: Props) {
  const { state: currentFilters, setState: updateFilters, resetState: resetFilters } = filters;

  const handleFilterStatus = useCallback(
    (event: any) => {
      updateFilters({ status: event.target.value });
    },
    [updateFilters]
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
              <RestartAltIcon />
            </Badge>
          </IconButton>
        </Tooltip>

        <IconButton onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </Box>

      <Divider sx={{ borderStyle: 'dashed' }} />
    </>
  );

  const renderStatusFilter = () => (
    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
      <Typography variant="subtitle2" sx={{ mb: 1.5 }}>
        Status
      </Typography>

      <FormControl fullWidth size="small">
        <InputLabel>Select Status</InputLabel>
        <Select
          value={currentFilters.status}
          onChange={handleFilterStatus}
          label="Select Status"
        >
          <MenuItem value="">All Statuses</MenuItem>
          {statusOptions.map((status) => (
            <MenuItem key={status} value={status}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Chip
                  label={getStatusLabel(status as WorkOrderStatus) || 'Unknown'}
                  color={getStatusColor(status as WorkOrderStatus)}
                  size="small"
                />
              </Box>
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );

  return (
    <>
      <Button
        disableRipple
        color="inherit"
        endIcon={
          <Badge color="error" variant="dot" invisible={!canReset}>
            <FilterListIcon />
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

        <Box sx={{ px: 2.5, py: 3 }}>
          <Stack spacing={3}>
            {renderStatusFilter()}
          </Stack>
        </Box>
      </Drawer>
    </>
  );
}
