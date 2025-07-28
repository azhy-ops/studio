
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Terms of Service | weapon compare',
    description: 'Please read our Terms of Service carefully before using weapon compare. This agreement governs your use of our website and services.',
};

export default function TermsOfServicePage() {
    return (
        <main className="container mx-auto flex min-h-screen flex-col items-center p-4 pt-12 md:p-8">
            <div className="w-full max-w-4xl space-y-8">
                <header className="text-center">
                    <h1 className="font-headline text-5xl font-bold tracking-tighter sm:text-6xl md:text-7xl">
                        Terms of Service
                    </h1>
                </header>
                <div className="prose prose-invert mx-auto max-w-prose text-lg text-muted-foreground space-y-4">
                    <p>
                        By accessing this website, you are agreeing to be bound by these website Terms and Conditions of Use, all applicable laws and regulations, and agree that you are responsible for compliance with any applicable local laws.
                    </p>
                    <h2 className="text-2xl font-headline text-foreground">Use License</h2>
                    <p>
                        Permission is granted to temporarily download one copy of the materials on weapon compare's website for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title.
                    </p>
                    <h2 className="text-2xl font-headline text-foreground">Disclaimer</h2>
                    <p>
                        The materials on weapon compare's website are provided "as is". weapon compare makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties, including without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
                    </p>
                    <h2 className="text-2xl font-headline text-foreground">Limitations</h2>
                    <p>
                        In no event shall weapon compare or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on weapon compare's website.
                    </p>
                    <h2 className="text-2xl font-headline text-foreground">Governing Law</h2>
                    <p>
                        Any claim relating to weapon compare's website shall be governed by the laws of the website owner's jurisdiction without regard to its conflict of law provisions.
                    </p>
                </div>
            </div>
        </main>
    );
}
