
"use client";

import Link from 'next/link';
import { Button } from './ui/button';
import { useAuth } from '@/context/auth-context';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { LayoutGrid, LogOut, User as UserIcon } from 'lucide-react';


export default function Header() {
    const { user, loading, openAuthDialog, logout } = useAuth();

    return (
        <header className="w-full bg-background/50 backdrop-blur-sm border-b sticky top-0 z-50">
            <div className="container mx-auto py-3 px-4 md:px-8 flex justify-between items-center">
                <Link href="/" className="font-headline text-2xl font-bold tracking-tighter">
                    weapon compare
                </Link>
                <nav className="flex items-center gap-4">
                     {loading ? (
                        <div className="h-10 w-20 bg-muted rounded-md animate-pulse" />
                    ) : user ? (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                                    <Avatar>
                                        <AvatarImage src={user.photoURL || ''} alt={user.displayName || 'User'}/>
                                        <AvatarFallback>
                                            {user.email?.[0].toUpperCase() || <UserIcon />}
                                        </AvatarFallback>
                                    </Avatar>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-56" align="end" forceMount>
                                <DropdownMenuLabel className="font-normal">
                                    <div className="flex flex-col space-y-1">
                                        <p className="text-sm font-medium leading-none">{user.displayName}</p>
                                        <p className="text-xs leading-none text-muted-foreground">
                                            {user.email}
                                        </p>
                                    </div>
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                 <DropdownMenuItem asChild>
                                    <Link href="/my-loadouts">
                                        <LayoutGrid className="mr-2 h-4 w-4" />
                                        <span>My Loadouts</span>
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={logout}>
                                    <LogOut className="mr-2 h-4 w-4" />
                                    <span>Log out</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    ) : (
                        <Button onClick={openAuthDialog}>Login</Button>
                    )}
                </nav>
            </div>
        </header>
    );
}
