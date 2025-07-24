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


export async function extractWeaponStats(input: ExtractWeaponStatsInput): Promise<ExtractWeaponStatsOutput> {
  return extractWeaponStatsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'extractWeaponStatsPrompt',
  input: {schema: ExtractWeaponStatsInputSchema},
  output: {schema: ExtractWeaponStatsOutputSchema},
  prompt: `You are an expert game analyst specializing in extracting weapon stats from screenshots using OCR. The weapon's name is typically found at the top of the image in a larger or bold font.

You will use this information to extract the stats and name of both weapons. If a weapon name cannot be determined, return "Unknown Weapon". For the 'handling' stat, use the value from the 'mobility' stat.

Extract the following stats: Damage, Stability, Range, Accuracy, Control, Mobility, Fire Rate (in RPM), and Muzzle Velocity (in m/s).

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
