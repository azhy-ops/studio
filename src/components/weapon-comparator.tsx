
"use client";

import { useState, ChangeEvent, useMemo, FocusEvent } from 'react';
import { Dices, AlertTriangle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { extractStatsFromImage, type WeaponStats } from '@/lib/ocr';
import StatsComparison from '@/components/stats-comparison';
import WeaponUploader from '@/components/weapon-uploader';
import CombatRangeComparison from '@/components/combat-range-comparison';
import { ImageCropperDialog } from './image-cropper-dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import Disclaimer from './disclaimer';

export interface ComparatorStats {
    weapon1Stats: WeaponStats;
    weapon2Stats: WeaponStats;
}

const initialWeaponStats = (name: string): WeaponStats => ({
  name,
  type: 'Assault Rifle',
  damage: 0,
  stability: 0,
  range: 0,
  accuracy: 0,
  control: 0,
  handling: 0,
  fireRate: 0,
  muzzleVelocity: 0,
  ttk: 0,
  fireRateInputType: 'stat'
});

export default function WeaponComparator() {
  const [imageToCrop, setImageToCrop] = useState<{ src: string | null; weapon: 1 | 2 }>({ src: null, weapon: 1 });

  const [weapon1Preview, setWeapon1Preview] = useState<string | null>(null);
  const [weapon2Preview, setWeapon2Preview] = useState<string | null>(null);
  
  const [weapon1Stats, setWeapon1Stats] = useState<WeaponStats | null>(null);
  const [weapon2Stats, setWeapon2Stats] = useState<WeaponStats | null>(null);
  
  const [stats, setStats] = useState<ComparatorStats | null>(null);
  const [isProcessing, setIsProcessing] = useState<false | 1 | 2>(false);
  const { toast } = useToast();

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>, weaponNumber: 1 | 2) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageToCrop({ src: reader.result as string, weapon: weaponNumber });
      };
      reader.readAsDataURL(file);
    }
    e.target.value = '';
  };

  const handleCropComplete = async (croppedDataUrl: string) => {
    const weaponNumber = imageToCrop.weapon;
    
    setStats(null);
    setIsProcessing(weaponNumber);
    setImageToCrop({ src: null, weapon: 1 });
    
    const setPreview = weaponNumber === 1 ? setWeapon1Preview : setWeapon2Preview;
    const setStatsHandler = weaponNumber === 1 ? setWeapon1Stats : setWeapon2Stats;

    setPreview(croppedDataUrl);

    try {
        const { name, ...extractedStats } = await extractStatsFromImage(croppedDataUrl);
        const defaultName = weaponNumber === 1 ? 'Weapon 1' : 'Weapon 2';
        const defaultType = 'Assault Rifle';

        const fireRateInputType = extractedStats.fireRate > 200 ? 'rpm' : 'stat';
        
        const fullStats: WeaponStats = { 
            name: name || defaultName, 
            type: defaultType, 
            ...extractedStats,
            fireRateInputType
        };
        
        const ttkResult = extractStatsFromImage.calculateTTK(fullStats.damage, fullStats.fireRate, fullStats.fireRateInputType, fullStats.type);

        setStatsHandler({ ...fullStats, ...ttkResult });

    } catch (err) {
        console.error(err);
        toast({ title: 'OCR Failed', description: `Could not read stats from the image for Weapon ${weaponNumber}. Please enter the stats manually.`, variant: 'destructive' });
        setPreview(null);
    } finally {
        setIsProcessing(false);
    }
  };

  const handleCompare = async () => {
    if (!weapon1Stats || !weapon2Stats) {
      toast({
        title: 'Missing Stats',
        description: 'Please upload screenshots and ensure stats are loaded for both weapons.',
        variant: 'destructive',
      });
      return;
    }
     if (!weapon1Stats.type || !weapon2Stats.type) {
      toast({
        title: 'Missing Weapon Type',
        description: 'Please select a weapon type for both weapons.',
        variant: 'destructive',
      });
      return;
    }

    const statsToCompare: ComparatorStats = {
      weapon1Stats: { ...weapon1Stats, name: weapon1Stats.name || 'Weapon 1' },
      weapon2Stats: { ...weapon2Stats, name: weapon2Stats.name || 'Weapon 2' }
    };

    setStats(statsToCompare);
  };
  
  const updateStats = (weaponNumber: 1 | 2, updatedValues: Partial<WeaponStats>) => {
    const setStatsHandler = weaponNumber === 1 ? setWeapon1Stats : setWeapon2Stats;
    
    setStatsHandler(prevStats => {
        const baseStats = prevStats || initialWeaponStats(weaponNumber === 1 ? 'Weapon 1' : 'Weapon 2');
        const newStats = { ...baseStats, ...updatedValues };

        const ttkResult = extractStatsFromImage.calculateTTK(
            newStats.damage,
            newStats.fireRate,
            newStats.fireRateInputType,
            newStats.type,
            newStats.maxRpmOverride
        );

        return { ...newStats, ...ttkResult };
    });
  };

  const handleStatChange = (weaponNumber: 1 | 2, statName: keyof WeaponStats, value: string) => {
    const numericValue = parseInt(value, 10);
    if (isNaN(numericValue) && value !== '') return;
    updateStats(weaponNumber, { [statName]: isNaN(numericValue) ? 0 : numericValue });
  };
  
  const handleFireRateInputChange = (weaponNumber: 1 | 2, value: string) => {
    const numericValue = parseInt(value, 10);
    const fireRateInputType = (weaponNumber === 1 ? weapon1Stats : weapon2Stats)?.fireRateInputType;

    if (isNaN(numericValue)) {
         updateStats(weaponNumber, { fireRate: 0 });
         return;
    };
    
    if(fireRateInputType === 'stat' && numericValue < 0) return;

    updateStats(weaponNumber, { fireRate: numericValue });
  };


  const handleNameChange = (weaponNumber: 1 | 2, e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    updateStats(weaponNumber, { name: value });
  };

  const handleNameBlur = (weaponNumber: 1 | 2, e: FocusEvent<HTMLInputElement>) => {
    if (e.target.value.trim() === '') {
        const defaultName = weaponNumber === 1 ? 'Weapon 1' : 'Weapon 2';
        updateStats(weaponNumber, { name: defaultName });
    }
  }

  const handleWeaponTypeChange = (weaponNumber: 1 | 2, value: string) => {
    updateStats(weaponNumber, { type: value });
  }

  const handleFireRateTypeChange = (weaponNumber: 1 | 2, value: 'rpm' | 'stat') => {
      updateStats(weaponNumber, { fireRateInputType: value });
  };

  const handleMaxRpmChange = (weaponNumber: 1 | 2, value: string) => {
    const numericValue = parseInt(value, 10);
    if (isNaN(numericValue) && value !== '') return;
    updateStats(weaponNumber, { maxRpmOverride: isNaN(numericValue) ? undefined : numericValue });
  };


  return (
    <div className="w-full max-w-6xl space-y-8">
       <ImageCropperDialog
            src={imageToCrop.src}
            onClose={() => setImageToCrop({ src: null, weapon: 1 })}
            onCropComplete={handleCropComplete}
            isProcessing={!!isProcessing}
        />
       <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Pro Tip for Accurate Results</AlertTitle>
          <AlertDescription>
            <ul className="list-disc list-inside space-y-1 mt-2 text-xs">
              <li>Use the crop box to highlight only the weapon’s stats — this helps the system read the numbers more accurately.</li>
              <li>Some games might use different stat names (like "Handling" or "Mobility"), or leave some out completely. Missing stats won’t affect the calculation.</li>
              <li>After cropping, please double-check the extracted numbers and fix any incorrect values before analysis.</li>
            </ul>
          </AlertDescription>
        </Alert>

      <div className="grid w-full grid-cols-1 gap-8 md:grid-cols-2">
        <WeaponUploader
          weaponNumber={1}
          previewUrl={weapon1Preview}
          onFileChange={(e) => handleFileChange(e, 1)}
          weaponName={weapon1Stats?.name}
          onNameChange={(e) => handleNameChange(1, e)}
          onNameBlur={(e) => handleNameBlur(1, e)}
          stats={weapon1Stats}
          onStatChange={(stat, value) => handleStatChange(1, stat, value)}
          isLoading={isProcessing === 1}
          weaponType={weapon1Stats?.type}
          onWeaponTypeChange={(value) => handleWeaponTypeChange(1, value)}
          onFireRateInputChange={(value) => handleFireRateInputChange(1, value)}
          onFireRateTypeChange={(value) => handleFireRateTypeChange(1, value)}
          onMaxRpmChange={(value) => handleMaxRpmChange(1, value)}
        />
        <WeaponUploader
          weaponNumber={2}
          previewUrl={weapon2Preview}
          onFileChange={(e) => handleFileChange(e, 2)}
          weaponName={weapon2Stats?.name}
          onNameChange={(e) => handleNameChange(2, e)}
          onNameBlur={(e) => handleNameBlur(2, e)}
          stats={weapon2Stats}
          onStatChange={(stat, value) => handleStatChange(2, stat, value)}
          isLoading={isProcessing === 2}
          weaponType={weapon2Stats?.type}
          onWeaponTypeChange={(value) => handleWeaponTypeChange(2, value)}
          onFireRateInputChange={(value) => handleFireRateInputChange(2, value)}
          onFireRateTypeChange={(value) => handleFireRateTypeChange(2, value)}
          onMaxRpmChange={(value) => handleMaxRpmChange(2, value)}
        />
      </div>

      <div className="flex w-full justify-center">
        <Button
          size="lg"
          onClick={handleCompare}
          disabled={!weapon1Stats || !weapon2Stats || !!isProcessing}
          className="font-headline text-lg"
        >
          <Dices className="mr-2 h-5 w-5" />
          {'Compare Stats'}
        </Button>
      </div>

      <div className="w-full">
        {stats && (
          <div className="space-y-8">
            <StatsComparison data={stats} />
            <CombatRangeComparison data={stats} />
            <Disclaimer />
          </div>
        )}
      </div>
    </div>
  );
}
