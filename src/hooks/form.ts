import { create } from 'zustand';
import { Park, User } from '@/types';

interface FormStepper {
  currentStep: number;
  setCurrentStep: (step: number) => void;
  incrementCurrentStep: () => void;
  decrementCurrentStep: () => void;

  includePayrollDeduction: boolean;
  setIncludePayrollDeduction: (include: boolean) => void;

  childrenVerification: boolean;
  setChildrenVerification: (verification: boolean) => void;

  additionalChildrenReason: string;
  setAdditionalChildrenReason: (reason: string) => void;

  user: User;
  setUser: (user: User) => void;

  park: Park;
  setPark: (park: Park) => void;

  fullTicketCount: number;
  setFullTicketCount: (count: number) => void;
  mealTicketCount: number;
  setMealTicketCount: (count: number) => void;
  providedTicketCount: number;
  setProvidedTicketCount: (count: number) => void;

  payrollDeductionAmount: number;
  setPayrollDeductionAmount: (amount: number) => void;

  deductionPeriods: number;
  setDeductionPeriods: (periods: number) => void;
}

export const useFormStepper = create<FormStepper>()((set) => ({
  currentStep: 0,
  setCurrentStep: (step: number) => set({ currentStep: step }),
  incrementCurrentStep: () =>
    set((state) => ({ currentStep: state.currentStep + 1 })),
  decrementCurrentStep: () =>
    set((state) => ({ currentStep: state.currentStep - 1 })),

  includePayrollDeduction: false,
  setIncludePayrollDeduction: (include: boolean) =>
    set({ includePayrollDeduction: include }),

  childrenVerification: false,
  setChildrenVerification: (verification: boolean) =>
    set({ childrenVerification: verification }),

  additionalChildrenReason: '',
  setAdditionalChildrenReason: (reason: string) =>
    set({ additionalChildrenReason: reason }),

  park: '',
  setPark: (park: Park) => set({ park }),

  user: {
    id: '',
    ein: 0,
    lastName: '',
    firstName: '',
    jobNumber: '',
    location: '',
    email: '',
    children: 0,
    guest: false,
    createdAt: '',
    updatedAt: '',
  },
  setUser: (user: User) => set({ user }),

  fullTicketCount: 0,
  setFullTicketCount: (count: number) => set({ fullTicketCount: count }),
  mealTicketCount: 0,
  setMealTicketCount: (count: number) => set({ mealTicketCount: count }),
  providedTicketCount: 0,
  setProvidedTicketCount: (count: number) =>
    set({ providedTicketCount: count }),

  payrollDeductionAmount: 0,
  setPayrollDeductionAmount: (amount: number) =>
    set({ payrollDeductionAmount: amount }),

  deductionPeriods: 0,
  setDeductionPeriods: (periods: number) => set({ deductionPeriods: periods }),
}));
