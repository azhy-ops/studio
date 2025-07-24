'use client';

import { createWorker, type Worker } from 'tesseract.js';

export interface WeaponStats {
    name: string;
    damage: number;
    stability: number;
    range: number;
    accuracy: number;
    control: number;
    mobility: number;
    handling: number;
    fireRate: number;
    muzzleVelocity: number;
    ttk: number;
}

let worker: Worker | null = null;
let workerLoading = false;

async function getWorker() {
    if (worker) return worker;
    if (workerLoading) {
        // Wait for the worker to be loaded by another call
        return new Promise<Worker>((resolve) => {
            const interval = setInterval(() => {
                if (worker) {
                    clearInterval(interval);
                    resolve(worker);
                }
            }, 100);
        });
    }

    workerLoading = true;
    const newWorker = await createWorker('eng');
    worker = newWorker;
    workerLoading = false;
    return worker;
}

function parseStat(text: string, statName: string): number {
    const regex = new RegExp(`${statName}\\s*(\\d+)`, 'i');
    const match = text.match(regex);
    if (match && match[1]) {
        return parseInt(match[1], 10);
    }
    return 0;
}

function parseName(text: string): string {
    const lines = text.split('\n').map(line => line.trim());
    // Assume the name is one of the first few non-empty lines and likely in all caps or larger font.
    // Tesseract may not give us font info, so we can use heuristics.
    for (const line of lines) {
        if (line.length > 3 && /^[A-Z0-9\s-]+$/.test(line)) {
            // A simple heuristic: is it all caps, numbers, spaces, or hyphens?
            // This is a rough way to find a weapon name.
            const commonStats = ['DAMAGE', 'STABILITY', 'RANGE', 'ACCURACY', 'CONTROL', 'MOBILITY', 'FIRERATE', 'MUZZLEVELOCITY', 'HANDLING'];
            if (!commonStats.some(stat => line.toUpperCase().includes(stat))) {
                return line;
            }
        }
    }
    return 'Unknown Weapon';
}

function calculateTTK(damage: number, fireRate: number): number {
  if (damage <= 0 || fireRate <= 0) return 0;
  const shotsToKill = Math.ceil(100 / damage);
  const delayBetweenShots = 60 / fireRate; // in seconds
  const ttk = (shotsToKill - 1) * delayBetweenShots;
  return Math.round(ttk * 1000); // convert to milliseconds
}


export async function extractStatsFromImage(dataUri: string): Promise<WeaponStats> {
    const ocrWorker = await getWorker();

    // Extract name from top 15% of the image
    const nameResult = await ocrWorker.recognize(dataUri, {
        rectangle: { top: 0, left: 0, width: 2000, height: 300 }, // Assuming image width is not more than 2000px and height is at least 300px
    });
    const name = parseName(nameResult.data.text);
    

    // Extract stats from the whole image
    const result = await ocrWorker.recognize(dataUri);
    const text = result.data.text;
    
    const damage = parseStat(text, 'Damage');
    const stability = parseStat(text, 'Stability');
    const range = parseStat(text, 'Range');
    const accuracy = parseStat(text, 'Accuracy');
    const control = parseStat(text, 'Control');
    const mobility = parseStat(text, 'Mobility');
    const fireRate = parseStat(text, 'Fire Rate');
    const muzzleVelocity = parseStat(text, 'Muzzle Velocity');

    const stats: WeaponStats = {
        name,
        damage,
        stability,
        range,
        accuracy,
        control,
        mobility,
        handling: mobility,
        fireRate,
        muzzleVelocity,
        ttk: 0
    };
    
    stats.ttk = calculateTTK(stats.damage, stats.fireRate);

    return stats;
}

// Optional: function to terminate the worker if the component unmounts
export async function terminateWorker() {
    if (worker) {
        await worker.terminate();
        worker = null;
    }
}
