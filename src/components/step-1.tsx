import { AspectRatio } from './ui/aspect-ratio';
import { Button } from './ui/button';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from './ui/form';
import { Input } from './ui/input';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';

import { useMemo, useState } from 'react';
import { step1Schema } from '@/schema';
import { useFormStepper } from '@/hooks/form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { authenticateUser } from '@/api/users';
import { useTranslation } from 'react-i18next';
import { Loader2 } from 'lucide-react';
import { Submission } from '@/types';

type Step1Values = z.infer<typeof step1Schema>;

export function Step1() {
  const { incrementCurrentStep, setUser, setPark } = useFormStepper();
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState('');
  const { t } = useTranslation();

  const form = useForm<Step1Values>({
    resolver: zodResolver(step1Schema),
    defaultValues: {
      lastName: '',
      ein: '',
      park: undefined,
    },
  });

  const onSubmit = async () => {
    setIsLoading(true);
    try {
      const values = form.getValues();
      const result = await authenticateUser(values.ein, values.lastName);

      if (result.error && result.message === 'Error authenticating user') {
        form.setError('ein', {
          type: 'manual',
          message: t('invalidCredentials'),
        });
        form.setError('lastName', {
          type: 'manual',
          message: t('invalidCredentials'),
        });
        return;
      }

      if (result.message === 'User not found') {
        setAuthError(t('userNotFound'));
        form.setError('ein', {
          type: 'manual',
          message: t('invalidCredentials'),
        });
        form.setError('lastName', {
          type: 'manual',
          message: t('invalidCredentials'),
        });
        return;
      }

      if (
        result.submissions.filter(
          (submission: Submission) => submission.deletedAt === null
        ).length > 0
      ) {
        setAuthError(t('userAlreadySubmitted'));
        return;
      }

      if (result) {
        setUser({
          ...result,
        });
        setPark(values.park);
        incrementCurrentStep();
      }
    } catch (error) {
      setAuthError(t('authenticationFailed'));
      form.setError('ein', {
        type: 'manual',
        message: t('invalidCredentials'),
      });
      form.setError('lastName', {
        type: 'manual',
        message: t('invalidCredentials'),
      });
      console.error('Authentication failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const currentPark = form.watch('park');

  const deadline = useMemo(() => {
    if (currentPark === 'Fiesta Texas') {
      return t('fiestaTexasDeadline');
    }
    if (currentPark === 'Six Flags Over Texas') {
      return t('sixFlagsDeadline');
    }
    if (currentPark === 'Carowinds') {
      return t('carowindsDeadline');
    }
  }, [currentPark, t]);

  return (
    <>
      <div className='flex flex-col gap-4'>
        <p className='text-muted-foreground text-center'>{deadline}</p>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-8'>
          {authError && (
            <p className='text-xl font-medium text-destructive'>{authError}</p>
          )}
          <FormField
            control={form.control}
            name='ein'
            render={({ field }) => (
              <FormItem>
                <FormLabel required>EIN</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder='EIN'
                    onChangeCapture={() => setAuthError('')}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='lastName'
            render={({ field }) => (
              <FormItem>
                <FormLabel required>{t('lastName')}</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder={t('lastName')}
                    onChangeCapture={() => setAuthError('')}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='park'
            render={({ field }) => (
              <FormItem>
                <FormLabel required>{t('park')}</FormLabel>
                <FormControl>
                  <RadioGroup
                    className='flex flex-row justify-between text-center'
                    onValueChange={field.onChange}
                    defaultValue={field.value ?? ''}
                  >
                    <FormItem className='w-24 sm:w-auto'>
                      <label
                        htmlFor='carowinds-radio'
                        className='flex flex-col justify-between items-center gap-2 cursor-pointer'
                      >
                        <div className='flex flex-col items-center gap-2'>
                          <AspectRatio
                            className='flex items-center justify-center'
                            ratio={16 / 9}
                          >
                            <img
                              className='object-cover'
                              src='/img/carowinds.webp'
                              alt='Carowinds'
                            />
                          </AspectRatio>
                          <FormLabel>Carowinds</FormLabel>
                          <p className='text-xs sm:text-sm text-muted-foreground'>
                            Charlotte, NC
                          </p>
                          <p className='text-xs sm:text-sm text-muted-foreground'>
                            {t('carowindsDate')}
                          </p>
                        </div>
                        <FormControl>
                          <RadioGroupItem
                            id='carowinds-radio'
                            value='Carowinds'
                          />
                        </FormControl>
                      </label>
                    </FormItem>
                    <FormItem className='w-24 sm:w-auto'>
                      <label
                        htmlFor='fiesta-radio'
                        className='flex flex-col justify-between items-center gap-2 cursor-pointer'
                      >
                        <div className='flex flex-col items-center gap-2'>
                          <AspectRatio ratio={16 / 9}>
                            <img
                              className='object-cover'
                              src='/img/fiesta-texas.webp'
                              alt='Fiesta Texas'
                            />
                          </AspectRatio>
                          <FormLabel>Fiesta Texas</FormLabel>
                          <p className='text-xs sm:text-sm text-muted-foreground'>
                            San Antonio, TX
                          </p>
                          <p className='text-xs sm:text-sm text-muted-foreground'>
                            {t('fiestaTexasDate')}
                          </p>
                        </div>
                        <FormControl>
                          <RadioGroupItem
                            id='fiesta-radio'
                            value='Fiesta Texas'
                          />
                        </FormControl>
                      </label>
                    </FormItem>
                    <FormItem className='w-24 sm:w-auto'>
                      <label
                        htmlFor='sixflags-radio'
                        className='flex flex-col justify-between items-center gap-2 cursor-pointer'
                      >
                        <div className='flex flex-col items-center gap-2'>
                          <AspectRatio ratio={16 / 9}>
                            <img
                              src='/img/six-flags.webp'
                              alt='Six Flags Over Texas'
                              className='object-cover'
                            />
                          </AspectRatio>
                          <FormLabel>Six Flags Over Texas</FormLabel>
                          <p className='text-xs sm:text-sm text-muted-foreground'>
                            Arlington, TX
                          </p>
                          <p className='text-xs sm:text-sm text-muted-foreground'>
                            {t('sixFlagsDate')}
                          </p>
                        </div>
                        <FormControl>
                          <RadioGroupItem
                            id='sixflags-radio'
                            value='Six Flags Over Texas'
                          />
                        </FormControl>
                      </label>
                    </FormItem>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className='flex justify-end gap-2'>
            <Button
              className='cursor-pointer'
              type='submit'
              disabled={isLoading}
            >
              {isLoading ? <Loader2 className='animate-spin' /> : t('next')}
            </Button>
          </div>
        </form>
      </Form>
    </>
  );
}
