
'use client';

import { createWorker, type Worker } from 'tesseract.js';

export interface WeaponStats {
    name: string;
    type?: string;
    damage: number;
    stability: number;
    range: number;
    accuracy: number;
    control: number;
    handling: number;
    fireRate: number;
    muzzleVelocity: number;
    ttk: number;
    fireRateInputType: 'rpm' | 'stat';
    maxRpmOverride?: number;
    shotsToKill?: number;
    timeBetweenShots?: number;
    rpmUsed?: number;
}

export const defaultMaxRpm: Record<string, number> = {
    "SMG": 1000,
    "Assault Rifle": 800,
    "LMG": 700,
    "Marksman Rifle": 250,
    "Sniper": 60,
    "Pistol": 600
};


let worker: Worker | null = null;
let workerLoading = false;

async function getWorker() {
    if (worker) return worker;
    if (workerLoading) {
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
    const regex = new RegExp(`(?:${statName}|${statName.replace(/([A-Z])/g, ' $1')})\\s*(\\d+)`, 'i');
    const match = text.match(regex);
    if (match && match[1]) {
        return parseInt(match[1], 10);
    }
    return 0;
}

function calculateTTK(
    damage: number,
    fireRate: number,
    fireRateInputType: 'rpm' | 'stat' = 'stat',
    weaponType: string = 'Assault Rifle',
    maxRpmOverride?: number
) {
    if (damage <= 0) return { ttk: 0, shotsToKill: 0, timeBetweenShots: 0, rpmUsed: 0 };

    const maxRpm = maxRpmOverride || defaultMaxRpm[weaponType] || 800;

    let rpmUsed: number;
    if (fireRateInputType === 'rpm') {
        rpmUsed = fireRate > 2000 ? 2000 : fireRate;
    } else {
        const clampedFireRate = Math.max(0, fireRate);
        rpmUsed = (clampedFireRate / 100) * maxRpm;
    }

    if (rpmUsed < 1) rpmUsed = 1;


    const shotsToKill = Math.ceil(100 / damage);
    if (shotsToKill <= 1) return { ttk: 0, shotsToKill: 1, timeBetweenShots: 0, rpmUsed };

    const timeBetweenShots = 60 / rpmUsed;
    const ttk = (shotsToKill - 1) * timeBetweenShots;

    return {
        ttk: Math.round(ttk * 1000), // convert to milliseconds
        shotsToKill,
        timeBetweenShots: Number(timeBetweenShots.toFixed(3)),
        rpmUsed: Number(rpmUsed.toFixed(2)),
    };
}


async function extractStatsFromImage(dataUri: string): Promise<Omit<WeaponStats, 'type' | 'fireRateInputType' | 'maxRpmOverride' | 'shotsToKill' | 'timeBetweenShots' | 'rpmUsed'>> {
    const ocrWorker = await getWorker();

    const result = await ocrWorker.recognize(dataUri);
    const text = result.data.text;
    
    const damage = parseStat(text, 'Damage');
    const stability = parseStat(text, 'Stability');
    const range = parseStat(text, 'Range');
    const accuracy = parseStat(text, 'Accuracy');
    const control = parseStat(text, 'Control');
    const handling = parseStat(text, 'Handling');
    const fireRate = parseStat(text, 'Fire Rate');
    const muzzleVelocity = parseStat(text, 'Muzzle Velocity');

    const mobility = parseStat(text, 'Mobility');
    const combinedHandling = handling > 0 ? handling : mobility;

    const stats = {
        name: 'Unknown Weapon',
        damage,
        stability,
        range,
        accuracy,
        control,
        handling: combinedHandling,
        fireRate,
        muzzleVelocity,
        ttk: 0,
    };
    
    const ttkResults = calculateTTK(stats.damage, stats.fireRate);
    stats.ttk = ttkResults.ttk;

    return stats;
}

extractStatsFromImage.calculateTTK = calculateTTK;


export { extractStatsFromImage };


export async function terminateWorker() {
    if (worker) {
        await worker.terminate();
        worker = null;
    }
}
