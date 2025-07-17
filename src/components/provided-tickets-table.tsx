import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';
import { useTranslation } from 'react-i18next';

export function ProvidedTicketsTable({
  guestTickets,
  childrenTickets,
}: {
  guestTickets: number;
  childrenTickets: number;
}) {
  const totalTickets = guestTickets + childrenTickets + 1;
  const { t } = useTranslation();

  return (
    <Table className='border text-[9px] sm:text-base'>
      <TableHeader className='bg-blue-200'>
        <TableRow>
          <TableHead className='font-bold'>
            {t('ticketsProvidedByZachryCorp')}
          </TableHead>
          <TableHead></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell>{t('employee')}</TableCell>
          <TableCell className='text-right'>1</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>
            {t('spouse')} <span className='font-bold'>{t('or')}</span>{' '}
            {t('guest')}
          </TableCell>
          <TableCell className='text-right'>{guestTickets}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>{t('children')}</TableCell>
          <TableCell className='text-right'>{childrenTickets}</TableCell>
        </TableRow>
      </TableBody>
      <TableFooter className='bg-blue-200'>
        <TableRow>
          <TableCell className='font-bold'>
            {t('totalProvidedByZachry')}
          </TableCell>
          <TableCell className='text-right'>{totalTickets}</TableCell>
        </TableRow>
      </TableFooter>
    </Table>
  );
}
