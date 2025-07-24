"use client";

import Image from 'next/image';
import type { ChangeEvent } from 'react';
import { UploadCloud, Pencil } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

interface WeaponUploaderProps {
  weaponNumber: 1 | 2;
  previewUrl: string | null;
  onFileChange: (event: ChangeEvent<HTMLInputElement>) => void;
  weaponName: string;
  onNameChange: (event: ChangeEvent<HTMLInputElement>) => void;
}

const WeaponUploader = ({ weaponNumber, previewUrl, onFileChange, weaponName, onNameChange }: WeaponUploaderProps) => {
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
                Upload Weapon {weaponNumber} Screenshot
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
          />
        </label>
        <div className="relative">
          <Input
            type="text"
            placeholder={`Weapon ${weaponNumber} Name`}
            value={weaponName}
            onChange={onNameChange}
            className="pr-8"
          />
          <Pencil className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        </div>
      </CardContent>
    </Card>
  );
};

export default WeaponUploader;
