
import { Sword, Anchor, Scaling, Crosshair, Gamepad2, Wind, ShieldQuestion, Zap, ChevronsRight, Hand } from 'lucide-react';
import type { LucideProps } from 'lucide-react';
import type { ComponentType } from 'react';

const statIconsList: { [key: string]: ComponentType<LucideProps> } = {
  damage: Sword,
  stability: Anchor,
  range: Scaling,
  accuracy: Crosshair,
  control: Gamepad2,
  handling: Hand,
  'handling&mobility': Hand,
  firerate: Zap,
  muzzlevelocity: ChevronsRight,
};

export function StatIcon({ name, ...props }: { name: string } & LucideProps) {
  const Icon = statIconsList[name] || ShieldQuestion;
  return <Icon {...props} />;
}
