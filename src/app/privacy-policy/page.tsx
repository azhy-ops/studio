import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Privacy Policy | Weapon Comparator',
    description: 'Our Privacy Policy explains how Weapon Comparator handles user data, including uploaded images and information, to ensure your privacy and security.',
};

export default function PrivacyPolicyPage() {
    return (
        <main className="container mx-auto flex min-h-screen flex-col items-center p-4 pt-12 md:p-8">
            <div className="w-full max-w-4xl space-y-8">
                <header className="text-center">
                    <h1 className="font-headline text-5xl font-bold tracking-tighter sm:text-6xl md:text-7xl">
                        Privacy Policy
                    </h1>
                </header>
                <div className="prose prose-invert mx-auto max-w-prose text-lg text-muted-foreground space-y-4">
                    <p>
                        Your privacy is important to us. It is Weapon Comparator's policy to respect your privacy regarding any information we may collect from you across our website.
                    </p>
                    <h2 className="text-2xl font-headline text-foreground">Information We Collect</h2>
                    <p>
                        We only collect information about you that is necessary for the functionality of our service. The primary data we handle are the images you voluntarily upload for weapon stat analysis. These images are processed on our servers to extract statistical data and are not stored permanently or used for any other purpose.
                    </p>
                     <h2 className="text-2xl font-headline text-foreground">Image Data</h2>
                    <p>
                        Uploaded images are temporarily processed to perform Optical Character Recognition (OCR). We do not store, share, or sell your uploaded images. Once the analysis is complete, the images are discarded from our system.
                    </p>
                    <h2 className="text-2xl font-headline text-foreground">Cookies</h2>
                    <p>
                        We may use cookies to enhance your experience on our site. Cookies are small data files stored on your device that help us understand user preferences and improve our service. You can disable cookies through your browser settings, but this may affect the functionality of the website.
                    </p>
                     <h2 className="text-2xl font-headline text-foreground">Third-Party Services</h2>
                    <p>
                       This website may use third-party services such as Google AdSense for advertising. These services may use cookies to serve ads based on a user's prior visits to this and other websites. Google's use of advertising cookies enables it and its partners to serve ads to your users based on their visit to your sites and/or other sites on the Internet. Users may opt out of personalized advertising by visiting Ads Settings.
                    </p>
                    <h2 className="text-2xl font-headline text-foreground">Changes to This Policy</h2>
                    <p>
                        We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page. You are advised to review this Privacy Policy periodically for any changes.
                    </p>
                </div>
            </div>
        </main>
    );
}
