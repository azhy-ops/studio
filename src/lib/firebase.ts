
import { initializeApp, getApps, getApp, FirebaseOptions } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore, collection, doc, setDoc, getDocs, deleteDoc, updateDoc, query } from 'firebase/firestore';
import { getStorage, ref, uploadString, getDownloadURL, deleteObject } from 'firebase/storage';
import type { WeaponStats, CalibrationStats } from './ocr';

const firebaseConfig: FirebaseOptions = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const firestore = getFirestore(app);
export const storage = getStorage(app);

export const googleProvider = new GoogleAuthProvider();

export interface Loadout {
    id: string;
    userId: string;
    name: string;
    imageDataUri: string; // Changed from imageUrl
    baseStats: WeaponStats;
    calibrationStats: CalibrationStats;
    createdAt: Date;
}

// Save a new loadout
export async function saveLoadout(userId: string, loadoutData: Omit<Loadout, 'createdAt'>): Promise<void> {
    if (!userId) throw new Error("User not authenticated.");

    // Create the full loadout object with a timestamp
    const finalLoadout: Loadout = {
        ...loadoutData,
        createdAt: new Date(),
    };

    // Save loadout data (including imageDataUri) directly to Firestore
    const loadoutDocRef = doc(firestore, `users/${userId}/loadouts`, finalLoadout.id);
    await setDoc(loadoutDocRef, finalLoadout);
}

// Fetch all loadouts for a user
export async function getLoadouts(userId: string): Promise<Loadout[]> {
    if (!userId) return [];

    const userLoadoutsRef = collection(firestore, `users/${userId}/loadouts`);
    const q = query(userLoadoutsRef);
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
        ...doc.data(),
        createdAt: doc.data().createdAt.toDate(),
    })) as Loadout[];
}


// Delete a loadout
export async function deleteLoadout(userId: string, loadoutId: string): Promise<void> {
    if (!userId) throw new Error("User not authenticated.");

    // Only need to delete the Firestore document now
    const loadoutDocRef = doc(firestore, `users/${userId}/loadouts`, loadoutId);
    await deleteDoc(loadoutDocRef);
}

// Update a loadout
export async function updateLoadout(userId: string, loadoutId: string, updates: Partial<Loadout>): Promise<void> {
    if (!userId) throw new Error("User not authenticated.");

    const loadoutDocRef = doc(firestore, `users/${userId}/loadouts`, loadoutId);
    await updateDoc(loadoutDocRef, updates);
}
