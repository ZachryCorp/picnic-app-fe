import { z } from 'zod';

export const EmployeeSchema = z.object({
  ein: z.string().min(6),
  lastName: z.string().min(1),
  firstName: z.string().min(1),
});

export type Employee = z.infer<typeof EmployeeSchema>;

export const UserSchema = z.object({
  ein: z.string().min(3),
  lastName: z.string().min(1),
  firstName: z.string().min(1),
  jobNumber: z.string().min(1),
  email: z.string().email().optional(),
  children: z.number().min(0),
  guest: z.number().min(0),
  createdAt: z.string().min(1),
  updatedAt: z.string().min(1),
});

export type User = z.infer<typeof UserSchema>;

export const step1Schema = z.object({
  ein: z.string().min(3, { message: 'EIN must be at least 3 digits' }),
  lastName: z.string().min(1, { message: 'Last name is required' }),
  park: z.enum(['Carowinds', 'Six Flags Over Texas', 'Fiesta Texas'], {
    message: 'Invalid park',
  }),
});

export const step2Schema = z.object({
  name: z.string().min(1),
  jobNumber: z.string().min(1),
  location: z.string().min(1),
  employeeTickets: z.number().min(0),
  guestTickets: z.number().max(1).min(0),
  childrenTickets: z.number().min(0),
  additionalChildrenReason: z.string().optional(),
});

export const step3Schema = z.object({
  fullTicketQuantity: z.number().min(0).max(10),
  mealTicketQuantity: z.number().min(0).max(10),
});

export const step4Schema = z.object({
  email: z.string().email().optional().or(z.literal('')),
});

export const FormSchema = step1Schema
  .merge(step2Schema)
  .merge(step3Schema.partial())
  .merge(step4Schema);
export type FormValues = z.infer<typeof FormSchema>;

export const PayrollDeductionFormSchema = z.object({
  name: z.string().min(1),
  employeeId: z.string().min(1),
  department: z.string().min(1),
  company: z.string().min(1),
  date: z.string().min(1),
  amount: z.string().min(1),
  payPeriods: z.string().min(1).max(4),
  date2: z.string().min(1),
});

export type PayrollDeductionFormValues = z.infer<
  typeof PayrollDeductionFormSchema
>;
