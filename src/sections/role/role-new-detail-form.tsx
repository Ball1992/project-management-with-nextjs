import type { TableHeadCellProps } from 'src/components/table';
import type { IUserPermisItem, IUserTableFilters } from 'src/types/user';

import { string, z as zod } from 'zod';
import { useState, useCallback, useEffect } from 'react';
import { varAlpha } from 'minimal-shared/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, Controller } from 'react-hook-form';
import { useBoolean, useSetState } from 'minimal-shared/hooks';
import { isValidPhoneNumber } from 'react-phone-number-input/input';

import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Card from '@mui/material/Card';
import Tabs from '@mui/material/Tabs';
import Grid from '@mui/material/Grid2';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import Switch from '@mui/material/Switch';
import Tooltip from '@mui/material/Tooltip';
import TableBody from '@mui/material/TableBody';
import CardHeader from '@mui/material/CardHeader';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';
import { Checkbox, IconButton, InputAdornment, Paper, TableCell, TableHead, TableRow } from '@mui/material';
import FormControlLabel from '@mui/material/FormControlLabel';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { _roles, _roleNames, _permisMenuList, USER_STATUS_OPTIONS } from 'src/_mock';

import { Label } from 'src/components/label';
import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';
import { Form, Field, schemaHelper } from 'src/components/hook-form';
import {
  useTable,
  emptyRows,
  rowInPage,
  TableNoData,
  getComparator,
  TableEmptyRows,
  TableHeadCustom,
  TableSelectedAction,
  TablePaginationCustom,
} from 'src/components/table';

import { RoleNewTableRow } from './role-new-edit-table-row';

// ----------------------------------------------------------------------

export type NewUserSchemaType = zod.infer<typeof NewUserSchema>;

export const NewUserSchema = zod.object({
  name: zod.string().min(1, { message: 'Name is required!' }),
  role: zod.string().min(1, { message: 'Role is required!' }),
  status: zod.string(),
});

// ----------------------------------------------------------------------

type Props = {
  currentData?: IUserPermisItem;
  page?: 'detail' | 'edit';
};

