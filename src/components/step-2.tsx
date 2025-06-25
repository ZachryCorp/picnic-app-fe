import { Button } from './ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from './ui/form';
import { Input } from './ui/input';

import { Check, X, TriangleAlert } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useFormStepper } from '@/hooks/form';
import { useTranslation } from 'react-i18next';
import { step2Schema } from '@/schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Textarea } from './ui/textarea';

type Step2Values = z.infer<typeof step2Schema>;

export function Step2() {
  const { t } = useTranslation();

  const {
    incrementCurrentStep,
    setIncludePayrollDeduction,
    user,
    setUser,
    park,
    setChildrenVerification,
    setAdditionalChildrenReason,
  } = useFormStepper();

  const [showChildrenVerification, setShowChildrenVerification] =
    useState(true);
  const [showAdditionalChildInput, setShowAdditionalChildInput] =
    useState(false);
  const [showAdditionalChildrenTextArea, setShowAdditionalChildrenTextArea] =
    useState(false);

  const form = useForm<Step2Values>({
    resolver: zodResolver(step2Schema),
    defaultValues: {
      name: `${user?.firstName} ${user?.lastName}`,
      jobNumber: user?.jobNumber,
      location: user?.location,
      employeeTickets: 0,
      guestTickets: user?.guest ? 1 : 0,
      childrenTickets: user?.children,
      additionalChildrenReason: '',
    },
  });

  const handleSubmit = () => {
    setUser({
      ...user,
      guest: form.getValues('guestTickets') > 0,
      children: form.getValues('childrenTickets'),
    });
    setIncludePayrollDeduction(false);
    setAdditionalChildrenReason(form.getValues('additionalChildrenReason'));
    incrementCurrentStep();
  };

  const handlePurchaseTickets = () => {
    setUser({
      ...user,
      guest: form.getValues('guestTickets') > 0,
      children: form.getValues('childrenTickets'),
    });
    setIncludePayrollDeduction(true);
    setAdditionalChildrenReason(form.getValues('additionalChildrenReason'));
    incrementCurrentStep();
  };

  return (
    <div className='flex flex-col space-y-6'>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className='space-y-4'>
          <FormField
            control={form.control}
            name='name'
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('name')}</FormLabel>
                <FormControl>
                  <Input
                    readOnly
                    {...field}
                    placeholder={t('name')}
                    value={`${user?.firstName} ${user?.lastName}`}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='jobNumber'
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('jobNumber')}</FormLabel>
                <FormControl>
                  <Input
                    readOnly
                    {...field}
                    placeholder={t('jobNumber')}
                    value={user?.jobNumber ?? ''}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='location'
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('location')}</FormLabel>
                <FormControl>
                  <Input
                    readOnly
                    {...field}
                    placeholder={t('location')}
                    value={user?.location ?? ''}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className='flex flex-col gap-1 max-w-96'>
            <h2 className='text-xl font-semibold'>
              {t('ticketsProvidedByZachryCorp')}
            </h2>
            <p className='text-sm text-muted-foreground'>
              {t('zachryWillProvide')} {park} {t('ticketsForYouAndYour')}{' '}
              <span className='font-semibold'>{t('immediate')}</span>{' '}
              {t('familyAtNoCharge')}
            </p>
          </div>

          <div className='flex flex-col space-y-2'>
            <FormField
              control={form.control}
              name='employeeTickets'
              render={({ field }) => (
                <FormItem className='flex justify-between'>
                  <FormLabel>{t('employee')}</FormLabel>
                  <FormControl>
                    <Input
                      readOnly
                      className='w-16'
                      {...field}
                      value={1}
                      type='number'
                      min={0}
                      max={1}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='guestTickets'
              render={({ field }) => (
                <FormItem className='flex justify-between'>
                  <FormLabel required>
                    {t('spouseOrGuest')}
                    <span
                      className={`${
                        form.formState.errors.guestTickets
                          ? 'text-destructive'
                          : 'text-muted-foreground'
                      } text-xs`}
                    >
                      {t('max1')}
                    </span>
                  </FormLabel>
                  <div className='flex items-end flex-col gap-2'>
                    <FormControl>
                      <Input
                        className='w-16'
                        {...field}
                        type='number'
                        min={0}
                        max={1}
                        onChange={(e) => field.onChange(e.target.valueAsNumber)}
                      />
                    </FormControl>
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />
            <div
              className={
                showChildrenVerification
                  ? 'flex flex-col gap-2 p-4 rounded-md bg-warning'
                  : ''
              }
            >
              {showChildrenVerification && (
                <div className='flex items-center justify-between'>
                  <div className='flex items-start sm:items-end gap-2'>
                    <TriangleAlert className='w-5 h-5 text-warning-foreground' />
                    <p className='text-sm text-warning-foreground'>
                      {t('childrenVerification')}
                    </p>
                  </div>
                  <div className='flex'>
                    <Button
                      onClick={() => {
                        setShowChildrenVerification(false);
                      }}
                      variant='ghost'
                      size='sm'
                    >
                      <Check className='w-4 h-4 text-success' />
                    </Button>
                    <Button
                      onClick={() => {
                        setShowChildrenVerification(false);
                        setShowAdditionalChildInput(true);
                        setShowAdditionalChildrenTextArea(true);
                        setChildrenVerification(true);
                      }}
                      variant='ghost'
                      size='sm'
                    >
                      <X className='w-4 h-4 text-destructive' />
                    </Button>
                  </div>
                </div>
              )}
              <FormField
                control={form.control}
                name='childrenTickets'
                render={({ field }) => (
                  <FormItem className='flex justify-between'>
                    <div className='flex flex-col gap-2'>
                      <FormLabel>
                        {showAdditionalChildInput
                          ? t('correctNumberOfChildren')
                          : t('children')}
                      </FormLabel>
                      <p className='max-w-xs sm:max-w-sm text-xs text-muted-foreground'>
                        <span className='font-bold'>
                          {t('childrenDisclaimer')}
                        </span>
                      </p>
                    </div>
                    <div className='flex items-end flex-col gap-2'>
                      <FormControl>
                        <Input
                          readOnly={!showAdditionalChildInput}
                          className='w-16'
                          {...field}
                          type='number'
                          min={0}
                          max={10}
                          value={
                            showAdditionalChildInput
                              ? field.value
                              : user?.children
                          }
                          onChange={(e) =>
                            field.onChange(e.target.valueAsNumber)
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />
              {showAdditionalChildrenTextArea && (
                <FormField
                  control={form.control}
                  name='additionalChildrenReason'
                  render={({ field }) => (
                    <FormItem className='mt-4'>
                      <FormLabel>Additional Children Reason</FormLabel>
                      <Textarea
                        {...field}
                        placeholder='Reason for additional children'
                      />
                    </FormItem>
                  )}
                />
              )}
            </div>
          </div>
        </form>
      </Form>
      {!showChildrenVerification && (
        <div className='flex justify-between'>
          <p className='text-sm text-muted-foreground'>
            {t('additionalTicketsPrompt')}
          </p>
          <div className='flex gap-2'>
            <Button
              onClick={form.handleSubmit(handlePurchaseTickets)}
              variant='default'
              size='sm'
            >
              {t('yes')}
            </Button>
            <Button
              onClick={form.handleSubmit(handleSubmit)}
              variant='outline'
              size='sm'
            >
              {t('no')}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
