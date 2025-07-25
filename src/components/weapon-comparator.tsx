
"use client";

import { useState } from 'react';
import type { ChangeEvent } from 'react';
import { Dices } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { extractStatsFromImage, type WeaponStats } from '@/lib/ocr';
import StatsComparison from '@/components/stats-comparison';
import WeaponUploader from '@/components/weapon-uploader';
import CombatRangeComparison from '@/components/combat-range-comparison';
import { ImageCropperDialog } from './image-cropper-dialog';

interface ComparatorStats {
    weapon1Stats: WeaponStats;
    weapon2Stats: WeaponStats;
}

function StatsComparisonSkeleton() {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-center font-headline text-2xl">Comparison</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="grid grid-cols-[1fr_auto_1fr] items-center gap-4">
            <div className="flex items-center justify-end gap-2">
              <Skeleton className="h-6 w-8" />
              <Skeleton className="h-2.5 w-full" />
            </div>
            <div className="flex flex-col items-center gap-1">
              <Skeleton className="h-6 w-6 rounded-full" />
              <Skeleton className="h-3 w-16" />
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="h-2.5 w-full" />
              <Skeleton className="h-6 w-8" />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export default function WeaponComparator() {
  const [imageToCrop, setImageToCrop] = useState<{ src: string, weapon: 1 | 2 } | null>(null);
  
  const [weapon1Preview, setWeapon1Preview] = useState<string | null>(null);
  const [weapon2Preview, setWeapon2Preview] = useState<string | null>(null);
  
  const [weapon1Stats, setWeapon1Stats] = useState<WeaponStats | null>(null);
  const [weapon2Stats, setWeapon2Stats] = useState<WeaponStats | null>(null);
  
  const [stats, setStats] = useState<ComparatorStats | null>(null);
  const [isLoading, setIsLoading] = useState<boolean | number>(false);
  const { toast } = useToast();

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>, weaponNumber: 1 | 2) => {
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

  const handleCropComplete = async (croppedDataUrl: string, weaponNumber: 1 | 2) => {
    setIsLoading(weaponNumber);
    setImageToCrop(null);

    try {
        const extractedStats = await extractStatsFromImage(croppedDataUrl);
        if (weaponNumber === 1) {
            URL.revokeObjectURL(weapon1Preview || '');
            setWeapon1Preview(croppedDataUrl);
            setWeapon1Stats(extractedStats);
        } else {
            URL.revokeObjectURL(weapon2Preview || '');
            setWeapon2Preview(croppedDataUrl);
            setWeapon2Stats(extractedStats);
        }
    } catch (err) {
        console.error(err);
        toast({ title: 'OCR Failed', description: `Could not read stats from the image for Weapon ${weaponNumber}. Please try cropping again.`, variant: 'destructive' });
        if(weaponNumber === 1) setWeapon1Preview(null);
        else setWeapon2Preview(null);
    } finally {
        setIsLoading(false);
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
    setStats({ weapon1Stats, weapon2Stats });
  };
  
  const handleStatChange = (weaponNumber: 1 | 2, statName: keyof WeaponStats, value: string) => {
    const numericValue = parseInt(value, 10);
    if (isNaN(numericValue)) return;

    if (weaponNumber === 1 && weapon1Stats) {
        const updatedStats = {...weapon1Stats, [statName]: numericValue};
        if (statName === 'damage' || statName === 'fireRate') {
            updatedStats.ttk = extractStatsFromImage.calculateTTK(updatedStats.damage, updatedStats.fireRate);
        }
        setWeapon1Stats(updatedStats);
    } else if (weaponNumber === 2 && weapon2Stats) {
        const updatedStats = {...weapon2Stats, [statName]: numericValue};
         if (statName === 'damage' || statName === 'fireRate') {
            updatedStats.ttk = extractStatsFromImage.calculateTTK(updatedStats.damage, updatedStats.fireRate);
        }
        setWeapon2Stats(updatedStats);
    }
  };

  const handleNameChange = (weaponNumber: 1 | 2, value: string) => {
    if (weaponNumber === 1 && weapon1Stats) {
      setWeapon1Stats({ ...weapon1Stats, name: value });
    } else if (weaponNumber === 2 && weapon2Stats) {
      setWeapon2Stats({ ...weapon2Stats, name: value });
    }
  }

  return (
    <div className="w-full max-w-6xl space-y-8">
       {imageToCrop && (
        <ImageCropperDialog
            src={imageToCrop.src}
            onCropComplete={(url) => handleCropComplete(url, imageToCrop.weapon)}
            onClose={() => setImageToCrop(null)}
        />
      )}
      <div className="grid w-full grid-cols-1 gap-8 md:grid-cols-2">
        <WeaponUploader
          weaponNumber={1}
          previewUrl={weapon1Preview}
          onFileChange={(e) => handleFileChange(e, 1)}
          weaponName={weapon1Stats?.name || ''}
          onNameChange={(e) => handleNameChange(1, e.target.value)}
          stats={weapon1Stats}
          onStatChange={(stat, value) => handleStatChange(1, stat, value)}
          isLoading={isLoading === 1}
        />
        <WeaponUploader
          weaponNumber={2}
          previewUrl={weapon2Preview}
          onFileChange={(e) => handleFileChange(e, 2)}
          weaponName={weapon2Stats?.name || ''}
          onNameChange={(e) => handleNameChange(2, e.target.value)}
          stats={weapon2Stats}
          onStatChange={(stat, value) => handleStatChange(2, stat, value)}
          isLoading={isLoading === 2}
        />
      </div>

      <div className="flex w-full justify-center">
        <Button
          size="lg"
          onClick={handleCompare}
          disabled={!weapon1Stats || !weapon2Stats}
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
          </div>
        )}
      </div>
    </div>
  );
}
