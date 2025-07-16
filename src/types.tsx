export type User = {
  ein: number;
  lastName: string;
  firstName?: string;
  jobNumber?: string;
  location?: string;
  company?: string;
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
  ticketNumber: string;
  notes: string;
  completed: boolean;
  // PDF fields
  pdfFile?: ArrayBuffer | null;
  pdfFileName?: string | null;
  pdfFileSize?: number | null;
  createdAt?: string;
  updatedAt?: string;
  userId: string;
  user: User;
};

export type Park = 'Carowinds' | 'Six Flags Over Texas' | 'Fiesta Texas' | '';
