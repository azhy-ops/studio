
'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { auth } from '../lib/firebase';
import { onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, User, signOut } from 'firebase/auth';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  openAuthDialog: () => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthDialogOpen, setIsAuthDialogOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const openAuthDialog = () => setIsAuthDialogOpen(true);
  const closeAuthDialog = () => setIsAuthDialogOpen(false);
  
  const logout = async () => {
    await signOut(auth);
  }

  return (
    <AuthContext.Provider value={{ user, loading, openAuthDialog, logout }}>
      {children}
      <AuthDialog isOpen={isAuthDialogOpen} onClose={closeAuthDialog} />
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

function AuthDialog({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { toast } = useToast();
    
    const handleEmailSignIn = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await signInWithEmailAndPassword(auth, email, password);
            onClose();
            toast({ title: 'Success', description: 'Logged in successfully!' });
        } catch (error: any) {
             toast({ title: 'Error', description: error.message, variant: 'destructive' });
        } finally {
            setIsSubmitting(false);
        }
    };
    
    const handleEmailSignUp = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await createUserWithEmailAndPassword(auth, email, password);
            onClose();
            toast({ title: 'Success', description: 'Account created and logged in!' });
        } catch (error: any) {
            toast({ title: 'Error', description: error.message, variant: 'destructive' });
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Authenticate</DialogTitle>
                    <DialogDescription>
                        Login to save your loadout.
                    </DialogDescription>
                </DialogHeader>
                <Tabs defaultValue="signin" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="signin">Sign In</TabsTrigger>
                        <TabsTrigger value="signup">Sign Up</TabsTrigger>
                    </TabsList>
                    <TabsContent value="signin">
                        <form onSubmit={handleEmailSignIn} className="space-y-4 py-4">
                            <div className="grid w-full items-center gap-1.5">
                                <Label htmlFor="email-signin">Email</Label>
                                <Input id="email-signin" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                            </div>
                            <div className="grid w-full items-center gap-1.5">
                                <Label htmlFor="password-signin">Password</Label>
                                <Input id="password-signin" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                            </div>
                            <Button type="submit" className="w-full" disabled={isSubmitting}>
                                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Sign In
                            </Button>
                        </form>
                    </TabsContent>
                    <TabsContent value="signup">
                        <form onSubmit={handleEmailSignUp} className="space-y-4 py-4">
                             <div className="grid w-full items-center gap-1.5">
                                <Label htmlFor="email-signup">Email</Label>
                                <Input id="email-signup" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                            </div>
                            <div className="grid w-full items-center gap-1.5">
                                <Label htmlFor="password-signup">Password</Label>
                                <Input id="password-signup" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                            </div>
                            <Button type="submit" className="w-full" disabled={isSubmitting}>
                                 {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Sign Up
                            </Button>
                        </form>
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
}
