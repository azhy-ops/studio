
"use client";

import Image from 'next/image';
import WeaponComparator from '@/components/weapon-comparator';

export default function Home() {
  return (
    <main className="container mx-auto flex min-h-screen flex-col items-center justify-center p-4 md:p-8">
      <div className="w-full max-w-6xl space-y-8">
        <header className="text-center">
           <div className="flex justify-center mb-4">
            <Image
                src="https://placehold.co/500x150.png"
                alt="weapon compare logo"
                width={500}
                height={150}
                data-ai-hint="assault rifles"
              />
          </div>
          <p className="mt-2 text-lg text-muted-foreground max-w-3xl mx-auto">
            Upload screenshots of your favorite FPS weapons to automatically extract and compare stats like damage, fire rate, accuracy, and more. Make data-driven decisions for your perfect loadout.
          </p>
        </header>
        <div className="pt-6">
          <WeaponComparator />
        </div>
      </div>
    </main>
  );
}
