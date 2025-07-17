import { Button } from '../ui/button';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { Filter } from 'lucide-react';

const PARKS = ['Carowinds', 'Six Flags Over Texas', 'Fiesta Texas'] as const;

interface FiltersProps {
  selectedParks: string[];
  onParksChange: (parks: string[]) => void;
  hasGuest: boolean | null;
  onGuestChange: (value: boolean | null) => void;
  hasChildren: boolean | null;
  onChildrenChange: (value: boolean | null) => void;
  hasPayrollDeduction: boolean | null;
  onPayrollDeductionChange: (value: boolean | null) => void;
  selectedJobNumbers: string[];
  onJobNumbersChange: (jobNumbers: string[]) => void;
  availableJobNumbers: string[];
  hasChildrenVerification: boolean | null;
  onChildrenVerificationChange: (value: boolean | null) => void;
  hasCompleted: boolean | null;
  onCompletedChange: (value: boolean | null) => void;
}

export function Filters({
  selectedParks,
  onParksChange,
  hasGuest,
  onGuestChange,
  hasChildren,
  onChildrenChange,
  hasPayrollDeduction,
  onPayrollDeductionChange,
  selectedJobNumbers,
  onJobNumbersChange,
  availableJobNumbers,
  hasChildrenVerification,
  onChildrenVerificationChange,
  hasCompleted,
  onCompletedChange,
}: FiltersProps) {
  const handleParkToggle = (park: string) => {
    if (selectedParks.includes(park)) {
      onParksChange(selectedParks.filter((p) => p !== park));
    } else {
      onParksChange([...selectedParks, park]);
    }
  };

  const handleJobNumberToggle = (jobNumber: string) => {
    if (selectedJobNumbers.includes(jobNumber)) {
      onJobNumbersChange(selectedJobNumbers.filter((j) => j !== jobNumber));
    } else {
      onJobNumbersChange([...selectedJobNumbers, jobNumber]);
    }
  };

  const totalActiveFilters =
    selectedParks.length +
    (hasGuest === true || hasGuest === false ? 1 : 0) +
    (hasChildren === true || hasChildren === false ? 1 : 0) +
    (hasPayrollDeduction === true || hasPayrollDeduction === false ? 1 : 0) +
    (hasChildrenVerification === true || hasChildrenVerification === false
      ? 1
      : 0) +
    selectedJobNumbers.length;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant='outline' size='sm' className='border-dashed'>
          <Filter className='mr-2 h-4 w-4' />
          Filters
          {totalActiveFilters > 0 && (
            <span className='ml-2 rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground'>
              {totalActiveFilters}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='start' className='w-[250px]'>
        <DropdownMenuLabel>Parks</DropdownMenuLabel>
        <DropdownMenuGroup>
          {PARKS.map((park) => (
            <DropdownMenuCheckboxItem
              key={park}
              checked={selectedParks.includes(park)}
              onCheckedChange={() => handleParkToggle(park)}
            >
              {park}
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuGroup>

        <DropdownMenuSeparator />
        <DropdownMenuLabel>Guest</DropdownMenuLabel>
        <DropdownMenuGroup>
          <DropdownMenuCheckboxItem
            checked={hasGuest === true}
            onCheckedChange={() =>
              onGuestChange(hasGuest === true ? null : true)
            }
          >
            With Guest
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem
            checked={hasGuest === false}
            onCheckedChange={() =>
              onGuestChange(hasGuest === false ? null : false)
            }
          >
            Without Guest
          </DropdownMenuCheckboxItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />
        <DropdownMenuLabel>Children</DropdownMenuLabel>
        <DropdownMenuGroup>
          <DropdownMenuCheckboxItem
            checked={hasChildren === true}
            onCheckedChange={() =>
              onChildrenChange(hasChildren === true ? null : true)
            }
          >
            With Children
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem
            checked={hasChildren === false}
            onCheckedChange={() =>
              onChildrenChange(hasChildren === false ? null : false)
            }
          >
            Without Children
          </DropdownMenuCheckboxItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />
        <DropdownMenuLabel>Payroll Deduction</DropdownMenuLabel>
        <DropdownMenuGroup>
          <DropdownMenuCheckboxItem
            checked={hasPayrollDeduction === true}
            onCheckedChange={() =>
              onPayrollDeductionChange(
                hasPayrollDeduction === true ? null : true
              )
            }
          >
            With Payroll Deduction
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem
            checked={hasPayrollDeduction === false}
            onCheckedChange={() =>
              onPayrollDeductionChange(
                hasPayrollDeduction === false ? null : false
              )
            }
          >
            Without Payroll Deduction
          </DropdownMenuCheckboxItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />
        <DropdownMenuLabel>Children Verification</DropdownMenuLabel>
        <DropdownMenuGroup>
          <DropdownMenuCheckboxItem
            checked={hasChildrenVerification === true}
            onCheckedChange={() =>
              onChildrenVerificationChange(
                hasChildrenVerification === true ? null : true
              )
            }
          >
            Verified
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem
            checked={hasChildrenVerification === false}
            onCheckedChange={() =>
              onChildrenVerificationChange(
                hasChildrenVerification === false ? null : false
              )
            }
          >
            Not Verified
          </DropdownMenuCheckboxItem>
        </DropdownMenuGroup>

        {availableJobNumbers.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuLabel>Job Numbers</DropdownMenuLabel>
            <DropdownMenuGroup>
              {availableJobNumbers.map((jobNumber) => (
                <DropdownMenuCheckboxItem
                  key={jobNumber}
                  checked={selectedJobNumbers.includes(jobNumber)}
                  onCheckedChange={() => handleJobNumberToggle(jobNumber)}
                >
                  {jobNumber}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuGroup>
          </>
        )}

        <DropdownMenuSeparator />
        <DropdownMenuLabel>Completed</DropdownMenuLabel>
        <DropdownMenuGroup>
          <DropdownMenuCheckboxItem
            checked={hasCompleted === true}
            onCheckedChange={() =>
              onCompletedChange(hasCompleted === true ? null : true)
            }
          >
            Completed
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem
            checked={hasCompleted === false}
            onCheckedChange={() =>
              onCompletedChange(hasCompleted === false ? null : false)
            }
          >
            Not Completed
          </DropdownMenuCheckboxItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
