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

import { useState } from 'react';
import { step1Schema } from '@/schema';
import { useFormStepper } from '@/hooks/form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { authenticateUser } from '@/api/users';
import { useTranslation } from 'react-i18next';
import { Loader2 } from 'lucide-react';

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
      park: 'Fiesta Texas',
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

      if (result) {
        console.log('result', result);
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

  return (
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
                  className='flex flex-row justify-between'
                  onValueChange={field.onChange}
                  defaultValue={field.value ?? ''}
                >
                  <FormItem className='flex flex-col items-center gap-2'>
                    <AspectRatio ratio={16 / 9}>
                      <img
                        className='object-cover'
                        src='/img/fiesta-texas.webp'
                        alt='Fiesta Texas'
                      />
                    </AspectRatio>
                    <FormLabel>Fiesta Texas</FormLabel>
                    <FormControl>
                      <RadioGroupItem value='Fiesta Texas' />
                    </FormControl>
                  </FormItem>
                  <FormItem className='flex flex-col items-center gap-2'>
                    <AspectRatio ratio={16 / 9}>
                      <img
                        className='object-cover'
                        src='/img/six-flags.webp'
                        alt='Six Flags Over Texas'
                      />
                    </AspectRatio>
                    <FormLabel>Six Flags Over Texas</FormLabel>
                    <FormControl>
                      <RadioGroupItem value='Six Flags Over Texas' />
                    </FormControl>
                  </FormItem>
                  <FormItem className='flex flex-col items-center gap-2'>
                    <AspectRatio ratio={16 / 9}>
                      <img
                        className='object-cover'
                        src='/img/carowinds.webp'
                        alt='Carowinds'
                      />
                    </AspectRatio>
                    <FormLabel>Carowinds</FormLabel>
                    <FormControl>
                      <RadioGroupItem value='Carowinds' />
                    </FormControl>
                  </FormItem>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className='flex justify-end gap-2'>
          <Button className='cursor-pointer' type='submit' disabled={isLoading}>
            {isLoading ? <Loader2 className='animate-spin' /> : t('next')}
          </Button>
        </div>
      </form>
    </Form>
  );
}
