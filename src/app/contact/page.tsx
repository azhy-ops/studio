import type { Metadata } from 'next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

export const metadata: Metadata = {
    title: 'Contact Us | Weapon Comparator',
    description: 'Get in touch with the Weapon Comparator team. We welcome your feedback, suggestions, and inquiries. Fill out the contact form to reach us.',
};

export default function ContactPage() {
    return (
        <main className="container mx-auto flex min-h-screen flex-col items-center justify-center p-4 md:p-8">
            <div className="w-full max-w-2xl">
                <Card className="w-full bg-card/50 backdrop-blur-sm">
                    <CardHeader className="text-center">
                        <CardTitle className="font-headline text-5xl font-bold tracking-tighter sm:text-6xl">
                            Contact Us
                        </CardTitle>
                        <CardDescription className="pt-2 text-lg">
                            Have questions, feedback, or suggestions? We'd love to hear from you.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form className="space-y-6">
                            <div className="grid w-full items-center gap-1.5">
                                <Label htmlFor="name">Name</Label>
                                <Input type="text" id="name" placeholder="Your Name" />
                            </div>
                            <div className="grid w-full items-center gap-1.5">
                                <Label htmlFor="email">Email</Label>
                                <Input type="email" id="email" placeholder="your@email.com" />
                            </div>
                            <div className="grid w-full items-center gap-1.5">
                                <Label htmlFor="message">Message</Label>
                                <Textarea id="message" placeholder="Your message..." rows={5} />
                            </div>
                            <Button type="submit" className="w-full font-headline text-lg" disabled>
                                Send Message
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </main>
    );
}
