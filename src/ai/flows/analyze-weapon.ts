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
    SummaryPointSchema,
    recommendedRanges
} from '@/ai/schemas/weapon-stats';


export async function analyzeWeapon(input: AnalyzeWeaponInput): Promise<AnalyzeWeaponOutput> {
  const ocrResult = await ocrFlow(input);
  const result = await analysisFlow(ocrResult.stats);
  return {
    stats: ocrResult.stats,
    ...result
  };
}

const analysisPrompt = ai.definePrompt({
    name: 'analysisPrompt',
    input: { schema: WeaponStatsSchema },
    output: { schema: z.object({ recommendedRanges: z.array(z.enum(recommendedRanges)), summaryPoints: z.array(SummaryPointSchema) }) },
    prompt: `You are an expert weapon analyst for a popular first-person shooter game. Your task is to analyze a weapon's stats and provide a tactical breakdown for the player. Do not mention mobility or handling in your summary points.

Analyze the following weapon stats:
- Weapon: {{name}}
- Damage: {{damage}}
- Fire Rate: {{fireRate}} RPM
- Range: {{range}}
- Accuracy: {{accuracy}}
- Control: {{control}}
- Stability: {{stability}}
- Muzzle Velocity: {{muzzleVelocity}} m/s

Based on these stats, perform the following actions:

1.  **Determine Best Combat Range(s):**
    - Classify as **"Close Range"** if Fire Rate, Handling (same as Mobility), and Damage are all > 65.
    - Classify as **"Mid Range"** if Accuracy, Control, and Stability are all > 65.
    - Classify as **"Long Range"** if Accuracy > 75, Stability > 70, and Range > 65.
    - If it's effective in multiple ranges, list all of them. If none, select the most fitting one.

2.  **Generate Key Point Summary (5-6 bullet points):**
    - Create a list of the weapon's key strengths and weaknesses in simple terms.
    - Use the following types for each point: 'strength' (for primary advantages, 🔹), 'secondary-strength' (for notable but less critical perks, 🔸), and 'weakness' (for clear disadvantages, ⚠️).
    - Provide insightful comments. Examples:
        - point: "High damage with fast fire rate – excellent for close-range fights", type: "strength"
        - point: "Great control and stability – ideal for mid-range consistency", type: "secondary-strength"
        - point: "Low mobility – harder to reposition quickly", type: "weakness"
        - point: "Accurate at range – can land shots at a long distance", type: "strength"
        - point: "Fast handling makes it strong in surprise engagements", type: "secondary-strength"

Output the analysis in JSON format.
`,
});

const analysisFlow = ai.defineFlow(
    {
        name: 'analysisFlow',
        inputSchema: WeaponStatsSchema,
        outputSchema: z.object({ recommendedRanges: z.array(z.enum(recommendedRanges)), summaryPoints: z.array(SummaryPointSchema) }),
    },
    async (stats) => {
        const { output } = await analysisPrompt(stats);
        return output!;
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

const ocrFlow = ai.defineFlow(
  {
    name: 'ocrFlow',
    inputSchema: AnalyzeWeaponInputSchema,
    outputSchema: z.object({stats: WeaponStatsSchema}),
  },
  async input => {
    const {output} = await ocrPrompt(input);
    return output!;
  }
);
