import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Disclaimer | Weapon Comparator',
    description: 'Read the disclaimer for Weapon Comparator. Understand the limitations of our tool and the terms of its use.',
};

export default function DisclaimerPage() {
    return (
        <main className="container mx-auto flex min-h-screen flex-col items-center p-4 pt-12 md:p-8">
            <div className="w-full max-w-4xl space-y-8">
                <header className="text-center">
                    <h1 className="font-headline text-5xl font-bold tracking-tighter sm:text-6xl md:text-7xl">
                        Disclaimer
                    </h1>
                </header>
                <div className="prose prose-invert mx-auto max-w-prose text-lg text-muted-foreground space-y-4">
                    <p>
                        The information provided by Weapon Comparator ("we," "us," or "our") on this website is for general informational purposes only. All information on the site is provided in good faith, however, we make no representation or warranty of any kind, express or implied, regarding the accuracy, adequacy, validity, reliability, availability, or completeness of any information on the site.
                    </p>
                    <p>
                        The weapon stats and analysis are generated through Optical Character Recognition (OCR) technology and pre-defined formulas, which may be subject to errors, inaccuracies, or inconsistencies. The extracted values are highly dependent on the quality and resolution of the uploaded screenshots. We strongly encourage users to verify the extracted stats and use their own judgment.
                    </p>
                    <p>
                        Weapon Comparator is an independent tool and is not affiliated with, endorsed by, or in any way officially connected with any game developer or publisher. All game titles, weapon names, and related trademarks are the property of their respective owners.
                    </p>
                     <p>
                        Under no circumstance shall we have any liability to you for any loss or damage of any kind incurred as a result of the use of the site or reliance on any information provided on the site. Your use of the site and your reliance on any information on the site is solely at your own risk.
                    </p>
                </div>
            </div>
        </main>
    );
}
