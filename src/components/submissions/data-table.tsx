import { useState, useMemo } from 'react';
import {
  ColumnDef,
  SortingState,
  useReactTable,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  Row,
  ColumnFiltersState,
  Column,
} from '@tanstack/react-table';
import { mkConfig, generateCsv, download } from 'export-to-csv';
import { Submission } from '@/types';

import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
  TableFooter,
} from '../ui/table';
import { DataTablePagination } from '../data-table/pagination';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { X } from 'lucide-react';
import { Filters } from './filters';

interface DataTableProps<TData extends Submission, TValue> {
  data: TData[];
  columns: ColumnDef<TData, TValue>[];
}

const getPinningStyles = <T extends Submission>(
  column: Column<T>
): { className: string; style: React.CSSProperties } => {
  const isPinned = column.getIsPinned();

  if (isPinned === 'right') {
    return {
      className: 'sticky z-30 bg-background',
      style: {
        right: 0,
        borderLeft: '1px solid hsl(var(--border))',
        boxShadow: '-4px 0 6px -1px rgba(0, 0, 0, 0.1)',
      },
    };
  }

  if (isPinned === 'left') {
    const isLastLeftColumn = column.getIsLastColumn('left');
    return {
      className: 'sticky z-30 bg-background',
      style: {
        left: column.getStart('left'),
        borderRight: isLastLeftColumn ? '1px solid hsl(var(--border))' : 'none',
        boxShadow: isLastLeftColumn
          ? '4px 0 6px -1px rgba(0, 0, 0, 0.1)'
          : 'none',
      },
    };
  }

  return {
    className: 'bg-background',
    style: {},
  };
};

export function DataTable<TData extends Submission, TValue>({
  data,
  columns,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState<any>('');
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  const availableJobNumbers = useMemo(() => {
    const jobNumbers = new Set<string>();
    data.forEach((submission) => {
      if (submission.user?.jobNumber) {
        jobNumbers.add(submission.user.jobNumber);
      }
    });
    return Array.from(jobNumbers).sort();
  }, [data]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    globalFilterFn: 'auto',
    initialState: {
      columnPinning: {
        right: ['edit'],
        left: ['user_firstName', 'user_lastName', 'user_ein'],
      },
      columnVisibility: {
        childrenVerification: false,
      },
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    state: {
      sorting,
      globalFilter,
      columnFilters,
    },
    onGlobalFilterChange: setGlobalFilter,
  });

  const today = new Date().toISOString().split('T')[0];
  const csvConfig = mkConfig({
    fieldSeparator: ',',
    filename: `submissions-${today}`,
    decimalSeparator: '.',
    useKeysAsHeaders: true,
  });

  const exportExcel = (rows: Row<Submission>[]) => {
    const rowData = rows.map((row) => {
      const { pdfFile, pdfFileName, pdfFileSize, ...exportData } = row.original;
      return {
        ...exportData,
        user: row.original.user?.ein || '',
      };
    });
    const csv = generateCsv(csvConfig)(rowData);
    download(csvConfig)(csv);
  };

  const clearFilters = () => {
    setGlobalFilter('');
    setSorting([]);
    setColumnFilters([]);
  };

  const selectedParks =
    (table.getColumn('park')?.getFilterValue() as string[]) || [];
  const hasGuest = table.getColumn('guest')?.getFilterValue() as boolean | null;
  const hasChildren = table
    .getColumn('pendingDependentChildren')
    ?.getFilterValue() as boolean | null;
  const hasPayrollDeduction = table
    .getColumn('deductionPeriods')
    ?.getFilterValue() as boolean | null;
  const selectedJobNumbers =
    (table.getColumn('jobNumber')?.getFilterValue() as string[]) || [];
  const hasChildrenVerification = table
    .getColumn('childrenVerification')
    ?.getFilterValue() as boolean | null;

  return (
    <div>
      <div className='flex flex-col justify-between gap-2 md:flex-row md:items-center py-4'>
        <div className='flex gap-2'>
          <Input
            placeholder='Search...'
            value={globalFilter}
            onChange={(e) => table.setGlobalFilter(String(e.target.value))}
            className='max-w-sm min-w-64'
          />
          <Filters
            selectedParks={selectedParks}
            onParksChange={(parks) => {
              table.getColumn('park')?.setFilterValue(parks);
            }}
            hasGuest={hasGuest}
            onGuestChange={(value) => {
              table.getColumn('guest')?.setFilterValue(value);
            }}
            hasChildren={hasChildren}
            onChildrenChange={(value) => {
              table
                .getColumn('pendingDependentChildren')
                ?.setFilterValue(value);
            }}
            hasPayrollDeduction={hasPayrollDeduction}
            onPayrollDeductionChange={(value) => {
              table.getColumn('deductionPeriods')?.setFilterValue(value);
            }}
            selectedJobNumbers={selectedJobNumbers}
            onJobNumbersChange={(jobNumbers) => {
              table.getColumn('jobNumber')?.setFilterValue(jobNumbers);
            }}
            availableJobNumbers={availableJobNumbers}
            hasChildrenVerification={hasChildrenVerification}
            onChildrenVerificationChange={(value) => {
              table.getColumn('childrenVerification')?.setFilterValue(value);
            }}
          />
          {(globalFilter || sorting.length > 0 || columnFilters.length > 0) && (
            <Button variant='outline' size='sm' onClick={clearFilters}>
              <X className='w-4 h-4' />
              Clear Filters
            </Button>
          )}
        </div>
        <Button onClick={() => exportExcel(table.getFilteredRowModel().rows)}>
          Generate Report
        </Button>
      </div>
      <div className='rounded-md border overflow-hidden'>
        <div className='overflow-x-auto'>
          <Table className='relative'>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    const { column } = header;
                    const pinningStyles = getPinningStyles(column);

                    return (
                      <TableHead
                        key={header.id}
                        className={`pl-4 tracking-wider border-b ${pinningStyles.className}`}
                        style={{
                          width: header.getSize(),
                          minWidth: header.getSize(),
                          ...pinningStyles.style,
                        }}
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && 'selected'}
                    className='group'
                  >
                    {row.getVisibleCells().map((cell) => {
                      const { column } = cell;
                      const pinningStyles = getPinningStyles(column);

                      return (
                        <TableCell
                          key={cell.id}
                          className={`whitespace-nowrap ${pinningStyles.className} group-hover:bg-muted/50`}
                          style={{
                            width: cell.column.getSize(),
                            minWidth: cell.column.getSize(),
                            ...pinningStyles.style,
                          }}
                        >
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className='h-24 text-center'
                  >
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
            <TableFooter>
              {table.getFooterGroups().map((footerGroup) => (
                <TableRow key={footerGroup.id}>
                  {footerGroup.headers.map((header) => {
                    const { column } = header;
                    const pinningStyles = getPinningStyles(column);

                    return (
                      <TableHead
                        key={header.id}
                        className={`whitespace-nowrap ${pinningStyles.className.replace('bg-background', 'bg-muted')} group-hover:bg-muted/50`}
                        style={{
                          width: header.getSize(),
                          minWidth: header.getSize(),
                          ...pinningStyles.style,
                        }}
                      >
                        {header.placeholderId
                          ? null
                          : flexRender(
                              header.column.columnDef.footer,
                              header.getContext()
                            )}
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableFooter>
          </Table>
        </div>
      </div>
      <DataTablePagination table={table} />
    </div>
  );
}
