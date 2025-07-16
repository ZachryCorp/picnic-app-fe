import { ColumnDef } from '@tanstack/react-table';
import { Submission } from '@/types';
import {
  PencilIcon,
  AlertTriangleIcon,
  CircleAlert,
  CircleCheck,
  CircleX,
} from 'lucide-react';

import { DataTableColumnHeader } from '../data-table/column-header';
import { Button } from '../ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';
import { SubmissionForm } from './form';
import { PdfViewerModal } from './pdf-viewer-modal';
import { useState } from 'react';
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip';

export const columns: ColumnDef<Submission>[] = [
  {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='First Name' />
    ),
    accessorKey: 'user.firstName',
    footer: 'Totals',
  },
  {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Last Name' />
    ),
    accessorKey: 'user.lastName',
  },
  {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='EIN' />
    ),
    accessorKey: 'user.ein',
    cell: ({ row }) => {
      const user = row.original.user;
      return (
        <div className='flex items-center gap-2'>
          {user ? (
            user.ein
          ) : (
            <div className='flex items-center gap-2 text-yellow-600'>
              <AlertTriangleIcon className='w-4 h-4' />
              <span>User not found</span>
            </div>
          )}
        </div>
      );
    },
  },
  {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Job No.' />
    ),
    id: 'jobNumber',
    accessorFn: (row) => row.user?.jobNumber,
    filterFn: (row, _, value: string[]) => {
      const jobNumber = row.original.user?.jobNumber;

      return (
        value.length === 0 || (jobNumber ? value.includes(jobNumber) : false)
      );
    },
  },
  {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Dept/Project/Plant/Hotel' />
    ),
    accessorKey: 'user.location',
  },
  {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Park' />
    ),
    accessorKey: 'park',
    filterFn: (row, _, value: string[]) => {
      return value.length === 0 || value.includes(row.getValue('park'));
    },
  },
  {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Company' />
    ),
    accessorKey: 'user.company',
    filterFn: (row, _, value: string[]) => {
      return value.length === 0 || value.includes(row.getValue('user.company'));
    },
  },
  {
    header: 'Employee + Guest',
    accessorKey: 'guest',
    cell: ({ row }) => {
      return row.original.guest ? 2 : 1;
    },
    filterFn: (row, _, value: boolean | null) => {
      if (value === null) return true;
      return row.original.guest === value;
    },
  },
  {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Last Year Children Count' />
    ),
    accessorKey: 'user.children',
  },
  {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Req. Children' />
    ),
    accessorKey: 'pendingDependentChildren',
    cell: ({ row }) => {
      const user = row.original.user;
      return row.original.childrenVerification
        ? row.original.pendingDependentChildren
        : user?.children || 0;
    },
    filterFn: (row, _, value: boolean | null) => {
      if (value === null) return true;
      const hasChildren = row.original.childrenVerification
        ? row.original.pendingDependentChildren > 0
        : (row.original.user?.children || 0) > 0;
      return hasChildren === value;
    },
  },
  {
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title='Total Full Tickets to Purchase'
      />
    ),
    accessorKey: 'additionalFullTicket',
    enableResizing: true,
    cell: ({ row }) => {
      const guest = row.original.guest ? 2 : 1;
      const additionalFullTicket = row.original.additionalFullTicket;
      const children = row.original.childrenVerification
        ? row.original.pendingDependentChildren
        : row.original.user?.children || 0;

      const totalTickets = guest + additionalFullTicket + children;
      return totalTickets;
    },
  },
  {
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title='Total Meal Tickets to Purchase'
      />
    ),
    accessorKey: 'additionalMealTicket',
    enableResizing: true,
  },
  {
    header: 'Total Tickets',
    cell: ({ row }) => {
      const guest = row.original.guest ? 2 : 1;
      const additionalFullTicket = row.original.additionalFullTicket;
      const additionalMealTicket = row.original.additionalMealTicket;
      const children = row.original.childrenVerification
        ? row.original.pendingDependentChildren
        : row.original.user?.children || 0;

      const totalTickets =
        guest + additionalFullTicket + additionalMealTicket + children;
      return totalTickets;
    },
    aggregationFn: 'sum',
    footer: ({ table }) => {
      const rows = table.getFilteredRowModel().rows;

      const total = rows.reduce((acc, row) => {
        const guest = row.original.guest ? 2 : 1;
        const additionalFullTicket = row.original.additionalFullTicket;
        const additionalMealTicket = row.original.additionalMealTicket;
        const children = row.original.childrenVerification
          ? row.original.pendingDependentChildren
          : row.original.user?.children || 0;

        return (
          acc + guest + additionalFullTicket + additionalMealTicket + children
        );
      }, 0);
      return total;
    },
  },
  {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Ticket Number' />
    ),
    accessorKey: 'ticketNumber',
  },
  {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Payroll Deductions' />
    ),
    accessorKey: 'deductionPeriods',
    filterFn: (row, _, value: boolean | null) => {
      if (value === null) return true;
      return row.original.deductionPeriods > 0 === value;
    },
  },
  {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Notes' />
    ),
    accessorKey: 'notes',
    cell: ({ row }) => {
      // if notes is a long string, truncate it and add a tooltip
      if (row.original.notes.length > 32) {
        return (
          <Tooltip>
            <TooltipTrigger className='w-4' asChild>
              <span className='truncate'>
                {row.original.notes.slice(0, 32)}
              </span>
            </TooltipTrigger>
            <TooltipContent>{row.original.notes}</TooltipContent>
          </Tooltip>
        );
      }
      return row.original.notes || '-';
    },
  },
  {
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title='Additional Children Reason'
      />
    ),
    accessorKey: 'additionalChildrenReason',
    cell: ({ row }) => {
      if (
        row.original.additionalChildrenReason &&
        row.original.additionalChildrenReason.length > 32
      ) {
        return (
          <Tooltip>
            <TooltipTrigger className='w-4' asChild>
              <span className='truncate'>
                {row.original.additionalChildrenReason.slice(0, 32)}
              </span>
            </TooltipTrigger>
            <TooltipContent>
              {row.original.additionalChildrenReason}
            </TooltipContent>
          </Tooltip>
        );
      }
      return row.original.additionalChildrenReason || '-';
    },
  },
  {
    header: 'Children Verification',
    accessorKey: 'childrenVerification',
  },
  {
    header: 'PDF',
    accessorKey: 'pdf',
    cell: ({ row }) => {
      return <PdfViewerModal submission={row.original} />;
    },
  },
  {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Completed' />
    ),
    accessorKey: 'completed',
    cell: ({ row }) => {
      return row.original.completed ? (
        <CircleCheck className='w-4 h-4 text-success' />
      ) : (
        <CircleX className='w-4 h-4 text-destructive' />
      );
    },
  },
  {
    header: 'Edit',
    accessorKey: 'edit',
    cell: ({ row }) => {
      const [open, setOpen] = useState(false);
      const closeModal = () => setOpen(false);

      return (
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <div className='flex items-center gap-2'>
              <Button className='cursor-pointer' size='icon' variant='ghost'>
                <PencilIcon className='w-4 h-4' />
              </Button>
              <Tooltip>
                <TooltipTrigger asChild>
                  {row.original.childrenVerification && (
                    <CircleAlert className='w-4 h-4 text-destructive' />
                  )}
                </TooltipTrigger>
                <TooltipContent>
                  Children Verification is required for this order
                </TooltipContent>
              </Tooltip>
            </div>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Submission</DialogTitle>
            </DialogHeader>
            <SubmissionForm submission={row.original} closeModal={closeModal} />
          </DialogContent>
        </Dialog>
      );
    },
  },
];
