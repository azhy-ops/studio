
"use client";

import Image from 'next/image';
import type { ChangeEvent } from 'react';
import { UploadCloud, Pencil } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Skeleton } from './ui/skeleton';
import { Label } from './ui/label';
import type { WeaponStats } from '@/lib/ocr';
import { Loader2 } from 'lucide-react';

interface WeaponUploaderProps {
  weaponNumber: 1 | 2;
  previewUrl: string | null;
  onFileChange: (event: ChangeEvent<HTMLInputElement>) => void;
  weaponName: string;
  onNameChange: (event: ChangeEvent<HTMLInputElement>) => void;
  isSingleUploader?: boolean;
  stats: WeaponStats | null;
  onStatChange: (statName: keyof WeaponStats, value: string) => void;
  isLoading?: boolean;
}

const statDisplayOrder: (keyof Omit<WeaponStats, 'name' | 'ttk' | 'handling'>)[] = [
  'damage',
  'fireRate',
  'range',
  'accuracy',
  'control',
  'stability',
  'mobility',
  'muzzleVelocity',
];

const StatInput = ({ label, value, onChange }: { label: string; value: number; onChange: (e: ChangeEvent<HTMLInputElement>) => void }) => (
    <div className='grid grid-cols-2 items-center gap-2'>
        <Label htmlFor={label.toLowerCase()} className='text-right text-muted-foreground capitalize text-xs'>{label.replace(/([A-Z])/g, ' $1')}</Label>
        <Input
            id={label.toLowerCase()}
            type="number"
            value={value}
            onChange={onChange}
            className='h-8 text-sm'
        />
    </div>
)

const WeaponUploader = ({ 
  weaponNumber, 
  previewUrl, 
  onFileChange, 
  weaponName, 
  onNameChange, 
  isSingleUploader = false,
  stats,
  onStatChange,
  isLoading = false
}: WeaponUploaderProps) => {
  const inputId = `file-upload-${weaponNumber}`;

  return (
    <Card className="flex flex-col items-center justify-center transition-all hover:border-accent">
      <CardContent className="p-4 w-full space-y-2">
        <label
          htmlFor={inputId}
          className="relative flex flex-col items-center justify-center w-full aspect-[16/9] border-2 border-dashed rounded-lg cursor-pointer bg-muted/50 hover:bg-muted transition-colors"
        >
          {previewUrl ? (
            <Image
              src={previewUrl}
              alt={`Weapon ${weaponNumber} preview`}
              fill
              className="object-contain rounded-lg"
            />
          ) : (
            <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center p-4">
              <UploadCloud className="w-10 h-10 mb-3 text-muted-foreground" />
              <p className="mb-2 text-sm text-muted-foreground font-semibold">
                {isSingleUploader ? 'Upload Weapon Screenshot' : `Upload Weapon ${weaponNumber} Screenshot`}
              </p>
              <p className="text-xs text-muted-foreground">Click or drag & drop</p>
            </div>
          )}
          <input
            id={inputId}
            type="file"
            className="hidden"
            onChange={onFileChange}
            accept="image/png, image/jpeg, image/webp"
            disabled={isLoading}
          />
           {isLoading && (
            <div className="absolute inset-0 bg-background/80 flex items-center justify-center rounded-lg">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          )}
        </label>
        <div className="relative">
          <Input
            type="text"
            placeholder={isSingleUploader ? 'Weapon Name (Editable)' : `Weapon ${weaponNumber} Name (Editable)`}
            value={weaponName}
            onChange={onNameChange}
            className="pr-8"
            disabled={!stats}
          />
          <Pencil className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        </div>
        
        {stats && !isLoading && (
           <div className="grid grid-cols-2 gap-x-4 gap-y-2 pt-2">
                {statDisplayOrder.map(statKey => (
                     <StatInput
                        key={statKey}
                        label={statKey}
                        value={stats[statKey]}
                        onChange={(e) => onStatChange(statKey, e.target.value)}
                    />
                ))}
           </div>
        )}

        {isLoading && (
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
  );
};

export default WeaponUploader;
