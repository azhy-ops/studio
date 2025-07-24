import { Sword, Anchor, Scaling, Crosshair, Gamepad2, Wind, ShieldQuestion } from 'lucide-react';
import type { LucideProps } from 'lucide-react';
import type { ComponentType } from 'react';

const statIconsList: { [key: string]: ComponentType<LucideProps> } = {
  damage: Sword,
  stability: Anchor,
  range: Scaling,
  accuracy: Crosshair,
  control: Gamepad2,
  mobility: Wind,
};

export function StatIcon({ name, ...props }: { name: string } & LucideProps) {
  const Icon = statIconsList[name] || ShieldQuestion;
  return <Icon {...props} />;
}
