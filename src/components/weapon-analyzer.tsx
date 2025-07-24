'use client';

import { useState } from 'react';
import type { ChangeEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { analyzeWeapon } from '@/ai/flows/analyze-weapon';
import type { AnalyzeWeaponOutput } from '@/ai/schemas/weapon-stats';
import WeaponUploader from '@/components/weapon-uploader';
import { Badge } from './ui/badge';
import { SimpleStatBar } from './stat-bar';
import { Zap, ShieldCheck, ShieldAlert, ShieldPlus, List } from 'lucide-react';


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

function AnalysisResult({ data }: { data: AnalyzeWeaponOutput }) {
  
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
      <CardContent>
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
