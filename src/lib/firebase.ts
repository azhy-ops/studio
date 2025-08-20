
import { initializeApp, getApps, getApp, FirebaseOptions } from 'firebase/app';
import { getAuth, GoogleAuthProvider, EmailAuthProvider } from 'firebase/auth';
import { getFirestore, collection, doc, setDoc, getDoc, query, where, getDocs, deleteDoc, updateDoc } from 'firebase/firestore';
import { getStorage, ref, uploadString, getDownloadURL, deleteObject } from 'firebase/storage';
import { v4 as uuidv4 } from 'uuid';
import type { WeaponStats, CalibrationStats } from './ocr';

const firebaseConfig: FirebaseOptions = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const firestore = getFirestore(app);
export const storage = getStorage(app);

export const googleProvider = new GoogleAuthProvider();
export const emailProvider = new EmailAuthProvider();

export interface Loadout {
    id: string;
    userId: string;
    name: string;
    imageUrl: string;
    baseStats: WeaponStats;
    calibrationStats: CalibrationStats;
    createdAt: Date;
}

// Firestore collection reference
const loadoutsCollection = collection(firestore, 'loadouts');

// Save a new loadout
export async function saveLoadout(userId: string, loadoutData: Omit<Loadout, 'imageUrl'>, imageUri: string): Promise<void> {
    if (!userId) throw new Error("User not authenticated.");

    // 1. Upload image to Firebase Storage
    const imageRef = ref(storage, `loadouts/${userId}/${loadoutData.id}.png`);
    const uploadResult = await uploadString(imageRef, imageUri, 'data_url');
    const imageUrl = await getDownloadURL(uploadResult.ref);

    // 2. Create the full loadout object with the image URL
    const finalLoadout: Loadout = {
        ...loadoutData,
        imageUrl,
        createdAt: new Date(),
    };

    // 3. Save loadout data to Firestore
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

    // 1. Delete Firestore document
    const loadoutDocRef = doc(firestore, `users/${userId}/loadouts`, loadoutId);
    await deleteDoc(loadoutDocRef);

    // 2. Delete image from Storage
    const imageRef = ref(storage, `loadouts/${userId}/${loadoutId}.png`);
    try {
        await deleteObject(imageRef);
    } catch (error: any) {
        if (error.code !== 'storage/object-not-found') {
            throw error; // re-throw if it's not a "not found" error
        }
        console.warn(`Image for loadout ${loadoutId} not found, but document deleted.`);
    }
}

// Update a loadout
export async function updateLoadout(userId: string, loadoutId: string, updates: Partial<Loadout>): Promise<void> {
    if (!userId) throw new Error("User not authenticated.");

    const loadoutDocRef = doc(firestore, `users/${userId}/loadouts`, loadoutId);
    await updateDoc(loadoutDocRef, updates);
}
