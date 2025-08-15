
"use client";

import Image from 'next/image';
import type { ChangeEvent, ReactNode, FocusEvent } from 'react';
import { useRef, useState } from 'react';
import { UploadCloud, Pencil, X, AlertTriangle, AlertCircle, Info } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Skeleton } from './ui/skeleton';
import { Label } from './ui/label';
import type { WeaponStats } from '@/lib/ocr';
import { defaultMaxRpm } from '@/lib/ocr';
import { Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { cn } from '@/lib/utils';


interface WeaponUploaderProps {
  weaponNumber: 1 | 2;
  previewUrl: string | null;
  onFileChange: (event: ChangeEvent<HTMLInputElement>) => void;
  weaponName?: string;
  onNameChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onNameBlur?: (event: FocusEvent<HTMLInputElement>) => void;
  isSingleUploader?: boolean;
  stats: WeaponStats | null;
  onStatChange: (statName: keyof WeaponStats, value: string) => void;
  onFireRateInputChange: (value: string) => void;
  onFireRateTypeChange: (value: 'rpm' | 'stat') => void;
  onMaxRpmChange: (value: string) => void;
  isLoading?: boolean;
  children?: ReactNode;
  weaponType?: string;
  onWeaponTypeChange: (value: string) => void;
}

const statDisplayOrder: (keyof Omit<WeaponStats, 'name' | 'ttk' | 'type' | 'fireRateInputType' | 'maxRpmOverride' | 'shotsToKill' | 'timeBetweenShots' | 'rpmUsed'>)[] = [
  'damage',
  // 'fireRate', // Handled by TTKCalculator
  'range',
  'accuracy',
  'control',
  'handling',
  'stability',
  'muzzleVelocity',
];

const weaponTypes = ["SMG", "Assault Rifle", "LMG", "Marksman Rifle", "Sniper", "Pistol"];

const StatInput = ({ label, value, onChange, isMissing }: { label: string; value: number; onChange: (e: ChangeEvent<HTMLInputElement>) => void, isMissing: boolean }) => {
    const displayLabel = label === 'handling' ? 'Handling & Mobility' : label.replace(/([A-Z])/g, ' $1');
    const isSuspicious = value > 0 && value < 10;
    return (
    <div className='grid grid-cols-2 items-center gap-2'>
        <Label htmlFor={label.toLowerCase()} className='text-right text-muted-foreground capitalize text-xs flex items-center justify-end gap-1'>
            {isMissing && (
                 <TooltipProvider>
                    <Tooltip delayDuration={0}>
                        <TooltipTrigger>
                            <AlertTriangle className="h-3 w-3 text-amber-500" />
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>This stat was not detected. If it's not available in your game, you can ignore this warning.</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            )}
            {isSuspicious && (
                 <TooltipProvider>
                    <Tooltip delayDuration={0}>
                        <TooltipTrigger>
                            <AlertCircle className="h-3 w-3 text-destructive" />
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>This value might be incomplete. Please double-check and correct it manually.</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            )}
            {displayLabel}
        </Label>
        <Input
            id={label.toLowerCase()}
            type="number"
            value={value || ''}
            onChange={onChange}
            className='h-8 text-sm'
            placeholder="0"
        />
    </div>
)};

const TTKCalculator = ({ 
    stats, 
    onFireRateInputChange,
    onFireRateTypeChange,
    onMaxRpmChange,
}: { 
    stats: WeaponStats, 
    onFireRateInputChange: (value: string) => void,
    onFireRateTypeChange: (value: 'rpm' | 'stat') => void,
    onMaxRpmChange: (value: string) => void
}) => {
    const defaultRpm = defaultMaxRpm[stats.type || 'Assault Rifle'];

    return (
        <div className='p-3 bg-muted/50 rounded-lg space-y-3 mt-2 text-sm'>
            <div className='flex justify-between items-center'>
                <Label className='font-bold flex items-center gap-1.5'>
                    Time to Kill (TTK)
                    <TooltipProvider>
                        <Tooltip delayDuration={0}>
                            <TooltipTrigger>
                                <Info className="h-3 w-3 text-muted-foreground/70 cursor-help" />
                            </TooltipTrigger>
                            <TooltipContent className='max-w-xs'>
                                <p>TTK is how fast a weapon can neutralize a 100 HP target. The formula is (Shots to Kill - 1) * Time Between Shots.</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </Label>
                <div className='font-code text-lg font-bold'>{stats.ttk || 0}ms</div>
            </div>
            
            <div className='grid grid-cols-2 gap-2 text-xs'>
                <div className='flex justify-between border-t border-muted-foreground/20 pt-2'>
                    <span className='text-muted-foreground'>Shots to Kill:</span>
                    <span className='font-semibold'>{stats.shotsToKill || 0}</span>
                </div>
                <div className='flex justify-between border-t border-muted-foreground/20 pt-2'>
                    <span className='text-muted-foreground'>RPM Used:</span>
                     <span className='font-semibold'>{stats.rpmUsed || 0}</span>
                </div>
            </div>
             {stats.fireRateInputType === 'stat' && (
                <div className='text-center text-xs text-amber-500 flex items-center justify-center gap-1'>
                   <AlertTriangle className='h-3 w-3' /> TTK is estimated from stat bar value.
                </div>
             )}


            <div className='space-y-2 pt-2'>
                <Label className='text-xs text-muted-foreground'>Fire Rate Input Type</Label>
                <RadioGroup value={stats.fireRateInputType} onValueChange={onFireRateTypeChange} className="flex gap-2">
                    <Label htmlFor={`fr-type-stat-${stats.name}`} className={cn("flex-1 text-center text-xs p-2 rounded-md border cursor-pointer", stats.fireRateInputType === 'stat' && 'bg-primary/20 border-primary')}>
                         <RadioGroupItem value="stat" id={`fr-type-stat-${stats.name}`} className='sr-only'/>
                         Stat Bar (0-100)
                    </Label>
                    <Label htmlFor={`fr-type-rpm-${stats.name}`} className={cn("flex-1 text-center text-xs p-2 rounded-md border cursor-pointer", stats.fireRateInputType === 'rpm' && 'bg-primary/20 border-primary')}>
                        <RadioGroupItem value="rpm" id={`fr-type-rpm-${stats.name}`} className='sr-only'/>
                        RPM (Actual)
                    </Label>
                </RadioGroup>
            </div>
            
            <div className='grid grid-cols-2 gap-2'>
                <StatInput 
                    label={stats.fireRateInputType === 'rpm' ? 'RPM' : 'Fire Rate'}
                    value={stats.fireRate}
                    onChange={(e) => onFireRateInputChange(e.target.value)}
                    isMissing={stats.fireRate === 0}
                />
                {stats.fireRateInputType === 'stat' && (
                     <StatInput 
                        label='Max RPM'
                        value={stats.maxRpmOverride || defaultRpm}
                        onChange={(e) => onMaxRpmChange(e.target.value)}
                        isMissing={false}
                    />
                )}
            </div>
        </div>
    )
}

const WeaponUploader = ({ 
  weaponNumber, 
  previewUrl, 
  onFileChange, 
  weaponName, 
  onNameChange,
  onNameBlur, 
  isSingleUploader = false,
  stats,
  onStatChange,
  onFireRateInputChange,
  onFireRateTypeChange,
  onMaxRpmChange,
  isLoading = false,
  children,
  weaponType,
  onWeaponTypeChange,
}: WeaponUploaderProps) => {
  const inputId = `file-upload-${weaponNumber}`;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const handleFocus = (event: FocusEvent<HTMLInputElement>) => {
    event.target.select();
  };

  const handleImageContainerClick = () => {
    if (previewUrl && !isLoading) {
      setIsPreviewOpen(true);
    } else if (!isLoading) {
      fileInputRef.current?.click();
    }
  };

  const handleReplaceImageClick = () => {
    setIsPreviewOpen(false);
    fileInputRef.current?.click();
  };
  
  const defaultName = isSingleUploader ? 'Weapon Name' : `Weapon ${weaponNumber}`;

  return (
    <div className="space-y-3">
      <Card className="flex flex-col items-center justify-center transition-all hover:border-accent">
        <CardContent className="p-4 w-full space-y-2">
           <div className="flex flex-col items-center justify-center w-full">
            {children}
          </div>
          <div
            onClick={handleImageContainerClick}
            className="relative flex flex-col items-center justify-center w-full aspect-[16/9] border-2 border-dashed rounded-lg cursor-pointer bg-muted/50 hover:bg-muted transition-colors"
          >
            {previewUrl && !isLoading ? (
              <Image
                src={previewUrl}
                alt={`Weapon ${weaponNumber} preview`}
                fill
                className="object-contain rounded-lg"
              />
            ) : (
              <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center p-4">
                 {isLoading ? (
                     <Loader2 className="h-8 w-8 animate-spin text-primary" />
                 ): (
                    <>
                        <UploadCloud className="w-10 h-10 mb-3 text-muted-foreground" />
                        <p className="mb-2 text-sm text-muted-foreground font-semibold">
                        {isSingleUploader ? 'Upload Weapon Screenshot' : `Upload Weapon ${weaponNumber} Screenshot`}
                        </p>
                        <p className="text-xs text-muted-foreground">Click or drag & drop</p>
                    </>
                 )}
              </div>
            )}
            <input
              ref={fileInputRef}
              id={inputId}
              type="file"
              className="hidden"
              onChange={onFileChange}
              accept="image/png, image/jpeg, image/webp"
              disabled={isLoading}
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="relative">
                <Input
                type="text"
                placeholder={defaultName}
                value={weaponName ?? ''}
                onChange={onNameChange}
                onFocus={handleFocus}
                onBlur={onNameBlur}
                className="pr-8"
                disabled={!stats}
                />
                <Pencil className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            </div>
            <Select onValueChange={onWeaponTypeChange} value={weaponType} disabled={!stats}>
              <SelectTrigger>
                <SelectValue placeholder="Select Type" />
              </SelectTrigger>
              <SelectContent>
                {weaponTypes.map(type => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {stats && !isLoading && (
            <>
             <div className="grid grid-cols-2 gap-x-4 gap-y-2 pt-2">
                  {statDisplayOrder.map(statKey => {
                    const value = stats[statKey]
                    if (value === undefined) return null;
                    return (
                       <StatInput
                          key={statKey}
                          label={statKey}
                          value={value}
                          onChange={(e) => onStatChange(statKey, e.target.value)}
                          isMissing={value === 0}
                      />
                    )
                  })}
             </div>
             <TTKCalculator 
                stats={stats} 
                onFireRateInputChange={onFireRateInputChange}
                onFireRateTypeChange={onFireRateTypeChange}
                onMaxRpmChange={onMaxRpmChange}
             />
            </>
          )}

          {isLoading && !stats && (
              <div className="grid grid-cols-2 gap-x-4 gap-y-2 pt-2">
                  {Array.from({ length: 8 }).map((_, i) => (
                      <div key={i} className="grid grid-cols-2 items-center gap-2">
                           <Skeleton className="h-4 w-16 justify-self-end" />
                           <Skeleton className="h-8 w-full" />
                      </div>
                  ))}
              </div>
          )}

        </CardContent>
      </Card>
      
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{weaponName || defaultName}</DialogTitle>
          </DialogHeader>
          <div className="relative aspect-video">
            {previewUrl && (
              <Image src={previewUrl} alt={`Preview of ${weaponName}`} layout="fill" objectFit="contain" />
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPreviewOpen(false)}>Close</Button>
            <Button onClick={handleReplaceImageClick}>Replace Image</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default WeaponUploader;
