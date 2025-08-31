
import type { Metadata } from 'next';
import TtkCalculator from '@/components/ttk-calculator';

export const metadata: Metadata = {
    title: 'TTK Calculator | weapon compare',
    description: 'Calculate Time-to-Kill (TTK) for any weapon by manually entering its stats. A powerful tool for theorycrafting and loadout optimization.',
};

export default function TtkCalculatorPage() {
    return (
        <main className="container mx-auto flex min-h-screen flex-col items-center justify-center p-4 md:p-8">
             <div className="w-full max-w-2xl space-y-8">
                 <header className="text-center">
                    <h1 className="font-headline text-5xl font-bold tracking-tighter sm:text-6xl md:text-7xl">
                        TTK Calculator
                    </h1>
                    <p className="mt-2 text-lg text-muted-foreground max-w-3xl mx-auto">
                        Manually enter weapon stats to quickly calculate its Time-to-Kill.
                    </p>
                </header>
                <div className="pt-6">
                    <TtkCalculator />
                </div>
             </div>
        </main>
    );
}
