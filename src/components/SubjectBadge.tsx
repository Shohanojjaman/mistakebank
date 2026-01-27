import { cn } from '@/lib/utils';

interface SubjectBadgeProps {
  name: string;
  color: string;
  size?: 'sm' | 'md';
  className?: string;
}

export function SubjectBadge({ name, color, size = 'md', className }: SubjectBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full font-medium",
        size === 'sm' ? "px-2 py-0.5 text-xs" : "px-3 py-1 text-sm",
        className
      )}
      style={{
        backgroundColor: `${color}20`,
        color: color,
      }}
    >
      <span
        className={cn(
          "rounded-full mr-1.5",
          size === 'sm' ? "h-1.5 w-1.5" : "h-2 w-2"
        )}
        style={{ backgroundColor: color }}
      />
      {name}
    </span>
  );
}
