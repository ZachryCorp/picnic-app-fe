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
import JSZip from 'jszip';
import { Submission } from '@/types';
import { getSubmissionPdf } from '@/api/submissions';

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

// Helper function to convert camelCase to Title Case
const camelCaseToTitleCase = (str: string): string => {
  return str
    .replace(/([A-Z])/g, ' $1') // Add space before capital letters
    .replace(/^./, (match) => match.toUpperCase()) // Capitalize first letter
    .trim();
};

// Helper function to transform data for CSV export
const transformDataForCsv = (data: any): Record<string, any> => {
  // exclude user key
  const { user, ...rest } = data;
  const transformed: Record<string, any> = {};

  for (const [key, value] of Object.entries(rest)) {
    const humanReadableKey = camelCaseToTitleCase(key);

    // Convert boolean values to yes/no
    if (typeof value === 'boolean') {
      transformed[humanReadableKey] = value ? 'yes' : 'no';
    } else {
      transformed[humanReadableKey] = value;
    }
  }

  return transformed;
};

export function DataTable<TData extends Submission, TValue>({
  data,
  columns,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'completed', desc: false },
  ]);
  const [globalFilter, setGlobalFilter] = useState<any>('');
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [isDownloadingPdfs, setIsDownloadingPdfs] = useState(false);

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
      const {
        park,
        guest,
        pendingDependentChildren,
        additionalChildrenReason,
        additionalFullTicket,
        additionalMealTicket,
        ticketNumber,
        deductionPeriods,
        notes,
        completed,
      } = row.original;

      const guestTotal = row.original.guest ? 2 : 1;

      const childrenTotal = row.original.childrenVerification
        ? row.original.pendingDependentChildren
        : row.original.user?.children || 0;

      const additionalMealTicketTotal = additionalMealTicket;

      const additionalFullTicketTotal = additionalFullTicket;

      const totalTickets =
        guestTotal +
        additionalFullTicketTotal +
        additionalMealTicketTotal +
        childrenTotal;

      const dataToExport = {
        firstName: row.original.user?.firstName || '',
        lastName: row.original.user?.lastName || '',
        ein: row.original.user?.ein || '',
        jobNumber: row.original.user?.jobNumber || '',
        department: row.original.user?.location || '',
        park,
        company: row.original.user?.company || '',
        guest,
        lastYearChildren: row.original.user?.children || '',
        requestedChildren: pendingDependentChildren,
        additionalChildrenReason,
        totalFullTicket: additionalFullTicketTotal,
        totalMealTicket: additionalMealTicket,
        totalTickets,
        ticketNumber,
        payrollDeduction: deductionPeriods,
        notes,
        completed,
      };

      // Transform data with human-readable headers and yes/no for booleans
      return transformDataForCsv(dataToExport);
    });
    const csv = generateCsv(csvConfig)(rowData);
    download(csvConfig)(csv);
  };

  const bulkDownloadPdfs = async (rows: Row<Submission>[]) => {
    setIsDownloadingPdfs(true);

    try {
      const zip = new JSZip();
      const pdfPromises: Promise<void>[] = [];

      // Filter rows that have PDFs
      const rowsWithPdfs = rows.filter(
        (row) => row.original.pdfFileName || row.original.pdfFileSize
      );

      if (rowsWithPdfs.length === 0) {
        alert('No PDFs found in the selected submissions.');
        return;
      }

      // Add each PDF to the zip
      rowsWithPdfs.forEach((row) => {
        const promise = getSubmissionPdf(row.original.id.toString())
          .then((pdfBlob) => {
            if (pdfBlob) {
              const fileName =
                row.original.pdfFileName ||
                `submission-${row.original.user?.ein || 'unknown'}-${row.original.id}.pdf`;
              zip.file(fileName, pdfBlob);
            }
          })
          .catch((error) => {
            console.error(
              `Failed to download PDF for submission ${row.original.id}:`,
              error
            );
          });

        pdfPromises.push(promise);
      });

      // Wait for all PDFs to be added to the zip
      await Promise.all(pdfPromises);

      // Generate and download the zip file
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const today = new Date().toISOString().split('T')[0];
      const zipFileName = `submissions-pdfs-${today}.zip`;

      // Create download link
      const url = URL.createObjectURL(zipBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = zipFileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error creating PDF zip file:', error);
      alert('Error occurred while downloading PDFs. Please try again.');
    } finally {
      setIsDownloadingPdfs(false);
    }
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
  const hasCompleted = table.getColumn('completed')?.getFilterValue() as
    | boolean
    | null;

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
            hasCompleted={hasCompleted}
            onCompletedChange={(value) => {
              table.getColumn('completed')?.setFilterValue(value);
            }}
          />
          {(globalFilter || sorting.length > 0 || columnFilters.length > 0) && (
            <Button variant='outline' size='sm' onClick={clearFilters}>
              <X className='w-4 h-4' />
              Clear Filters
            </Button>
          )}
        </div>
        <div className='flex gap-2'>
          <Button
            onClick={() => bulkDownloadPdfs(table.getFilteredRowModel().rows)}
            disabled={isDownloadingPdfs}
            variant='outline'
          >
            {isDownloadingPdfs ? 'Downloading PDFs...' : 'Download PDFs'}
          </Button>
          <Button onClick={() => exportExcel(table.getFilteredRowModel().rows)}>
            Generate Report
          </Button>
        </div>
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
                        className={`pl-4 pr-2 py-3 tracking-wider border-b text-xs font-medium ${pinningStyles.className}`}
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
