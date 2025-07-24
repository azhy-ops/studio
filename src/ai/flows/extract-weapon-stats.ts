'use server';

/**
 * @fileOverview A weapon stats extraction AI agent.
 *
 * - extractWeaponStats - A function that handles the weapon stats extraction process.
 */

import {ai} from '@/ai/genkit';
import {
  ExtractWeaponStatsInputSchema,
  type ExtractWeaponStatsInput,
  ExtractWeaponStatsOutputSchema,
  type ExtractWeaponStatsOutput,
} from '@/ai/schemas/weapon-stats';


function calculateTTK(damage: number, fireRate: number): number {
  if (damage <= 0 || fireRate <= 0) return 0;
  const shotsToKill = Math.ceil(100 / damage);
  const delayBetweenShots = 60 / fireRate; // in seconds
  const ttk = (shotsToKill - 1) * delayBetweenShots;
  return Math.round(ttk * 1000); // convert to milliseconds
}

export async function extractWeaponStats(input: ExtractWeaponStatsInput): Promise<ExtractWeaponStatsOutput> {
  const result = await extractWeaponStatsFlow(input);
  
  result.weapon1Stats.ttk = calculateTTK(result.weapon1Stats.damage, result.weapon1Stats.fireRate);
  result.weapon2Stats.ttk = calculateTTK(result.weapon2Stats.damage, result.weapon2Stats.fireRate);
  
  return result;
}

const prompt = ai.definePrompt({
  name: 'extractWeaponStatsPrompt',
  input: {schema: ExtractWeaponStatsInputSchema},
  output: {schema: ExtractWeaponStatsOutputSchema},
  prompt: `You are an expert game analyst specializing in extracting weapon stats from screenshots using OCR. The weapon's name is typically found at the top of the image in a larger or bold font.

You will use this information to extract the stats and name of both weapons. If a weapon name cannot be determined, return "Unknown Weapon". For the 'handling' stat, use the value from the 'mobility' stat.

Extract the following stats: Damage, Stability, Range, Accuracy, Control, Mobility, Fire Rate (in RPM), and Muzzle Velocity (in m/s).

The time-to-kill (ttk) should be set to 0 and will be calculated later.

Use the following as the primary source of information about the weapons.

Weapon 1 Photo: {{media url=weapon1PhotoDataUri}}
Weapon 2 Photo: {{media url=weapon2PhotoDataUri}}

Output the stats for each weapon in JSON format.
`,
});

const extractWeaponStatsFlow = ai.defineFlow(
  {
    name: 'extractWeaponStatsFlow',
    inputSchema: ExtractWeaponStatsInputSchema,
    outputSchema: ExtractWeaponStatsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
