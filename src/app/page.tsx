"use client";

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import WeaponComparator from '@/components/weapon-comparator';
import WeaponAnalyzer from '@/components/weapon-analyzer';

export default function Home() {
  return (
    <main className="container mx-auto flex min-h-screen flex-col items-center justify-center p-4 md:p-8">
      <div className="w-full max-w-6xl space-y-8">
        <header className="text-center">
          <h1 className="font-headline text-5xl font-bold tracking-tighter sm:text-6xl md:text-7xl">
            Weapon Analyzer
          </h1>
          <p className="mt-2 text-lg text-muted-foreground">
            Analyze and compare weapon stats from your favorite games.
          </p>
        </header>

        <Tabs defaultValue="comparator" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="comparator" className="font-headline text-base">Weapon Comparator</TabsTrigger>
            <TabsTrigger value="analyzer" className="font-headline text-base">Analyze My Weapon</TabsTrigger>
          </TabsList>
          <TabsContent value="comparator" className="pt-6">
            <WeaponComparator />
          </TabsContent>
          <TabsContent value="analyzer" className="pt-6">
            <WeaponAnalyzer />
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}
