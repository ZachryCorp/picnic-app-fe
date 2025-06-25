export type User = {
  id: string;
  lastName: string;
  firstName?: string;
  ein: number;
  jobNumber?: string;
  location?: string;
  email: string;
  children: number;
  guest: boolean;
  createdAt?: string;
  updatedAt?: string;
  submissions?: Submission[];
};

export type Submission = {
  id: string;
  park: Park;
  guest: boolean;
  additionalFullTicket: number;
  additionalMealTicket: number;
  payrollDeduction: boolean;
  deductionPeriods: number;
  childrenVerification: boolean;
  additionalChildrenReason: string;
  childrenVerified: boolean;
  pendingDependentChildren: number;
  ticketsToBeDistributed: number;
  ticketNumber: string;
  notes: string;
  createdAt?: string;
  updatedAt?: string;
  userId: string;
  user: User;
};

export type Park = 'Carowinds' | 'Six Flags Over Texas' | 'Fiesta Texas' | '';
