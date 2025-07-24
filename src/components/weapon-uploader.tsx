"use client";

import Image from 'next/image';
import type { ChangeEvent } from 'react';
import { UploadCloud } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface WeaponUploaderProps {
  weaponNumber: 1 | 2;
  previewUrl: string | null;
  onFileChange: (event: ChangeEvent<HTMLInputElement>) => void;
}

const WeaponUploader = ({ weaponNumber, previewUrl, onFileChange }: WeaponUploaderProps) => {
  const inputId = `file-upload-${weaponNumber}`;

  return (
    <Card className="flex flex-col items-center justify-center transition-all hover:border-accent">
      <CardContent className="p-4 w-full">
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
      </CardContent>
    </Card>
  );
};

export default WeaponUploader;
