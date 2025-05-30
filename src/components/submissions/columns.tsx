import { ColumnDef } from '@tanstack/react-table';
import { Submission } from '@/types';
import { PencilIcon, AlertTriangleIcon } from 'lucide-react';

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
import { useState } from 'react';
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip';

export const columns: ColumnDef<Submission>[] = [
  {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='First Name' />
    ),
    accessorKey: 'user.firstName',
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
      <DataTableColumnHeader column={column} title='Job#/Location/Plant' />
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
      <DataTableColumnHeader column={column} title='Children' />
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
      <DataTableColumnHeader column={column} title='Full Tickets to Purchase' />
    ),
    accessorKey: 'additionalFullTicket',
    enableResizing: true,
  },
  {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Meal Tickets to Purchase' />
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
      <DataTableColumnHeader column={column} title='Park' />
    ),
    accessorKey: 'park',
    filterFn: (row, _, value: string[]) => {
      return value.length === 0 || value.includes(row.getValue('park'));
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
    header: 'Children Verification',
    accessorKey: 'childrenVerification',
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
            <Button className='cursor-pointer' size='icon' variant='ghost'>
              <PencilIcon className='w-4 h-4' />
            </Button>
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
