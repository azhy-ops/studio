
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

function calculateTTK(damage: number, fireRate: number): number {
  if (damage <= 0 || fireRate <= 0) return 0;
  const shotsToKill = Math.ceil(100 / damage);
  const delayBetweenShots = 60 / fireRate; // in seconds
  const ttk = (shotsToKill - 1) * delayBetweenShots;
  return Math.round(ttk * 1000); // convert to milliseconds
}


async function extractStatsFromImage(dataUri: string): Promise<WeaponStats> {
    const ocrWorker = await getWorker();

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
        name: 'Unknown Weapon',
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

extractStatsFromImage.calculateTTK = calculateTTK;


export { extractStatsFromImage };


export async function terminateWorker() {
    if (worker) {
        await worker.terminate();
        worker = null;
    }
}
