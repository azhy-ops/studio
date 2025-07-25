
'use client';

import { useState, useTransition } from 'react';
import type { ChangeEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { extractStatsFromImage, type WeaponStats } from '@/lib/ocr';
import WeaponUploader from '@/components/weapon-uploader';
import { Loader2 } from 'lucide-react';
import { SimpleStatBar } from './stat-bar';
import { ImageCropperDialog } from './image-cropper-dialog';


interface AnalysisOutput {
    stats: WeaponStats;
}

function AnalysisSkeleton() {
    return (
      <Card className="w-full">
        <CardHeader>
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-32" />
        </CardHeader>
        <CardContent className="space-y-4">
            <div className="flex justify-between items-end">
                <div>
                    <Skeleton className="h-4 w-24 mb-2" />
                    <Skeleton className="h-10 w-32" />
                </div>
                <div>
                    <Skeleton className="h-4 w-20 mb-2" />
                    <Skeleton className="h-10 w-28" />
                </div>
            </div>
            <div className='space-y-3 pt-4'>
                {Array.from({ length: 9 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-4">
                        <Skeleton className="h-4 w-28" />
                        <Skeleton className="h-3 w-full" />
                        <Skeleton className="h-4 w-12" />
                    </div>
                ))}
            </div>
        </CardContent>
      </Card>
    );
}


function AnalysisResult({ data }: { data: AnalysisOutput }) {
  const { stats } = data;

  const statDisplayOrder: (keyof Omit<WeaponStats, 'name' | 'ttk'>)[] = [
    'damage',
    'fireRate',
    'range',
    'accuracy',
    'control',
    'handling',
    'stability',
    'mobility',
    'muzzleVelocity',
  ];

  const applicableStats = statDisplayOrder.filter(statKey => stats[statKey] !== undefined && stats[statKey] > 0);
  const notApplicableStats = statDisplayOrder.filter(statKey => stats[statKey] === 0 || stats[statKey] === undefined);

  return (
    <Card className="w-full bg-card/50 backdrop-blur-sm animate-in fade-in-0 duration-500">
      <CardHeader>
        <div className="flex justify-between items-start">
            <div>
                <CardTitle className="font-headline text-3xl sm:text-4xl">{stats.name}</CardTitle>
                <CardDescription>
                    Weapon Stat Analysis
                </CardDescription>
            </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex justify-between items-end bg-muted/50 p-4 rounded-lg">
            <div>
                <p className='text-sm text-muted-foreground text-left'>Time to Kill</p>
                <p className='font-code text-4xl text-foreground'>
                    {stats.ttk > 0 ? `${stats.ttk}ms` : 'N/A'}
                </p>
            </div>
        </div>

        <div>
            <h3 className="font-headline text-xl mb-3 flex items-center gap-2">
                Base Stats
            </h3>
             {notApplicableStats.length > 0 && (
                <p className="text-xs text-muted-foreground mb-3">
                    Note: The following stats were not detected: {notApplicableStats.map(s => s.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())).join(', ')}.
                </p>
            )}
            <div className='space-y-3'>
                {applicableStats.map((statKey, index) => {
                    const value = stats[statKey];
                    if(value === undefined) return null;
                    return (
                        <div key={statKey} className="animate-in fade-in-0 slide-in-from-bottom-2 duration-500" style={{ animationDelay: `${index * 50}ms`}}>
                            <SimpleStatBar
                                statName={statKey}
                                value={value}
                                label={statKey}
                            />
                        </div>
                    )
                })}
            </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function WeaponAnalyzer() {
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const [weaponPreview, setWeaponPreview] = useState<string | null>(null);
  const [weaponStats, setWeaponStats] = useState<WeaponStats | null>(null);

  const [analysisResult, setAnalysisResult] = useState<AnalysisOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const dataUrl = reader.result as string;
        setAnalysisResult(null);
        setWeaponStats(null);
        setWeaponPreview(null);
        setCropSrc(dataUrl);
      };
      reader.readAsDataURL(file);
    }
    e.target.value = '';
  };
  
  const handleCropComplete = async (croppedDataUrl: string) => {
    setCropSrc(null);
    setIsProcessing(true);
    setWeaponPreview(croppedDataUrl);
    
    try {
        const { name, ...stats } = await extractStatsFromImage(croppedDataUrl);
        const extractedName = name || 'Unknown Weapon';
        setWeaponStats({ name: extractedName, ...stats });
    } catch (err) {
        console.error(err);
        toast({ title: 'OCR Failed', description: 'Could not read stats from the image. Please enter stats manually.', variant: 'destructive' });
        setWeaponPreview(null);
    } finally {
        setIsProcessing(false);
    }
  };

  const performAnalysis = (stats: WeaponStats) => {
    if (!stats) return;

    setIsLoading(true);
    setAnalysisResult(null);

    startTransition(() => {
        setAnalysisResult({
            stats: stats,
        });
        setIsLoading(false);
    });
  }

  const handleAnalyze = async () => {
    if (!weaponStats) {
      toast({ title: 'Missing Stats', description: 'Please upload a screenshot or enter stats manually.', variant: 'destructive' });
      return;
    }
    if(!weaponStats.name || weaponStats.name === "Unknown Weapon") {
        toast({ title: 'Missing Weapon Name', description: 'Please enter a name for the weapon.', variant: 'destructive' });
        return;
    }
    performAnalysis(weaponStats);
  };
  
  const handleStatChange = (statName: keyof WeaponStats, value: string) => {
    if (!weaponStats) return;
    const numericValue = parseInt(value, 10);
    if (isNaN(numericValue) && value !== '') return;

    const updatedStats = {...weaponStats, [statName]: isNaN(numericValue) ? 0 : numericValue};
    
    if (statName === 'damage' || statName === 'fireRate') {
      updatedStats.ttk = extractStatsFromImage.calculateTTK(updatedStats.damage, updatedStats.fireRate);
    }
    setWeaponStats(updatedStats);

    if (analysisResult) {
        performAnalysis(updatedStats);
    }
  };
  
  const handleNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (weaponStats) {
      setWeaponStats({ ...weaponStats, name: e.target.value });
    }
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8">
        {cropSrc && (
            <ImageCropperDialog
              src={cropSrc}
              onCropComplete={handleCropComplete}
              onClose={() => setCropSrc(null)}
              isProcessing={isProcessing}
            />
        )}
        <div className="grid w-full grid-cols-1 gap-8">
            <WeaponUploader
                weaponNumber={1}
                previewUrl={weaponPreview}
                onFileChange={handleFileChange}
                weaponName={weaponStats?.name || ''}
                onNameChange={handleNameChange}
                isSingleUploader={true}
                stats={weaponStats}
                onStatChange={handleStatChange}
                isLoading={isProcessing}
            />
        </div>

        <div className="flex w-full justify-center">
            <Button
                size="lg"
                onClick={handleAnalyze}
                disabled={!weaponStats || isLoading || isPending || isProcessing}
                className="font-headline text-lg"
            >
                {(isLoading || isPending) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {(isLoading || isPending) ? 'Analyzing...' : 'Analyze Weapon'}
            </Button>
        </div>
        
        <div className="w-full">
            {(isLoading || isPending) && analysisResult === null && <AnalysisSkeleton />}
            {analysisResult && !(isLoading || isPending) && <AnalysisResult data={analysisResult} />}
        </div>
    </div>
  );
}
