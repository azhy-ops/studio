
"use client";

import { useState, ChangeEvent } from 'react';
import { Dices } from 'lucide-react';

import { Button } from '@/components/ui/button';
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
    
    if (weaponNumber === 1) {
      setWeapon1Stats(null);
      setWeapon1Preview(croppedDataUrl);
    } else {
      setWeapon2Stats(null);
      setWeapon2Preview(croppedDataUrl);
    }

    try {
        const { name, ...extractedStats } = await extractStatsFromImage(croppedDataUrl);
        const extractedName = name || 'Unknown Weapon';
        
        if (weaponNumber === 1) {
            setWeapon1Stats({ name: extractedName, ...extractedStats });
        } else {
            setWeapon2Stats({ name: extractedName, ...extractedStats });
        }
    } catch (err) {
        console.error(err);
        toast({ title: 'OCR Failed', description: `Could not read stats from the image for Weapon ${weaponNumber}. Please enter the stats manually.`, variant: 'destructive' });
        if(weaponNumber === 1) setWeapon1Preview(null);
        else setWeapon2Preview(null);
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
    if(!weapon1Stats.name || weapon1Stats.name === "Unknown Weapon" || !weapon2Stats.name || weapon2Stats.name === "Unknown Weapon") {
        toast({
            title: 'Missing Weapon Name',
            description: 'Please enter a name for both weapons.',
            variant: 'destructive',
        });
        return;
    }
    setStats({ weapon1Stats, weapon2Stats });
  };
  
  const handleStatChange = (weaponNumber: 1 | 2, statName: keyof WeaponStats, value: string) => {
    const numericValue = parseInt(value, 10);
    if (isNaN(numericValue) && value !== '') return;

    const statsToUpdate = weaponNumber === 1 ? weapon1Stats : weapon2Stats;
    const setStatsToUpdate = weaponNumber === 1 ? setWeapon1Stats : setWeapon2Stats;

    if (statsToUpdate) {
        const updatedStats = {...statsToUpdate, [statName]: isNaN(numericValue) ? 0 : numericValue};
        if (statName === 'damage' || statName === 'fireRate') {
            updatedStats.ttk = extractStatsFromImage.calculateTTK(updatedStats.damage, updatedStats.fireRate);
        }
        setStatsToUpdate(updatedStats);
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
       <ImageCropperDialog
            src={imageToCrop.src}
            onClose={() => setImageToCrop({ src: null, weapon: 1 })}
            onCropComplete={handleCropComplete}
            isProcessing={!!isProcessing}
        />
      <div className="grid w-full grid-cols-1 gap-8 md:grid-cols-2">
        <WeaponUploader
          weaponNumber={1}
          previewUrl={weapon1Preview}
          onFileChange={(e) => handleFileChange(e, 1)}
          weaponName={weapon1Stats?.name || ''}
          onNameChange={(e) => handleNameChange(1, e.target.value)}
          stats={weapon1Stats}
          onStatChange={(stat, value) => handleStatChange(1, stat, value)}
          isLoading={isProcessing === 1}
        />
        <WeaponUploader
          weaponNumber={2}
          previewUrl={weapon2Preview}
          onFileChange={(e) => handleFileChange(e, 2)}
          weaponName={weapon2Stats?.name || ''}
          onNameChange={(e) => handleNameChange(2, e.target.value)}
          stats={weapon2Stats}
          onStatChange={(stat, value) => handleStatChange(2, stat, value)}
          isLoading={isProcessing === 2}
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
          </div>
        )}
      </div>
    </div>
  );
}
