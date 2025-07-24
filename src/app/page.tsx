"use client";

import { useState } from 'react';
import type { ChangeEvent } from 'react';
import { Dices } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { extractWeaponStats, type ExtractWeaponStatsOutput } from '@/ai/flows/extract-weapon-stats';
import StatsComparison from '@/components/stats-comparison';
import WeaponUploader from '@/components/weapon-uploader';
import CombatRangeComparison from '@/components/combat-range-comparison';

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

export default function Home() {
  const [weapon1DataUri, setWeapon1DataUri] = useState<string | null>(null);
  const [weapon2DataUri, setWeapon2DataUri] = useState<string | null>(null);
  const [weapon1Preview, setWeapon1Preview] = useState<string | null>(null);
  const [weapon2Preview, setWeapon2Preview] = useState<string | null>(null);
  const [weapon1Name, setWeapon1Name] = useState('');
  const [weapon2Name, setWeapon2Name] = useState('');

  const [stats, setStats] = useState<ExtractWeaponStatsOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>, weaponNumber: 1 | 2) => {
    const file = e.target.files?.[0];
    if (file) {
      if (weaponNumber === 1) {
        URL.revokeObjectURL(weapon1Preview || '');
        setWeapon1Preview(URL.createObjectURL(file));
      } else {
        URL.revokeObjectURL(weapon2Preview || '');
        setWeapon2Preview(URL.createObjectURL(file));
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUri = reader.result as string;
        if (weaponNumber === 1) {
          setWeapon1DataUri(dataUri);
        } else {
          setWeapon2DataUri(dataUri);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCompare = async () => {
    if (!weapon1DataUri || !weapon2DataUri) {
      toast({
        title: 'Missing Screenshots',
        description: 'Please upload screenshots for both weapons.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    setStats(null);

    try {
      const result = await extractWeaponStats({
        weapon1PhotoDataUri: weapon1DataUri,
        weapon2PhotoDataUri: weapon2DataUri,
      });
      setStats(result);
      setWeapon1Name(result.weapon1Stats.name);
      setWeapon2Name(result.weapon2Stats.name);
    } catch (e) {
      console.error(e);
      toast({
        title: 'Extraction Failed',
        description: 'Could not read stats from the images. Please try different, clearer screenshots.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="container mx-auto flex min-h-screen flex-col items-center justify-center p-4 md:p-8">
      <div className="w-full max-w-6xl space-y-8">
        <header className="text-center">
          <h1 className="font-headline text-5xl font-bold tracking-tighter sm:text-6xl md:text-7xl">
            Weapon Comparator
          </h1>
          <p className="mt-2 text-lg text-muted-foreground">
            Upload screenshots of two weapons to compare their stats.
          </p>
        </header>

        <div className="grid w-full grid-cols-1 gap-8 md:grid-cols-2">
          <WeaponUploader
            weaponNumber={1}
            previewUrl={weapon1Preview}
            onFileChange={(e) => handleFileChange(e, 1)}
            weaponName={weapon1Name}
            onNameChange={(e) => setWeapon1Name(e.target.value)}
          />
          <WeaponUploader
            weaponNumber={2}
            previewUrl={weapon2Preview}
            onFileChange={(e) => handleFileChange(e, 2)}
            weaponName={weapon2Name}
            onNameChange={(e) => setWeapon2Name(e.target.value)}
          />
        </div>

        <div className="flex w-full justify-center">
          <Button
            size="lg"
            onClick={handleCompare}
            disabled={!weapon1DataUri || !weapon2DataUri || isLoading}
            className="font-headline text-lg"
          >
            <Dices className="mr-2 h-5 w-5" />
            {isLoading ? 'Analyzing...' : 'Compare Stats'}
          </Button>
        </div>

        <div className="w-full">
          {isLoading && <StatsComparisonSkeleton />}
          {stats && !isLoading && (
            <div className="space-y-8">
              <StatsComparison data={stats} />
              <CombatRangeComparison data={stats} />
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
