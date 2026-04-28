import { Check, Monitor, Moon, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Button } from './ui/button';
import { cn } from './ui/utils';

const themeOptions = [
  { value: 'light', label: 'Light', icon: Sun },
  { value: 'dark', label: 'Dark', icon: Moon },
  { value: 'system', label: 'System', icon: Monitor },
] as const;

interface ThemeModeToggleProps {
  align?: 'start' | 'center' | 'end';
  buttonClassName?: string;
  compact?: boolean;
}

export function ThemeModeToggle({
  align = 'end',
  buttonClassName,
  compact = false,
}: ThemeModeToggleProps) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const currentTheme = theme ?? 'system';

  const activeOption = themeOptions.find((option) => option.value === currentTheme) ?? themeOptions[2];
  const ActiveIcon = activeOption.icon;

  if (!mounted) {
    return compact ? (
      <Button
        variant="outline"
        size="icon"
        className={cn('rounded-full border-border bg-background/70', buttonClassName)}
      >
        <Monitor className="h-4 w-4" />
      </Button>
    ) : (
      <div className="flex items-center gap-2 rounded-full border border-border bg-secondary/30 p-1">
        {themeOptions.map((option) => {
          const OptionIcon = option.icon;
          return (
            <Button key={option.value} type="button" size="sm" variant="ghost" disabled className="rounded-full px-3.5">
              <OptionIcon className="h-4 w-4" />
              <span>{option.label}</span>
            </Button>
          );
        })}
      </div>
    );
  }

  if (!compact) {
    return (
      <div className={cn('flex items-center gap-2 rounded-full border border-border bg-secondary/30 p-1', buttonClassName)}>
        {themeOptions.map((option) => {
          const OptionIcon = option.icon;
          const isActive = option.value === currentTheme;

          return (
            <Button
              key={option.value}
              type="button"
              size="sm"
              variant={isActive ? 'default' : 'ghost'}
              onClick={() => setTheme(option.value)}
              className={cn(
                'rounded-full px-3.5',
                !isActive && 'text-muted-foreground hover:text-foreground',
              )}
            >
              <OptionIcon className="h-4 w-4" />
              <span>{option.label}</span>
            </Button>
          );
        })}
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size={compact ? 'icon' : 'sm'}
          className={cn(
            compact
              ? 'rounded-full border-border bg-background/70'
              : 'gap-2 rounded-full border-border bg-background/70 px-3.5',
            buttonClassName,
          )}
        >
          <ActiveIcon className="h-4 w-4" />
          {!compact && <span>{activeOption.label}</span>}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align={align} className="w-44 rounded-xl">
        {themeOptions.map((option) => {
          const OptionIcon = option.icon;
          const isActive = option.value === currentTheme;

          return (
            <DropdownMenuItem key={option.value} onSelect={() => setTheme(option.value)}>
              <OptionIcon className="h-4 w-4" />
              <span>{option.label}</span>
              {isActive ? <Check className="ml-auto h-4 w-4 text-primary" /> : null}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default ThemeModeToggle;
