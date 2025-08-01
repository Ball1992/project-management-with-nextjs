'use client';

import { useState, useEffect, useCallback } from 'react';
import { useBoolean, useSetState } from 'minimal-shared/hooks';
import { varAlpha } from 'minimal-shared/utils';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import TableBody from '@mui/material/TableBody';
import Typography from '@mui/material/Typography';
import TableContainer from '@mui/material/TableContainer';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import OutlinedInput from '@mui/material/OutlinedInput';
import Stack from '@mui/material/Stack';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuList from '@mui/material/MenuList';
import ListItemText from '@mui/material/ListItemText';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';
import { RouterLink } from 'src/routes/components';

import { DashboardContent } from 'src/layouts/dashboard';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { Label } from 'src/components/label';
import {
  useTable,
  emptyRows,
  TableNoData,
  getComparator,
  TableEmptyRows,
  TableHeadCustom,
  TableSelectedAction,
  TablePaginationCustom,
} from 'src/components/table';

import { penthouseService } from 'src/services/penthouse.service';
import { locationService } from 'src/services/location.service';
import { propertyTypeService } from 'src/services/property-type.service';
import { offerTypeService } from 'src/services/offer-type.service';
import type { IPenthouse, PenthouseStatistics } from 'src/types/penthouse';
import type { ILocation } from 'src/types/location';
import type { IPropertyType } from 'src/types/property-type';
import type { IOfferType } from 'src/types/offer-type';

import { ListingTableRow } from '../listing-table-row';
import { ListingTableFiltersResult } from '../listing-table-filters-result';
import { ListingFilters } from '../listing-filters';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'listingCode', label: 'Code' },
  { id: 'title', label: 'Name' },
  { id: 'offerType', label: 'Offer Type' },
  { id: 'propertyType', label: 'Property Type' },
  { id: 'status', label: 'Status' },
  { id: 'updatedAt', label: 'Updated' },
  { id: '', label: 'Manage', width: 90 },
];

interface IListingTableFilters {
  name: string;
  status: string;
  location: string;
  propertyType: string;
  offerType: string;
  startDate: Date | null;
  endDate: Date | null;
}

const defaultFilters: IListingTableFilters = {
  name: '',
  status: 'all',
  location: 'all',
  propertyType: 'all',
  offerType: 'all',
  startDate: null,
  endDate: null,
};

// ----------------------------------------------------------------------

