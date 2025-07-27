import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'About Us | Weapon Comparator',
    description: 'Learn more about Weapon Comparator, our mission to help gamers make better decisions with data-driven tools, and the technology behind our platform.',
};

export default function AboutPage() {
    return (
        <main className="container mx-auto flex min-h-screen flex-col items-center p-4 pt-12 md:p-8">
            <div className="w-full max-w-4xl space-y-8">
                <header className="text-center">
                    <h1 className="font-headline text-5xl font-bold tracking-tighter sm:text-6xl md:text-7xl">
                        About Us
                    </h1>
                </header>
                <div className="prose prose-invert mx-auto max-w-prose text-lg text-muted-foreground">
                    <p>
                        Welcome to Weapon Comparator, the ultimate tool for serious gamers and FPS enthusiasts. Our mission is to empower players like you with the data needed to make smarter decisions about your in-game loadouts.
                    </p>
                    <p>
                        We understand that in competitive gaming, every millisecond and every stat point counts. That's why we built a platform that takes the guesswork out of comparing weapon stats. By using Optical Character Recognition (OCR) technology, we allow you to upload screenshots directly from your game and get a detailed, side-by-side comparison in seconds.
                    </p>
                    <p>
                        Our team is composed of passionate gamers and developers who believe in the power of data. We are constantly working to improve our tool, refine our algorithms, and support more games to ensure you have the most accurate and up-to-date information at your fingertips.
                    </p>
                    <p>
                        Thank you for using Weapon Comparator. We hope our tool helps you dominate the competition and achieve victory.
                    </p>
                </div>
            </div>
        </main>
    );
}