export function RoleDetailForm({ currentData, page }: Props) {
  const router = useRouter();
  const [isPageDetail, setIsPageDetail] = useState<boolean>(page === 'detail' ? true : false);

  useEffect(() => {
    setIsPageDetail(page === 'detail' ? true : false); 
  }, [page]);

  const defaultValues: NewUserSchemaType = {
    status: '',
    name: '',
    role: '',
  };

  const methods = useForm<NewUserSchemaType>({
    mode: 'onSubmit',
    resolver: zodResolver(NewUserSchema),
    defaultValues,
    values: currentData,
  });

  const {
    reset,
    watch,
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const values = watch();

  const handleBack = () => {
    router.push(paths.dashboard.permis.list);
  };

  const onฺBack = handleSubmit(async (data) => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      reset();
      toast.success(currentData ? 'Update success!' : 'Create success!');
      router.push(paths.dashboard.permis.list);
      console.info('DATA', data);
    } catch (error) {
      console.error(error);
    }
  });

  // ----------------------------------------------------------------------

  const TABLE_HEAD = [
    { label: 'ชื่อเมนู', value: 'name', width: 220, align: 'left', component: 'text' },
    { label: 'View', value: 'v', width: 80, align: 'center', component: 'checkbox' },
    { label: 'Create', value: 'c', width: 80, align: 'center', component: 'checkbox' },
    { label: 'Update', value: 'u', width: 80, align: 'center', component: 'checkbox' },
    { label: 'Delete', value: 'd', width: 80, align: 'center', component: 'checkbox' },
  ];

  const table = useTable();

  const [tableData, setTableData] = useState<IUserPermisItem[]>(_permisMenuList);

  const filters = useSetState<IUserTableFilters>({ name: '', roles: [], status: 'all' });
  const { state: currentFilters, setState: updateFilters } = filters;

  const dataFiltered = applyFilter({
    inputData: tableData,
    comparator: getComparator(table.order, table.orderBy),
    filters: currentFilters,
  });

  const canReset =
    !!currentFilters.name || currentFilters.roles.length > 0 || currentFilters.status !== 'all';
  const notFound = (!dataFiltered.length && canReset) || !dataFiltered.length;

  return (
    <Form methods={methods}>
      <Stack spacing={3}>
        <Card>
          <CardHeader title="หัวข้อสิทธิ์การใช้งานระบบ" subheader="Title, short description, image..." sx={{ mb: 3 }} />

          <Stack spacing={3} sx={{ p: 3 }}>
            <Field.Autocomplete
              name="role"
              label='Role'
              autoHighlight
              options={_roleNames.map((option) => option)}
              getOptionLabel={(option) => option}
              renderOption={(props, option) => (
                <li {...props} key={option}>
                  {option}
                </li>
              )}
              disabled={isPageDetail}
            />
            <Field.Text name="name" label="ชื่อ" disabled={isPageDetail}/>
          </Stack>
        </Card>

        <Card>
          <CardHeader
            title="กำหนดสิทธิ์การเข้าใช้งานระบบ" subheader="Title, short description, image..." sx={{ mb: 3 }}
          />
          <Stack spacing={3} sx={{ p: 3 }}>
              <Table size={table.dense ? 'small' : 'medium'} sx={{ minWidth: 960 }}>
              <TableHead>
                <TableRow>
                  {TABLE_HEAD.map((head) => (
                    <TableCell key={head.value} width={head.width} align={head.align as 'left' | 'center' | 'right'}>
                      {head.component === 'checkbox' ? (
                        <>
                          <Checkbox disabled={isPageDetail}
                            value={head.value}
                            onChange={(e) => {
                              console.log(e.target.value);
                            }}
                          />
                          <span>{head.label}</span>
                        </>
                      ) : (
                        <span>{head.label}</span>
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
                <TableBody>
                  {dataFiltered
                    .slice(
                      table.page * table.rowsPerPage,
                      table.page * table.rowsPerPage + table.rowsPerPage
                    )
                    .map((row) => (
                      <RoleNewTableRow
                        key={row.id}
                        row={row}
                        // selected={table.selected.includes(row.id)}
                        // onSelectRow={() => table.onSelectRow(row.id)}
                        // onDeleteRow={() => handleDeleteRow(row.id)}
                        editHref={paths.dashboard.permis.edit(row.id)} selected={[]} onSelectRow={function (): void {
                          throw new Error('Function not implemented.');
                        }} onDeleteRow={function (): void {
                          throw new Error('Function not implemented.');
                        }} disabled={isPageDetail} />
                    ))}

                  <TableEmptyRows
                    height={table.dense ? 56 : 56 + 20}
                    emptyRows={emptyRows(table.page, table.rowsPerPage, dataFiltered.length)}
                  />

                  <TableNoData notFound={notFound} />
                </TableBody>
              </Table>
          </Stack>
        </Card>
        <Paper style={{ position: 'sticky', bottom: 10, right: 10 }}>
          <Box
            sx={{
              mt: 3,
              gap: 2,
              display: 'flex',
              justifyContent: 'flex-end',
            }}
          >
            <FormControlLabel
              label="Publish"
              control={<Switch defaultChecked inputProps={{ id: 'publish-switch' }} />}
              sx={{ pl: 3, flexGrow: 1 }}
              disabled={isPageDetail}
            />

            <LoadingButton
              color="inherit"
              size="large"
              variant="outlined"
              onClick={handleBack}
            >
              Back
            </LoadingButton>
          </Box>
        </Paper>
      </Stack>
    </Form>
  );
}

// ----------------------------------------------------------------------

type ApplyFilterProps = {
  inputData: IUserPermisItem[];
  filters: IUserTableFilters;
  comparator: (a: any, b: any) => number;
};

function applyFilter({ inputData, comparator, filters }: ApplyFilterProps) {
  const { name, status, roles } = filters;

  const stabilizedThis = inputData.map((el, index) => [el, index] as const);

  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });

  inputData = stabilizedThis.map((el) => el[0]);

  if (name) {
    inputData = inputData.filter((user) => user.name.toLowerCase().includes(name.toLowerCase()));
  }

  if (status !== 'all') {
    inputData = inputData.filter((user) => user.status === status);
  }

  if (roles.length) {
    inputData = inputData.filter((user) => roles.includes(user.role || ''));
  }

  return inputData;
}
