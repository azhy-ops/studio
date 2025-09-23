
import type { SVGProps } from 'react';

export function Logo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 100"
      width="100"
      height="100"
      {...props}
    >
      <g transform="translate(50,50)">
        <path d="M -40 -15 L -20 -35 L 20 -35 L 40 -15 L 40 15 L 20 35 L -20 35 L -40 15 Z" fill="hsl(var(--primary))" stroke="hsl(var(--foreground))" strokeWidth="3" />
        <path d="M -25 -10 L -10 -25 L 10 -25 L 25 -10 L 25 10 L 10 25 L -10 25 L -25 10 Z" fill="hsl(var(--background))" />
        <circle cx="0" cy="0" r="8" fill="hsl(var(--accent))" />
      </g>
    </svg>
  );
}
