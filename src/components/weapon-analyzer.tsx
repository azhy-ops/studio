'use client';

import { useState } from 'react';
import type { ChangeEvent } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { analyzeWeapon } from '@/ai/flows/analyze-weapon';
import type { AnalyzeWeaponOutput } from '@/ai/schemas/weapon-stats';
import WeaponUploader from '@/components/weapon-uploader';
import { Badge } from './ui/badge';
import { SimpleStatBar } from './stat-bar';
import { Shield, Target, Gauge, Zap } from 'lucide-react';


const statDisplayOrder: (keyof Omit<AnalyzeWeaponOutput['stats'], 'name' | 'handling' | 'mobility'>)[] = [
  'damage',
  'fireRate',
  'range',
  'accuracy',
  'control',
  'stability',
  'muzzleVelocity',
];

const statLabels: Record<typeof statDisplayOrder[number], string> = {
  damage: 'Damage',
  fireRate: 'Fire Rate',
  range: 'Range',
  accuracy: 'Accuracy',
  control: 'Control',
  stability: 'Stability',
  muzzleVelocity: 'Muzzle Velocity',
};

function AnalysisSkeleton() {
    return (
      <Card className="w-full">
        <CardHeader>
          <div className="flex items-center justify-between">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-8 w-24" />
          </div>
          <Skeleton className="h-4 w-32" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-6 w-full" />
          <div className="space-y-3 pt-4">
            {Array.from({ length: 7 }).map((_, i) => (
               <div key={i} className="grid grid-cols-[auto_1fr_auto] items-center gap-4">
                 <Skeleton className="h-5 w-5 rounded-full" />
                 <Skeleton className="h-3 w-full" />
                 <Skeleton className="h-6 w-8" />
               </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

function AnalysisResult({ data }: { data: AnalyzeWeaponOutput }) {
  const scoreColor = data.overallScore > 75 ? 'text-green-400' : data.overallScore > 50 ? 'text-yellow-400' : 'text-red-400';
  
  return (
    <Card className="w-full bg-card/50 backdrop-blur-sm animate-in fade-in-0 duration-500">
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
            <CardTitle className="font-headline text-3xl sm:text-4xl">{data.stats.name}</CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="outline">{data.recommendedRange}</Badge>
              <div className="flex items-baseline gap-1.5">
                <span className={`font-headline text-4xl font-bold ${scoreColor}`}>{data.overallScore}</span>
                <span className="text-muted-foreground">/ 100</span>
              </div>
            </div>
        </div>
        <CardDescription>{data.summary}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
            {statDisplayOrder.map((statName, index) => {
                const value = data.stats[statName];
                if (typeof value === 'undefined') return null;
                return (
                    <div key={statName} className="animate-in fade-in-0 slide-in-from-bottom-2 duration-500" style={{ animationDelay: `${index * 75}ms`}}>
                        <SimpleStatBar statName={statName} value={value} label={statLabels[statName]} />
                    </div>
                );
            })}
        </div>
      </CardContent>
    </Card>
  );
}


export default function WeaponAnalyzer() {
  const [weaponDataUri, setWeaponDataUri] = useState<string | null>(null);
  const [weaponPreview, setWeaponPreview] = useState<string | null>(null);
  const [weaponName, setWeaponName] = useState('');
  const [analysisResult, setAnalysisResult] = useState<AnalyzeWeaponOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      URL.revokeObjectURL(weaponPreview || '');
      setWeaponPreview(URL.createObjectURL(file));

      const reader = new FileReader();
      reader.onloadend = () => {
        setWeaponDataUri(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
    if (!weaponDataUri) {
      toast({
        title: 'Missing Screenshot',
        description: 'Please upload a screenshot for the weapon.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    setAnalysisResult(null);

    try {
      const result = await analyzeWeapon({ weaponPhotoDataUri: weaponDataUri });
      if (result.stats.name && result.stats.name !== 'Unknown Weapon') {
          setWeaponName(result.stats.name);
      }
      setAnalysisResult(result);
    } catch (e) {
      console.error(e);
      toast({
        title: 'Analysis Failed',
        description: 'Could not read stats from the image. Please try a different screenshot.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8">
        <div className="grid w-full grid-cols-1">
            <WeaponUploader
                weaponNumber={1}
                previewUrl={weaponPreview}
                onFileChange={handleFileChange}
                weaponName={weaponName}
                onNameChange={(e) => setWeaponName(e.target.value)}
                isSingleUploader={true}
            />
        </div>

        <div className="flex w-full justify-center">
            <Button
                size="lg"
                onClick={handleAnalyze}
                disabled={!weaponDataUri || isLoading}
                className="font-headline text-lg"
            >
                <Zap className="mr-2 h-5 w-5" />
                {isLoading ? 'Analyzing...' : 'Analyze Weapon'}
            </Button>
        </div>
        
        <div className="w-full">
            {isLoading && <AnalysisSkeleton />}
            {analysisResult && !isLoading && <AnalysisResult data={analysisResult} />}
        </div>
    </div>
  );
}
