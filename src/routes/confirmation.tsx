import { createFileRoute, Link } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { useFormStepper } from '@/hooks/form';

export const Route = createFileRoute('/confirmation')({
  component: RouteComponent,
});

function RouteComponent() {
  const { t } = useTranslation();

  const { childrenVerification } = useFormStepper();

  return (
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
      <h2 className='text-2xl font-black text-destructive'>
        TODO: Add Hotel Information
      </h2>
      <h3 className='text-lg text-muted-foreground'>
        {t('orderConfirmationDescription')}
      </h3>
    </div>
  );
}
