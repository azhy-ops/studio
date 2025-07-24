import {z} from 'genkit';

export const WeaponStatsSchema = z.object({
    name: z.string().describe('The name of the weapon.'),
    damage: z.number().describe('The damage stat of the weapon.'),
    stability: z.number().describe('The stability stat of the weapon.'),
    range: z.number().describe('The range stat of the weapon.'),
    accuracy: z.number().describe('The accuracy stat of the weapon.'),
    control: z.number().describe('The control stat of the weapon.'),
    mobility: z.number().describe('The mobility stat of the weapon.'),
    handling: z.number().describe('The handling stat of the weapon. This should be the same as the mobility stat.'),
    fireRate: z.number().describe('The fire rate of the weapon (in RPM).'),
    muzzleVelocity: z.number().describe('The muzzle velocity of the weapon (in m/s).'),
    ttk: z.number().describe('The time to kill in milliseconds, assuming 100 HP.'),
});

export const ExtractWeaponStatsInputSchema = z.object({
  weapon1PhotoDataUri: z
    .string()
    .describe(
      "A photo of weapon 1, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'"
    ),
  weapon2PhotoDataUri: z
    .string()
    .describe(
      "A photo of weapon 2, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'"
    ),
});
export type ExtractWeaponStatsInput = z.infer<typeof ExtractWeaponStatsInputSchema>;

export const ExtractWeaponStatsOutputSchema = z.object({
  weapon1Stats: WeaponStatsSchema,
  weapon2Stats: WeaponStatsSchema,
});
export type ExtractWeaponStatsOutput = z.infer<typeof ExtractWeaponStatsOutputSchema>;

export const AnalyzeWeaponInputSchema = z.object({
  weaponPhotoDataUri: z
    .string()
    .describe(
      "A photo of a weapon, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'"
    ),
});
export type AnalyzeWeaponInput = z.infer<typeof AnalyzeWeaponInputSchema>;

export const recommendedRanges = ["Close Range", "Mid Range", "Long Range"] as const;

export const SummaryPointSchema = z.object({
    point: z.string().describe("A key point about the weapon's strength or weakness."),
    type: z.enum(["strength", "secondary-strength", "weakness"]).describe("The type of the key point: strength (🔹), secondary-strength (🔸), or weakness (⚠️)."),
});

export const AnalyzeWeaponOutputSchema = z.object({
  stats: WeaponStatsSchema,
  recommendedRanges: z.array(z.enum(recommendedRanges)).describe("A list of recommended combat ranges for this weapon."),
  summaryPoints: z.array(SummaryPointSchema).describe("A bullet-point summary of the weapon's characteristics."),
  ttkSummary: z.string().describe("A summary of the weapon's time-to-kill performance."),
});
export type AnalyzeWeaponOutput = z.infer<typeof AnalyzeWeaponOutputSchema>;
