
"use client";

import WeaponComparator from '@/components/weapon-comparator';

export default function Home() {
  return (
    <main className="container mx-auto flex min-h-screen flex-col items-center justify-center p-4 md:p-8">
      <div className="w-full max-w-6xl space-y-8">
        <header className="text-center">
          <h1 className="font-headline text-5xl font-bold tracking-tighter sm:text-6xl md:text-7xl">
            weapon compare
          </h1>
          <p className="mt-2 text-lg text-muted-foreground max-w-3xl mx-auto">
            Compare your weapon stats
          </p>
        </header>
        <div className="pt-6">
          <WeaponComparator />
        </div>
      </div>
    </main>
  );
}
