import { useTranslation } from 'react-i18next';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

export function LanguageToggle() {
  const { i18n } = useTranslation();

  const handleLanguageChange = (checked: boolean) => {
    i18n.changeLanguage(checked ? 'es' : 'en');
  };

  return (
    <>
      <div className='flex items-center gap-2'>
        <Switch
          checked={i18n.language === 'es'}
          onCheckedChange={handleLanguageChange}
        />
        <Label className='text-lg'>Español</Label>
      </div>
    </>
  );
}