export function ListingsListView() {
  const table = useTable();
  const router = useRouter();
  const confirm = useBoolean();
  const filters = useSetState(defaultFilters);
  const filtersDrawer = useBoolean();

  const [tableData, setTableData] = useState<IPenthouse[]>([]);
  const [locations, setLocations] = useState<ILocation[]>([]);
  const [propertyTypes, setPropertyTypes] = useState<IPropertyType[]>([]);
  const [offerTypes, setOfferTypes] = useState<IOfferType[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [exportMenuAnchor, setExportMenuAnchor] = useState<null | HTMLElement>(null);
  const [statistics, setStatistics] = useState<PenthouseStatistics>({
    total: 0,
    draft: 0,
    published: 0,
    closed: 0,
    featured: 0,
  });

  // Get current language from localStorage (set by language-popover)
  const getCurrentLanguage = useCallback(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('selectedLanguageCode') || 'en';
    }
    return 'en';
  }, []);

  const fetchPenthouses = useCallback(async () => {
    try {
      setLoading(true);
      const currentLang = getCurrentLanguage();
      
      const params = {
        page: table.page + 1,
        limit: table.rowsPerPage,
        lang: currentLang, // Include language parameter
        ...(filters.state.status !== 'all' && { status: filters.state.status }),
        ...(filters.state.location !== 'all' && { locationId: filters.state.location }),
        ...(filters.state.propertyType !== 'all' && { propertyTypeId: filters.state.propertyType }),
        ...(filters.state.offerType !== 'all' && { offerTypeId: filters.state.offerType }),
      };

      console.log('Fetching penthouses with params:', params);
      
      const response = await penthouseService.getPenthouses(params);
      
      setTableData(response.data || []);
      setTotalCount(response.total || 0);
    } catch (error) {
      console.error('Error fetching penthouses:', error);
      setTableData([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  }, [table.page, table.rowsPerPage, filters.state, getCurrentLanguage]);

  const fetchFilterData = useCallback(async () => {
    try {
      const currentLang = getCurrentLanguage();
      
      const [locationsRes, propertyTypesRes, offerTypesRes] = await Promise.all([
        locationService.getLocations({ lang: currentLang }),
        propertyTypeService.getPropertyTypes({ lang: currentLang }),
        offerTypeService.getOfferTypes({ lang: currentLang }),
      ]);
      
      setLocations(locationsRes.data || []);
      setPropertyTypes(propertyTypesRes.data || []);
      setOfferTypes(offerTypesRes.data || []);
    } catch (error) {
      console.error('Error fetching filter data:', error);
    }
  }, [getCurrentLanguage]);

  const fetchStatistics = useCallback(async () => {
    try {
      const stats = await penthouseService.getStatistics();
      setStatistics(stats);
    } catch (error) {
      console.error('Error fetching statistics:', error);
    }
  }, []);

  useEffect(() => {
    fetchFilterData();
  }, [fetchFilterData]);

  useEffect(() => {
    fetchPenthouses();
  }, [fetchPenthouses]);

  useEffect(() => {
    fetchStatistics();
  }, [fetchStatistics]);

  // Listen for language changes in localStorage
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'selectedLanguageCode') {
        console.log('Language changed, refetching data...');
        fetchPenthouses();
        fetchFilterData();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [fetchPenthouses, fetchFilterData]);

  const dataFiltered = applyFilter({
    inputData: tableData,
    comparator: getComparator(table.order, table.orderBy),
    filters: filters.state,
  });

  const canReset = Object.keys(filters.state).some(
    (key) => filters.state[key as keyof typeof filters.state] !== defaultFilters[key as keyof typeof defaultFilters]
  );

  const notFound = (!dataFiltered.length && canReset) || (!loading && !dataFiltered.length);

  const handleDeleteRow = useCallback(
    async (id: string) => {
      try {
        await penthouseService.deletePenthouse(id);
        
        const deleteRow = tableData.filter((row) => row.id.toString() !== id);
        setTableData(deleteRow);
        
        table.onUpdatePageDeleteRow(dataFiltered.length);
        fetchPenthouses(); // Refresh data
      } catch (error) {
        console.error('Error deleting penthouse:', error);
      }
    },
    [dataFiltered.length, table, tableData, fetchPenthouses]
  );

  const handleDeleteRows = useCallback(
    async () => {
      try {
        await Promise.all(
          table.selected.map((id) => penthouseService.deletePenthouse(id))
        );
        
        const deleteRows = tableData.filter((row) => !table.selected.includes(row.id.toString()));
        setTableData(deleteRows);
        
        table.onUpdatePageDeleteRows(dataFiltered.length, dataFiltered.length);
        fetchPenthouses(); // Refresh data
      } catch (error) {
        console.error('Error deleting penthouses:', error);
      }
    },
    [dataFiltered.length, table, tableData, fetchPenthouses]
  );

  const handleExportClick = useCallback((event: React.MouseEvent<HTMLElement>) => {
    setExportMenuAnchor(event.currentTarget);
  }, []);

  const handleExportClose = useCallback(() => {
    setExportMenuAnchor(null);
  }, []);

  const handleExportCSV = useCallback(() => {
    // Export to CSV logic
    const csvData = dataFiltered.map((row) => {
      return {
        'Listing Code': row.listingCode || '',
        Name: row.title || '',
        'Offer Type': offerTypes.find(ot => ot.id.toString() === row.offerTypeId)?.name || '',
        'Property Type': propertyTypes.find(pt => pt.id.toString() === row.propertyTypeId)?.name || '',
        Status: row.status,
        Updated: new Date(row.updatedDate).toLocaleDateString(),
      };
    });

    const csvContent = [
      Object.keys(csvData[0] || {}).join(','),
      ...csvData.map(row => Object.values(row).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'listings.csv';
    a.click();
    window.URL.revokeObjectURL(url);
    handleExportClose();
  }, [dataFiltered, offerTypes, propertyTypes]);

  const handleExportExcel = useCallback(() => {
    // Export to Excel logic (simplified)
    console.log('Export to Excel functionality would be implemented here');
    handleExportClose();
  }, []);

  const handleFilterChange = useCallback((field: keyof IListingTableFilters, value: string) => {
    filters.setState({ [field]: value });
    table.onResetPage();
  }, [filters, table]);

  const handleFilterStatus = useCallback(
    (event: React.SyntheticEvent, newValue: string) => {
      table.onResetPage();
      handleFilterChange('status', newValue);
    },
    [handleFilterChange, table]
  );

  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="Listings"
        links={[
          { name: 'Dashboard', href: '/dashboard' },
          { name: 'Our Penthouses' },
          { name: 'Listings' },
        ]}
        action={
          <Button
            component={RouterLink}
            href="/menu/our-penthouses/listings/new"
            variant="contained"
            startIcon={<Iconify icon="mingcute:add-line" />}
          >
            New Listing
          </Button>
        }
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <Card>
        {/* Status Tabs */}
        <Tabs
          value={filters.state.status}
          onChange={handleFilterStatus}
          sx={[
            (theme) => ({
              px: 2.5,
              boxShadow: `inset 0 -2px 0 0 ${varAlpha(theme.vars.palette.grey['500Channel'], 0.08)}`,
            }),
          ]}
        >
          <Tab
            key="all"
            iconPosition="end"
            value="all"
            label="All"
            icon={
              <Label
                variant={
                  ((filters.state.status === 'all') && 'filled') ||
                  'soft'
                }
                color="default"
              >
                {statistics.total}
              </Label>
            }
          />
          <Tab
            key="draft"
            iconPosition="end"
            value="draft"
            label="Draft"
            icon={
              <Label
                variant={
                  ((filters.state.status === 'draft') && 'filled') ||
                  'soft'
                }
                color="info"
              >
                {statistics.draft}
              </Label>
            }
          />
          <Tab
            key="published"
            iconPosition="end"
            value="published"
            label="Published"
            icon={
              <Label
                variant={
                  ((filters.state.status === 'published') && 'filled') ||
                  'soft'
                }
                color="success"
              >
                {statistics.published}
              </Label>
            }
          />
          <Tab
            key="closed"
            iconPosition="end"
            value="closed"
            label="Closed"
            icon={
              <Label
                variant={
                  ((filters.state.status === 'closed') && 'filled') ||
                  'soft'
                }
                color="error"
              >
                {statistics.closed}
              </Label>
            }
          />
        </Tabs>

        {/* Filter Bar */}
        <Box
          sx={{
            p: 2.5,
            gap: 2,
            display: 'flex',
            // pr: { xs: 2.5, md: 1 },
            flexDirection: { xs: 'column', md: 'row' },
            alignItems: { xs: 'flex-end', md: 'center' },
          }}
        >
          {/* Offer Type Dropdown */}
          <FormControl sx={{ flexShrink: 0, width: { xs: 1, md: 200 } }}>
            <InputLabel htmlFor="filter-offer-type-select">Offer Type</InputLabel>
            <Select
              value={filters.state.offerType}
              onChange={(e) => handleFilterChange('offerType', e.target.value)}
              input={<OutlinedInput label="Offer Type" />}
              inputProps={{ id: 'filter-offer-type-select' }}
            >
              <MenuItem value="all">All Offer Types</MenuItem>
              {offerTypes.map((offerType) => {
                const currentTranslation = offerType.translations?.find(t => t.languageCode === getCurrentLanguage()) || offerType.translations?.[0];
                return (
                  <MenuItem key={offerType.id} value={offerType.id.toString()}>
                    {currentTranslation?.name || offerType.name || offerType.code}
                  </MenuItem>
                );
              })}
            </Select>
          </FormControl>

          {/* Property Type Dropdown */}
          <FormControl sx={{ flexShrink: 0, width: { xs: 1, md: 200 } }}>
            <InputLabel htmlFor="filter-property-type-select">Property Type</InputLabel>
            <Select
              value={filters.state.propertyType}
              onChange={(e) => handleFilterChange('propertyType', e.target.value)}
              input={<OutlinedInput label="Property Type" />}
              inputProps={{ id: 'filter-property-type-select' }}
            >
              <MenuItem value="all">All Property Types</MenuItem>
              {propertyTypes.map((propertyType) => (
                <MenuItem key={propertyType.id} value={propertyType.id.toString()}>
                  {propertyType.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Search Input */}
          <Box
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
              value={filters.state.name}
              onChange={(e) => handleFilterChange('name', e.target.value)}
              placeholder="Search..."
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
                    </InputAdornment>
                  ),
                },
              }}
            />
          </Box>

          {/* Filters Component */}
          <ListingFilters
            filters={filters}
            canReset={canReset}
            open={filtersDrawer.value}
            onOpen={filtersDrawer.onTrue}
            onClose={filtersDrawer.onFalse}
          />

          {/* More Options Button */}
          {/* <IconButton onClick={handleExportClick}>
            <Iconify icon="eva:more-vertical-fill" />
          </IconButton> */}
        </Box>

        {/* Export Menu */}
        <Menu
          anchorEl={exportMenuAnchor}
          open={Boolean(exportMenuAnchor)}
          onClose={handleExportClose}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
        >
          <MenuList>
            <MenuItem onClick={handleExportCSV}>
              <ListItemText primary="Export as CSV" />
            </MenuItem>
            <MenuItem onClick={handleExportExcel}>
              <ListItemText primary="Export as Excel" />
            </MenuItem>
          </MenuList>
        </Menu>


        {canReset && (
          <ListingTableFiltersResult
            filters={filters}
            onResetPage={table.onResetPage}
            totalResults={dataFiltered.length}
            sx={{ p: 2.5, pt: 0 }}
          />
        )}

        <TableContainer sx={{ position: 'relative', overflow: 'unset' }}>
          <TableSelectedAction
            dense={table.dense}
            numSelected={table.selected.length}
            rowCount={dataFiltered.length}
            onSelectAllRows={(checked) =>
              table.onSelectAllRows(
                checked,
                dataFiltered.map((row) => row.id.toString())
              )
            }
            action={
              <Button
                size="small"
                color="error"
                variant="contained"
                startIcon={<Iconify icon="solar:trash-bin-trash-bold" />}
                onClick={confirm.onTrue}
              >
                Delete ({table.selected.length})
              </Button>
            }
          />

          <Scrollbar>
            <Table size={table.dense ? 'small' : 'medium'} sx={{ minWidth: 960 }}>
              <TableHeadCustom
                order={table.order}
                orderBy={table.orderBy}
                headCells={TABLE_HEAD}
                rowCount={dataFiltered.length}
                numSelected={table.selected.length}
                onSort={table.onSort}
                onSelectAllRows={(checked) =>
                  table.onSelectAllRows(
                    checked,
                    dataFiltered.map((row) => row.id.toString())
                  )
                }
              />

              <TableBody>
                {dataFiltered.map((row) => (
                  <ListingTableRow
                    key={row.id}
                    row={row}
                    selected={table.selected.includes(row.id.toString())}
                    onSelectRow={() => table.onSelectRow(row.id.toString())}
                    onDeleteRow={() => handleDeleteRow(row.id.toString())}
                    editHref={paths.dashboard.listings.edit(row.id.toString())}
                  />
                ))}

                <TableEmptyRows
                  height={table.dense ? 56 : 76}
                  emptyRows={emptyRows(0, table.rowsPerPage, dataFiltered.length)}
                />

                <TableNoData notFound={notFound} />
              </TableBody>
            </Table>
          </Scrollbar>
        </TableContainer>

        <TablePaginationCustom
          page={table.page}
          dense={table.dense}
          count={totalCount}
          rowsPerPage={table.rowsPerPage}
          onPageChange={table.onChangePage}
          onChangeDense={table.onChangeDense}
          onRowsPerPageChange={table.onChangeRowsPerPage}
        />
      </Card>

      <ConfirmDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        title="Delete"
        content={
          <>
            Are you sure want to delete <strong> {table.selected.length} </strong> items?
          </>
        }
        action={
          <Button
            variant="contained"
            color="error"
            onClick={() => {
              handleDeleteRows();
              confirm.onFalse();
            }}
          >
            Delete
          </Button>
        }
      />
    </DashboardContent>
  );
}

// ----------------------------------------------------------------------

function applyFilter({
  inputData,
  comparator,
  filters,
}: {
  inputData: IPenthouse[];
  comparator: (a: any, b: any) => number;
  filters: IListingTableFilters;
}) {
  const { name, status, location, propertyType, offerType } = filters;

  const stabilizedThis = inputData.map((el, index) => [el, index] as const);

  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });

  inputData = stabilizedThis.map((el) => el[0]);

  if (name) {
    inputData = inputData.filter((penthouse) => {
      return penthouse.title?.toLowerCase().includes(name.toLowerCase()) ||
             penthouse.listingCode?.toLowerCase().includes(name.toLowerCase());
    });
  }

  if (status !== 'all') {
    inputData = inputData.filter((penthouse) => penthouse.status === status);
  }

  if (location !== 'all') {
    inputData = inputData.filter((penthouse) => penthouse.locationId === location);
  }

  if (propertyType !== 'all') {
    inputData = inputData.filter((penthouse) => penthouse.propertyTypeId === propertyType);
  }

  if (offerType !== 'all') {
    inputData = inputData.filter((penthouse) => penthouse.offerTypeId === offerType);
  }

  return inputData;
}

function getCurrentLanguage() {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('selectedLanguageCode') || 'en';
  }
  return 'en';
}
