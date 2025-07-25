
'use client';

import { useState } from 'react';
import type { ChangeEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { extractStatsFromImage, type WeaponStats } from '@/lib/ocr';
import WeaponUploader from '@/components/weapon-uploader';
import { Badge } from './ui/badge';
import { List, ShieldCheck, ShieldPlus, ShieldAlert } from 'lucide-react';
import { ImageCropperDialog } from './image-cropper-dialog';


interface AnalysisOutput {
    stats: WeaponStats;
    recommendedRanges: string[];
    summaryPoints: { point: string; type: 'strength' | 'secondary-strength' | 'weakness'}[];
}

const statDescriptions: Record<string, string> = {
    damage: 'damage per shot',
    range: 'effective distance',
    control: 'recoil manageability',
    handling: 'ADS & swap speed',
    stability: 'aim steadiness during continuous fire',
    accuracy: 'shot grouping precision',
    mobility: 'movement speed while equipped',
    fireRate: 'bullets fired per minute',
    muzzleVelocity: 'bullet travel speed',
};

const getSummaryPoints = (stats: WeaponStats): { point: string; type: 'strength' | 'secondary-strength' | 'weakness' }[] => {
    const points: { point: string; type: 'strength' | 'secondary-strength' | 'weakness' }[] = [];
    const statKeys = Object.keys(statDescriptions) as (keyof typeof statDescriptions)[];

    // Create a copy of stats for normalization
    const normalizedStats = { ...stats };
    normalizedStats.fireRate = Math.min(stats.fireRate / 12, 100);
    normalizedStats.muzzleVelocity = Math.min(stats.muzzleVelocity / 12, 100);


    for (const key of statKeys) {
        if (!Object.prototype.hasOwnProperty.call(stats, key)) continue;
        const value = normalizedStats[key as keyof WeaponStats];
        if (typeof value !== 'number') continue;

        if (value >= 75) {
            points.push({ point: `High ${statDescriptions[key]} – great for its class.`, type: 'strength' });
        } else if (value >= 50) {
            points.push({ point: `Moderate ${statDescriptions[key]} – usable in most scenarios.`, type: 'secondary-strength' });
        } else {
            points.push({ point: `Low ${statDescriptions[key]} – may struggle where this is critical.`, type: 'weakness' });
        }
    }
    return points.slice(0, 7);
};

const calculateScores = (stats: WeaponStats) => {
    const s = { ...stats }; // Create a mutable copy
    s.fireRate = Math.min(s.fireRate / 12, 100); // Normalize fire rate
    s.muzzleVelocity = Math.min(s.muzzleVelocity / 12, 100); // Normalize muzzle velocity

    const shortRangeScore = 
        s.damage * 0.20 + s.fireRate * 0.20 + s.handling * 0.15 + s.control * 0.15 + 
        s.mobility * 0.10 + s.stability * 0.10 + s.accuracy * 0.05 + s.range * 0.03 + 
        s.muzzleVelocity * 0.02;

    const midRangeScore = 
        s.accuracy * 0.20 + s.damage * 0.18 + s.control * 0.15 + s.stability * 0.15 + 
        s.range * 0.12 + s.handling * 0.10 + s.fireRate * 0.05 + s.mobility * 0.03 + 
        s.muzzleVelocity * 0.02;

    const longRangeScore = 
        s.accuracy * 0.25 + s.stability * 0.20 + s.control * 0.15 + s.damage * 0.15 + 
        s.range * 0.10 + s.muzzleVelocity * 0.08 + s.handling * 0.03 + s.mobility * 0.02;

    return { shortRangeScore, midRangeScore, longRangeScore };
};

const getRecommendedRanges = (scores: { shortRangeScore: number; midRangeScore: number; longRangeScore: number }): string[] => {
    const ranges: string[] = [];
    if (scores.shortRangeScore >= 65) ranges.push("Short Range");
    if (scores.midRangeScore >= 65) ranges.push("Mid Range");
    if (scores.longRangeScore >= 65) ranges.push("Long Range");

    if (ranges.length > 0) return ranges;

    const highestScore = Math.max(scores.shortRangeScore, scores.midRangeScore, scores.longRangeScore);
    if (highestScore === scores.shortRangeScore) return ["Most suited for Short Range"];
    if (highestScore === scores.midRangeScore) return ["Most suited for Mid Range"];
    return ["Most suited for Long Range"];
};

const runRuleBasedAnalysis = (stats: WeaponStats): AnalysisOutput => {
    const scores = calculateScores(stats);
    const recommendedRanges = getRecommendedRanges(scores);
    const summaryPoints = getSummaryPoints(stats);

    return {
        stats,
        recommendedRanges,
        summaryPoints,
    };
};

function AnalysisSkeleton() {
    return (
      <Card className="w-full">
        <CardHeader>
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-32" />
          <div className="flex gap-2 pt-2">
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-6 w-24" />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-6 w-1/3" />
          <div className="space-y-3 pt-2">
            {Array.from({ length: 5 }).map((_, i) => (
               <div key={i} className="flex items-center gap-3">
                 <Skeleton className="h-5 w-5 rounded-full" />
                 <Skeleton className="h-4 w-full" />
               </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
}

const pointTypeIcons: Record<string, React.ReactNode> = {
    strength: <ShieldCheck className="h-5 w-5 text-green-400" />,
    'secondary-strength': <ShieldPlus className="h-5 w-5 text-blue-400" />,
    weakness: <ShieldAlert className="h-5 w-5 text-red-400" />,
};

function AnalysisResult({ data }: { data: AnalysisOutput }) {
  
  return (
    <Card className="w-full bg-card/50 backdrop-blur-sm animate-in fade-in-0 duration-500">
      <CardHeader>
        <CardTitle className="font-headline text-3xl sm:text-4xl">{data.stats.name}</CardTitle>
        <CardDescription>
          A tactical breakdown of the {data.stats.name}'s performance characteristics.
        </CardDescription>
        <div className="flex flex-wrap items-center gap-2 pt-2">
            <span className='text-sm font-medium text-muted-foreground'>Best for:</span>
            {data.recommendedRanges.map(range => (
                <Badge key={range} variant="outline" className="text-base">{range}</Badge>
            ))}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h3 className="font-headline text-xl mb-3 flex items-center gap-2">
            <List className="h-5 w-5" />
            Key Points
          </h3>
          <ul className="space-y-2.5">
              {data.summaryPoints.map((summary, index) => (
                  <li key={index} className="flex items-start gap-3 animate-in fade-in-0 slide-in-from-bottom-2 duration-500" style={{ animationDelay: `${index * 100}ms`}}>
                      <span className="shrink-0">{pointTypeIcons[summary.type]}</span>
                      <span>{summary.point}</span>
                  </li>
              ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}

export default function WeaponAnalyzer() {
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);
  const [weaponPreview, setWeaponPreview] = useState<string | null>(null);
  const [weaponStats, setWeaponStats] = useState<WeaponStats | null>(null);

  const [analysisResult, setAnalysisResult] = useState<AnalysisOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessingCrop, setIsProcessingCrop] = useState(false);
  const { toast } = useToast();

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageToCrop(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
    e.target.value = '';
  };
  
  const handleCropComplete = async (croppedDataUrl: string) => {
      setIsProcessingCrop(true);
      setAnalysisResult(null);
      setWeaponStats(null);
      
      if (weaponPreview && weaponPreview.startsWith('blob:')) {
        URL.revokeObjectURL(weaponPreview);
      }
      setWeaponPreview(croppedDataUrl);
      setImageToCrop(null);

      try {
          const extractedStats = await extractStatsFromImage(croppedDataUrl);
          setWeaponStats(extractedStats);
      } catch(err) {
          console.error(err);
          toast({ title: 'OCR Failed', description: 'Could not read stats from the image. Please try cropping again or enter stats manually.', variant: 'destructive' });
          setWeaponPreview(null);
      } finally {
          setIsProcessingCrop(false);
      }
  }


  const handleStatChange = (statName: keyof WeaponStats, value: string) => {
    const numericValue = parseInt(value, 10);
    if (isNaN(numericValue) || !weaponStats) return;

    const updatedStats = {...weaponStats, [statName]: numericValue};
    if (statName === 'damage' || statName === 'fireRate') {
      updatedStats.ttk = extractStatsFromImage.calculateTTK(updatedStats.damage, updatedStats.fireRate);
    }
    setWeaponStats(updatedStats);
  };
  
  const handleNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (weaponStats) {
      setWeaponStats({ ...weaponStats, name: e.target.value });
    }
  }

  const handleAnalyze = async () => {
    if (!weaponStats) {
      toast({
        title: 'Missing Stats',
        description: 'Please upload a screenshot or enter stats manually.',
        variant: 'destructive',
      });
      return;
    }
    if(!weaponStats.name || weaponStats.name === "Unknown Weapon") {
        toast({
            title: 'Missing Weapon Name',
            description: 'Please enter a name for the weapon.',
            variant: 'destructive',
        });
        return;
    }

    setIsLoading(true);
    setAnalysisResult(null);

    try {
      // Use a small delay to allow the UI to update to the loading state
      await new Promise(resolve => setTimeout(resolve, 50));
      const result = runRuleBasedAnalysis(weaponStats);
      setAnalysisResult(result);
    } catch (e) {
      console.error(e);
      toast({
        title: 'Analysis Failed',
        description: 'An unexpected error occurred during analysis.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleCropperClose = () => {
    setImageToCrop(null);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8">
        {imageToCrop && (
            <ImageCropperDialog
                src={imageToCrop}
                onCropComplete={handleCropComplete}
                onClose={handleCropperClose}
                isProcessing={isProcessingCrop}
            />
        )}
        <div className="grid w-full grid-cols-1">
            <WeaponUploader
                weaponNumber={1}
                previewUrl={weaponPreview}
                onFileChange={handleFileChange}
                weaponName={weaponStats?.name || ''}
                onNameChange={handleNameChange}
                isSingleUploader={true}
                stats={weaponStats}
                onStatChange={handleStatChange}
                isLoading={isProcessingCrop}
            />
        </div>

        <div className="flex w-full justify-center">
            <Button
                size="lg"
                onClick={handleAnalyze}
                disabled={!weaponStats || isLoading || isProcessingCrop}
                className="font-headline text-lg"
            >
                {isLoading ? 'Analyzing...' : 'Analyze Weapon'}
            </Button>
        </div>
        
        <div className="w-full">
            {isLoading && analysisResult === null && <AnalysisSkeleton />}
            {analysisResult && !isLoading && <AnalysisResult data={analysisResult} />}
        </div>
    </div>
  );
}
