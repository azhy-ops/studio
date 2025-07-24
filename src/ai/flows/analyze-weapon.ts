'use server';

/**
 * @fileOverview A weapon analysis AI agent.
 *
 * - analyzeWeapon - A function that handles the weapon analysis process.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import {
    AnalyzeWeaponInputSchema,
    type AnalyzeWeaponInput,
    AnalyzeWeaponOutputSchema,
    type AnalyzeWeaponOutput,
    WeaponStatsSchema,
    recommendedRanges
} from '@/ai/schemas/weapon-stats';


export async function analyzeWeapon(input: AnalyzeWeaponInput): Promise<AnalyzeWeaponOutput> {
  const ocrResult = await analyzeWeaponFlow(input);
  
  const { damage, handling, range, accuracy, control } = ocrResult.stats;
  
  let recommendedRange: (typeof recommendedRanges)[number] = "Mid Range";
  if ((damage + handling) > 150 && range < 40) {
      recommendedRange = "Close Range";
  } else if ((range + accuracy) > 140 && control > 60) {
      recommendedRange = "Long Range";
  }
  
  const overallScore = Math.min(100, Math.round(
      (damage * 0.3 + range * 0.25 + accuracy * 0.2 + control * 0.15 + handling * 0.1)
  ));
  
  const finalResult = await weaponSummaryFlow({
      ...ocrResult,
      recommendedRange,
      overallScore,
  });

  return {
    stats: ocrResult.stats,
    recommendedRange,
    overallScore,
    summary: finalResult.summary,
  };
}


const weaponSummaryFlow = ai.defineFlow(
  {
    name: 'weaponSummaryFlow',
    inputSchema: AnalyzeWeaponOutputSchema.omit({ summary: true }),
    outputSchema: z.object({ summary: z.string() }),
  },
  async (input) => {
    const prompt = `
      Analyze the following weapon stats and provide a brief summary of its ideal playstyle.

      Weapon: ${input.stats.name}
      Recommended Range: ${input.recommendedRange}
      Overall Score: ${input.overallScore}
      Stats: 
      - Damage: ${input.stats.damage}
      - Fire Rate: ${input.stats.fireRate}
      - Range: ${input.stats.range}
      - Accuracy: ${input.stats.accuracy}
      - Control: ${input.stats.control}
      - Stability: ${input.stats.stability}
      
      Generate a short, insightful comment about this weapon's strengths and ideal usage. For example: "Perfect for aggressive players who prefer close-quarters combat." or "A versatile rifle that excels at medium-range engagements."
    `;

    const { text } = await ai.generate({ prompt });
    return { summary: text };
  }
);


const ocrPrompt = ai.definePrompt({
  name: 'analyzeWeaponPrompt',
  input: {schema: AnalyzeWeaponInputSchema},
  output: {schema: z.object({stats: WeaponStatsSchema})},
  prompt: `You are an expert game analyst specializing in extracting weapon stats from screenshots using OCR. The weapon's name is typically found at the top of the image in a larger or bold font.

You will use this information to extract the stats and name of the weapon. If a weapon name cannot be determined, return "Unknown Weapon". For the 'handling' stat, use the value from the 'mobility' stat.

The top 15% of the image is most likely to contain the weapon's name.

Extract the following stats: Damage, Stability, Range, Accuracy, Control, Mobility, Fire Rate (in RPM), and Muzzle Velocity (in m/s).

Use the following as the primary source of information about the weapon.

Weapon Photo: {{media url=weaponPhotoDataUri}}

Output the stats for the weapon in JSON format.
`,
});

const analyzeWeaponFlow = ai.defineFlow(
  {
    name: 'analyzeWeaponFlow',
    inputSchema: AnalyzeWeaponInputSchema,
    outputSchema: z.object({stats: WeaponStatsSchema}),
  },
  async input => {
    const {output} = await ocrPrompt(input);
    return output!;
  }
);
