
"use client";

import { useState, ChangeEvent, useMemo, FocusEvent, useContext } from 'react';
import { Dices, AlertTriangle, Save, Heart, BookMarked } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { extractStatsFromImage, type WeaponStats, type CalibrationStats, calculateFinalStats, calculateFinalScore, getLoadouts } from '@/lib/ocr';
import StatsComparison from '@/components/stats-comparison';
import WeaponUploader from '@/components/weapon-uploader';
import CombatRangeComparison from '@/components/combat-range-comparison';
import { ImageCropperDialog } from './image-cropper-dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import Disclaimer from './disclaimer';
import { AuthContext, useAuth } from '@/context/auth-context';
import { saveLoadout, type Loadout } from '@/lib/firebase';
import { v4 as uuidv4 } from 'uuid';
import { Input } from './ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription, DialogTrigger } from './ui/dialog';
import { Loader2 } from 'lucide-react';
import Image from 'next/image';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';

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

const initialCalibrationStats = (): CalibrationStats => ({
    firingStability: 0,
    extraControl: 0,
    stabilityWhenMoving: 0,
    adsMovementSpeed: 0,
    ads: 0,
    hipFireAimSpeed: 0,
});

function SavedLoadoutsDialog({ onSelectLoadout }: { onSelectLoadout: (loadout: Loadout) => void }) {
    const { user } = useAuth();
    const [loadouts, setLoadouts] = useState<Loadout[]>([]);
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();

    const handleOpen = async () => {
        if (!user) {
            toast({ title: "Please log in", description: "You need to be logged in to see saved loadouts.", variant: 'destructive' });
            return;
        }
        setLoading(true);
        try {
            const userLoadouts = await getLoadouts(user.uid);
            setLoadouts(userLoadouts);
        } catch (error) {
            toast({ title: "Error", description: "Failed to fetch saved loadouts.", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };
    
    const handleSelect = (loadout: Loadout) => {
        onSelectLoadout(loadout);
        // Maybe close dialog here if it's a DialogClose trigger
    }

    return (
        <Dialog onOpenChange={(isOpen) => isOpen && handleOpen()}>
            <DialogTrigger asChild>
                <Button size="lg" variant="outline" className="font-headline text-lg">
                    <BookMarked className="mr-2 h-5 w-5" />
                    Compare with Saved
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl">
                <DialogHeader>
                    <DialogTitle>Select a Saved Loadout</DialogTitle>
                    <DialogDescription>Choose one of your saved loadouts to compare against.</DialogDescription>
                </DialogHeader>
                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <Loader2 className="h-8 w-8 animate-spin" />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[60vh] overflow-y-auto p-1">
                        {loadouts.length > 0 ? loadouts.map(loadout => (
                             <DialogClose key={loadout.id} asChild>
                                <Card
                                    onClick={() => handleSelect(loadout)}
                                    className="cursor-pointer hover:border-accent transition-colors"
                                >
                                    <CardHeader className="p-4">
                                        <CardTitle className="text-base font-headline">{loadout.name}</CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-4 pt-0">
                                        <div className="relative aspect-video w-full rounded-md overflow-hidden bg-muted">
                                            <Image src={loadout.imageDataUri} alt={loadout.name} layout="fill" objectFit="contain" />
                                        </div>
                                    </CardContent>
                                </Card>
                            </DialogClose>
                        )) : (
                            <p className="text-muted-foreground col-span-full text-center">No saved loadouts found.</p>
                        )}
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}

export default function WeaponComparator() {
  const [imageToCrop, setImageToCrop] = useState<{ src: string | null; weapon: 1 | 2 }>({ src: null, weapon: 1 });

  const [weapon1Preview, setWeapon1Preview] = useState<string | null>(null);
  const [weapon2Preview, setWeapon2Preview] = useState<string | null>(null);
  
  const [weapon1Stats, setWeapon1Stats] = useState<WeaponStats | null>(null);
  const [weapon2Stats, setWeapon2Stats] = useState<WeaponStats | null>(null);
  
  const [weapon1Calibration, setWeapon1Calibration] = useState<CalibrationStats>(initialCalibrationStats());
  const [weapon2Calibration, setWeapon2Calibration] = useState<CalibrationStats>(initialCalibrationStats());

  const [stats, setStats] = useState<ComparatorStats | null>(null);
  const [isProcessing, setIsProcessing] = useState<false | 1 | 2>(false);
  const { toast } = useToast();
  const { user, openAuthDialog } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [loadoutToSave, setLoadoutToSave] = useState<{ weaponNumber: 1 | 2, name: string } | null>(null);
  const [loadoutName, setLoadoutName] = useState("");

  const finalWeapon1Stats = useMemo(() => {
    if (!weapon1Stats) return null;
    const finalStats = calculateFinalStats(weapon1Stats, weapon1Calibration);
    const finalScore = calculateFinalScore(finalStats);
    return { ...finalStats, finalScore };
  }, [weapon1Stats, weapon1Calibration]);

  const finalWeapon2Stats = useMemo(() => {
    if (!weapon2Stats) return null;
    const finalStats = calculateFinalStats(weapon2Stats, weapon2Calibration);
    const finalScore = calculateFinalScore(finalStats);
    return { ...finalStats, finalScore };
  }, [weapon2Stats, weapon2Calibration]);


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
    if (!finalWeapon1Stats || !finalWeapon2Stats) {
      toast({
        title: 'Missing Stats',
        description: 'Please upload screenshots and ensure stats are loaded for both weapons.',
        variant: 'destructive',
      });
      return;
    }
     if (!finalWeapon1Stats.type || !finalWeapon2Stats.type) {
      toast({
        title: 'Missing Weapon Type',
        description: 'Please select a weapon type for both weapons.',
        variant: 'destructive',
      });
      return;
    }

    const statsToCompare: ComparatorStats = {
      weapon1Stats: { ...finalWeapon1Stats, name: finalWeapon1Stats.name || 'Weapon 1' },
      weapon2Stats: { ...finalWeapon2Stats, name: finalWeapon2Stats.name || 'Weapon 2' }
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
    
    if (isNaN(numericValue)) {
         updateStats(weaponNumber, { fireRate: 0 });
         return;
    };
    
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

  const handleCalibrationChange = (weaponNumber: 1 | 2, statName: keyof CalibrationStats, value: string) => {
    const numericValue = parseInt(value, 10);
    const setCalibrationHandler = weaponNumber === 1 ? setWeapon1Calibration : setWeapon2Calibration;
    setCalibrationHandler(prev => ({
      ...prev,
      [statName]: isNaN(numericValue) ? 0 : numericValue,
    }));
  };
  
  const handleInitiateSave = (weaponNumber: 1 | 2) => {
    if (!user) {
      openAuthDialog();
      return;
    }

    const statsToSave = weaponNumber === 1 ? finalWeapon1Stats : finalWeapon2Stats;
    if (!statsToSave) {
        toast({ title: "Error", description: "No stats to save.", variant: "destructive" });
        return;
    }
    
    setLoadoutToSave({ weaponNumber, name: statsToSave.name });
    setLoadoutName(statsToSave.name);
  };
  
  const handleConfirmSave = async () => {
    if (!user || !loadoutToSave) return;
    setIsSaving(true);

    const { weaponNumber } = loadoutToSave;
    const baseStats = weaponNumber === 1 ? weapon1Stats : weapon2Stats;
    const calibration = weaponNumber === 1 ? weapon1Calibration : weapon2Calibration;
    const previewUrl = weaponNumber === 1 ? weapon1Preview : weapon2Preview;
    
    if (!baseStats || !previewUrl) {
        toast({ title: "Error", description: "Cannot save incomplete loadout.", variant: "destructive" });
        setIsSaving(false);
        return;
    }

    const loadout: Loadout = {
        id: uuidv4(),
        userId: user.uid,
        name: loadoutName,
        baseStats,
        calibrationStats: calibration,
        imageDataUri: previewUrl,
        createdAt: new Date(),
    };

    try {
        await saveLoadout(user.uid, loadout);
        toast({ title: "Success", description: "Loadout saved successfully!" });
        setLoadoutToSave(null);
        setLoadoutName("");
    } catch (error) {
        console.error("Failed to save loadout: ", error);
        toast({ title: "Error", description: "Failed to save loadout. Please try again.", variant: "destructive" });
    } finally {
        setIsSaving(false);
    }
  };
  
  const handleSelectSavedLoadout = (loadout: Loadout) => {
    setWeapon2Stats(loadout.baseStats);
    setWeapon2Calibration(loadout.calibrationStats);
    setWeapon2Preview(loadout.imageDataUri);
    toast({ title: "Loadout Loaded", description: `"${loadout.name}" has been loaded into Weapon 2 slot.` });
  }

  return (
    <div className="w-full max-w-6xl space-y-8">
       <ImageCropperDialog
            src={imageToCrop.src}
            onClose={() => setImageToCrop({ src: null, weapon: 1 })}
            onCropComplete={handleCropComplete}
            isProcessing={!!isProcessing}
        />
        
        <Dialog open={!!loadoutToSave} onOpenChange={(isOpen) => !isOpen && setLoadoutToSave(null)}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Save Loadout</DialogTitle>
                    <DialogDescription>
                        Give your loadout a name to save it to your profile.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <Input
                        id="loadout-name"
                        value={loadoutName}
                        onChange={(e) => setLoadoutName(e.target.value)}
                        placeholder="e.g., Close-Range SMG Build"
                    />
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setLoadoutToSave(null)}>Cancel</Button>
                    <Button onClick={handleConfirmSave} disabled={isSaving || !loadoutName.trim()}>
                        {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save Loadout
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>


       <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Pro Tip for Accurate Results</AlertTitle>
          <AlertDescription>
            <ul className="list-disc list-inside space-y-1 mt-2 text-xs">
              <li>Use the crop box to highlight only the weapon’s stats — this helps the system read the numbers more accurately.</li>
              <li>Some games might use different stat names (like "Handling" or "Mobility"), or leave some out completely. <span className="underline decoration-yellow-500">Missing stats won’t affect the calculation.</span></li>
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
          calibrationStats={weapon1Calibration}
          onCalibrationChange={(stat, value) => handleCalibrationChange(1, stat, value)}
          finalStats={finalWeapon1Stats}
        >
          {user && weapon1Stats && (
            <Button variant="outline" size="sm" className="absolute top-2 right-2 z-10" onClick={() => handleInitiateSave(1)}>
              <Heart className="mr-2 h-4 w-4" /> Save
            </Button>
          )}
        </WeaponUploader>
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
          calibrationStats={weapon2Calibration}
          onCalibrationChange={(stat, value) => handleCalibrationChange(2, stat, value)}
          finalStats={finalWeapon2Stats}
        >
          {user && weapon2Stats && (
            <Button variant="outline" size="sm" className="absolute top-2 right-2 z-10" onClick={() => handleInitiateSave(2)}>
               <Heart className="mr-2 h-4 w-4" /> Save
            </Button>
          )}
        </WeaponUploader>
      </div>

      <div className="flex w-full justify-center gap-4">
        <Button
          size="lg"
          onClick={handleCompare}
          disabled={!weapon1Stats || !weapon2Stats || !!isProcessing}
          className="font-headline text-lg"
        >
          <Dices className="mr-2 h-5 w-5" />
          {'Compare Stats'}
        </Button>
         {user && weapon1Stats && (
            <SavedLoadoutsDialog onSelectLoadout={handleSelectSavedLoadout} />
         )}
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

    