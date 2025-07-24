'use server';

/**
 * @fileOverview A weapon stats extraction AI agent.
 *
 * - extractWeaponStats - A function that handles the weapon stats extraction process.
 * - ExtractWeaponStatsInput - The input type for the extractWeaponStats function.
 * - ExtractWeaponStatsOutput - The return type for the extractWeaponStats function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExtractWeaponStatsInputSchema = z.object({
  weapon1PhotoDataUri: z
    .string()
    .describe(
      "A photo of weapon 1, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  weapon2PhotoDataUri: z
    .string()
    .describe(
      "A photo of weapon 2, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type ExtractWeaponStatsInput = z.infer<typeof ExtractWeaponStatsInputSchema>;

const ExtractWeaponStatsOutputSchema = z.object({
  weapon1Stats: z.object({
    name: z.string().describe('The name of weapon 1.'),
    damage: z.number().describe('The damage stat of weapon 1.'),
    stability: z.number().describe('The stability stat of weapon 1.'),
    range: z.number().describe('The range stat of weapon 1.'),
    accuracy: z.number().describe('The accuracy stat of weapon 1.'),
    control: z.number().describe('The control stat of weapon 1.'),
    mobility: z.number().describe('The mobility stat of weapon 1.'),
  }),
  weapon2Stats: z.object({
    name: z.string().describe('The name of weapon 2.'),
    damage: z.number().describe('The damage stat of weapon 2.'),
    stability: z.number().describe('The stability stat of weapon 2.'),
    range: z.number().describe('The range stat of weapon 2.'),
    accuracy: z.number().describe('The accuracy stat of weapon 2.'),
    control: z.number().describe('The control stat of weapon 2.'),
    mobility: z.number().describe('The mobility stat of weapon 2.'),
  }),
});
export type ExtractWeaponStatsOutput = z.infer<typeof ExtractWeaponStatsOutputSchema>;

export async function extractWeaponStats(input: ExtractWeaponStatsInput): Promise<ExtractWeaponStatsOutput> {
  return extractWeaponStatsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'extractWeaponStatsPrompt',
  input: {schema: ExtractWeaponStatsInputSchema},
  output: {schema: ExtractWeaponStatsOutputSchema},
  prompt: `You are an expert game analyst specializing in extracting weapon stats from screenshots using OCR. The weapon's name is typically found at the top of the image in a larger or bold font.

You will use this information to extract the stats and name of both weapons. If a weapon name cannot be determined, return "Unknown Weapon".

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
