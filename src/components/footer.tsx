
import Link from 'next/link';
import { Separator } from './ui/separator';

export default function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="w-full bg-background border-t mt-auto">
            <div className="container mx-auto py-8 px-4 md:px-8">
                <div className="flex flex-col md:flex-row justify-between items-center text-center md:text-left space-y-4 md:space-y-0">
                    <div className="text-sm text-muted-foreground">
                        &copy; {currentYear} weapon compare. All Rights Reserved.
                    </div>
                    <nav className="flex flex-wrap justify-center gap-4 md:gap-6">
                        <Link href="/about" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                            About Us
                        </Link>
                        <Link href="/contact" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                            Contact
                        </Link>
                        <Link href="/privacy-policy" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                            Privacy Policy
                        </Link>
                        <Link href="/terms-of-service" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                            Terms of Service
                        </Link>
                        <Link href="/disclaimer" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                            Disclaimer
                        </Link>
                    </nav>
                </div>
            </div>
        </footer>
    );
}
