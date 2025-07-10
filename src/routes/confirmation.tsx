import { createFileRoute, Link } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { useFormStepper } from '@/hooks/form';
import { ArrowLeftIcon, ExternalLink } from 'lucide-react';
import { useEffect } from 'react';

export const Route = createFileRoute('/confirmation')({
  component: RouteComponent,
});

function RouteComponent() {
  const { t } = useTranslation();

  const { childrenVerification, setCurrentStep } = useFormStepper();

  useEffect(() => {
    setCurrentStep(0);
  }, []);

  return (
    // Header with logo and back button
    <>
      <div className='flex items-center justify-between w-full p-3 sm:px-4 sm:py-6'>
        <Link to='/' className='flex items-center gap-2'>
          <ArrowLeftIcon className='w-4 h-4' />
          {t('backToHome')}
        </Link>
      </div>
      <div className='flex flex-col items-center space-y-2 justify-center h-screen'>
        <Link to='/'>
          <img src='/img/zachry-logo.webp' alt='Zachry Logo' />
        </Link>
        <h1 className='text-2xl font-bold text-center'>
          {t('thankYouForCompletingTheZachryPicnicForm')}
        </h1>

        <p className='text-sm'>{t('correctionsOrRevisions')}</p>
        {childrenVerification && (
          <p className='text-sm text-destructive'>
            {t('dependentChildrenVerification')}
          </p>
        )}
        <div className='flex flex-col items-center space-y-2 mt-4'>
          <h2 className='text-2xl'>Hotel Information</h2>
          <div className='flex items-center gap-2 text-blue-600 visited:text-purple-800'>
            <a
              href='/embassy-airport.pdf'
              target='_blank'
              rel='noopener noreferrer'
              className='underline cursor-pointer'
            >
              Embassy Suites by Hilton San Antonio Airport
            </a>
            <ExternalLink className='w-4 h-4' />
          </div>

          <div className='flex items-center gap-2 text-blue-600 visited:text-purple-800'>
            <a
              href='/embassy-landmark.pdf'
              target='_blank'
              rel='noopener noreferrer'
              className='underline cursor-pointer'
            >
              Embassy Suites by Hilton San Antonio Landmark
            </a>
            <ExternalLink className='w-4 h-4' />
          </div>
        </div>
        <h3 className='text-lg text-muted-foreground mt-4'>
          {t('orderConfirmationDescription')}
        </h3>
      </div>
      <div className='flex items-center justify-between w-full p-3 sm:px-4 sm:py-6'>
        <Link to='/' className='flex items-center gap-2'>
          <ArrowLeftIcon className='w-4 h-4' />
          {t('backToHome')}
        </Link>
      </div>
    </>
  );
}
