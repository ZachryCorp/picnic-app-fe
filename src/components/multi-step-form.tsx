import { Step1 } from './step-1';
import { Step2 } from './step-2';
import { Step3 } from './step-3';
import { Step4 } from './step-4';
import { StepIndicator } from './step-indicator';

import { Button } from './ui/button';

import { ArrowLeftIcon } from 'lucide-react';
import { useFormStepper } from '@/hooks/form';
import { useTranslation } from 'react-i18next';
import { lazy, Suspense } from 'react';
import { LanguageToggle } from './language-toggle';

// Lazy load PayrollDeductionForm to prevent PDF dependencies from being bundled eagerly
const PayrollDeductionForm = lazy(() => import('./payroll-deduction-form'));

export function MultiStepForm() {
  const { t } = useTranslation();

  const { currentStep, includePayrollDeduction, decrementCurrentStep } =
    useFormStepper();

  const allSteps = [
    {
      label: t('welcome'),
      component: <Step1 />,
    },
    {
      label: t('orderDetails'),
      component: <Step2 />,
    },
    {
      label: t('purchaseAdditionalTickets'),
      component: <Step3 />,
      description: t('purchaseAdditionalTicketsDescription'),
    },
    {
      label: t('payrollDeduction'),
      component: (
        <Suspense
          fallback={
            <div className='flex items-center justify-center p-8'>
              <div className='text-center'>
                <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2'></div>
                <p className='text-muted-foreground'>Loading form...</p>
              </div>
            </div>
          }
        >
          <PayrollDeductionForm />
        </Suspense>
      ),
    },
    {
      label: t('orderSummary'),
      component: <Step4 />,
    },
  ];

  const steps = includePayrollDeduction
    ? allSteps
    : allSteps.filter((_, i) => i !== 2 && i !== 3);

  const isFirstStep = currentStep === 0;

  return (
    <div className='flex flex-col w-full px-4 sm:px-8 sm:max-w-[1000px] items-center justify-center space-y-4'>
      {!isFirstStep ? (
        <div className='flex items-center justify-between w-full p-3 sm:px-0 sm:py-4'>
          <Button
            className='mt-3 self-start'
            variant='link'
            onClick={() => decrementCurrentStep()}
            disabled={isFirstStep}
          >
            <ArrowLeftIcon className='w-4 h-4' />
            {t('back')}
          </Button>
          <LanguageToggle />
        </div>
      ) : (
        <div className='min-h-20 flex items-center justify-end w-full py-3'>
          <LanguageToggle />
        </div>
      )}
      <img src='/img/zachry-logo.webp' alt='Zachry Logo' />

      <StepIndicator current={currentStep} steps={steps} />
      <div className='flex flex-col items-center justify-center space-y-2'>
        <h1 className='text-center'>{steps[currentStep].label}</h1>
        <p className='text-muted-foreground text-center'>
          {steps[currentStep].description ?? ''}
        </p>
      </div>
      <div className='w-full'>{steps[currentStep].component}</div>
    </div>
  );
}
