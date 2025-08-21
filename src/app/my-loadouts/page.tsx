
'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/auth-context';
import { getLoadouts, deleteLoadout, updateLoadout, type Loadout } from '@/lib/firebase';
import { Loader2, Trash2, Edit, Save, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';
import { calculateFinalScore, calculateFinalStats } from '@/lib/ocr';
import { SimpleStatBar } from '@/components/stat-bar';
import { Input } from '@/components/ui/input';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

function LoadoutCard({ loadout, onDelete, onUpdate }: { loadout: Loadout, onDelete: (id: string) => void, onUpdate: (id: string, name: string) => void }) {
    const finalStats = calculateFinalStats(loadout.baseStats, loadout.calibrationStats);
    const finalScore = calculateFinalScore(finalStats);
    const [isEditing, setIsEditing] = useState(false);
    const [name, setName] = useState(loadout.name);

    const handleSave = () => {
        onUpdate(loadout.id, name);
        setIsEditing(false);
    };

    const statDisplayOrder: (keyof Omit<typeof finalStats, 'name' | 'ttk' | 'type'>)[] = [
        'damage', 'fireRate', 'range', 'accuracy', 'control', 'handling', 'stability', 'muzzleVelocity'
    ];

    return (
        <Card className="bg-card/50 backdrop-blur-sm w-full">
            <CardHeader>
                <div className="flex justify-between items-start">
                    {isEditing ? (
                        <Input value={name} onChange={(e) => setName(e.target.value)} className="text-xl font-bold" />
                    ) : (
                        <CardTitle className="font-headline text-2xl">{loadout.name}</CardTitle>
                    )}
                    <div className="flex gap-2">
                        {isEditing ? (
                            <>
                                <Button size="icon" variant="ghost" onClick={handleSave}><Save className="h-4 w-4" /></Button>
                                <Button size="icon" variant="ghost" onClick={() => setIsEditing(false)}><X className="h-4 w-4" /></Button>
                            </>
                        ) : (
                            <Button size="icon" variant="ghost" onClick={() => setIsEditing(true)}><Edit className="h-4 w-4" /></Button>
                        )}
                         <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button size="icon" variant="destructive_outline"><Trash2 className="h-4 w-4" /></Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This action cannot be undone. This will permanently delete your loadout.
                                </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => onDelete(loadout.id)}>Delete</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                </div>
                 <p className="text-xs text-muted-foreground">{new Date(loadout.createdAt).toLocaleDateString()}</p>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="relative aspect-video w-full rounded-md overflow-hidden">
                    <Image src={loadout.imageDataUri} alt={loadout.name} layout="fill" objectFit="contain" />
                </div>
                <div className="text-center font-bold text-lg">Final Score: <span className="text-accent">{finalScore.toFixed(2)}</span></div>
                <div className="space-y-2">
                    {statDisplayOrder.map(statKey => {
                        const value = finalStats[statKey];
                        if (value === undefined || value === 0) return null;
                        return <SimpleStatBar key={statKey} statName={statKey} value={value} label={statKey} />;
                    })}
                </div>
            </CardContent>
        </Card>
    );
}

export default function MyLoadoutsPage() {
    const { user, loading: authLoading } = useAuth();
    const [loadouts, setLoadouts] = useState<Loadout[]>([]);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    useEffect(() => {
        if (authLoading) return;
        if (!user) {
            // Redirect or show login prompt
            setLoading(false);
            return;
        }

        async function fetchLoadouts() {
            try {
                const userLoadouts = await getLoadouts(user!.uid);
                setLoadouts(userLoadouts);
            } catch (error) {
                toast({ title: "Error", description: "Failed to fetch loadouts.", variant: "destructive" });
            } finally {
                setLoading(false);
            }
        }

        fetchLoadouts();
    }, [user, authLoading, toast]);
    
    const handleDelete = async (id: string) => {
        try {
            await deleteLoadout(user!.uid, id);
            setLoadouts(prev => prev.filter(l => l.id !== id));
            toast({title: "Success", description: "Loadout deleted."});
        } catch (error) {
            toast({ title: "Error", description: "Failed to delete loadout.", variant: "destructive" });
        }
    };
    
    const handleUpdate = async (id: string, name: string) => {
        try {
            await updateLoadout(user!.uid, id, { name });
            setLoadouts(prev => prev.map(l => l.id === id ? {...l, name} : l));
            toast({title: "Success", description: "Loadout updated."});
        } catch (error) {
            toast({ title: "Error", description: "Failed to update loadout.", variant: "destructive" });
        }
    };

    if (loading || authLoading) {
        return (
            <div className="container mx-auto flex min-h-screen flex-col items-center justify-center p-4 md:p-8">
                <Loader2 className="h-16 w-16 animate-spin" />
            </div>
        );
    }

    if (!user) {
        return (
            <div className="container mx-auto flex min-h-screen flex-col items-center justify-center p-4 md:p-8 text-center">
                 <h1 className="font-headline text-5xl font-bold tracking-tighter sm:text-6xl md:text-7xl">
                    Access Denied
                </h1>
                <p className="mt-4 text-lg text-muted-foreground">Please log in to view your saved loadouts.</p>
            </div>
        );
    }
    
    return (
        <main className="container mx-auto flex min-h-screen flex-col items-center p-4 pt-12 md:p-8">
             <div className="w-full max-w-6xl space-y-8">
                 <header className="text-center">
                    <h1 className="font-headline text-5xl font-bold tracking-tighter sm:text-6xl md:text-7xl">
                        My Loadouts
                    </h1>
                </header>
                {loadouts.length > 0 ? (
                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {loadouts.map(loadout => (
                            <LoadoutCard key={loadout.id} loadout={loadout} onDelete={handleDelete} onUpdate={handleUpdate} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16 border-2 border-dashed rounded-lg">
                        <p className="text-muted-foreground">You don't have any saved loadouts yet.</p>
                    </div>
                )}
             </div>
        </main>
    )
}
