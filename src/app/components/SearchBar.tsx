import { Search, X } from 'lucide-react';
import { useState } from 'react';
import { Input } from './ui/input';
import { Button } from './ui/button';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onSearch?: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function SearchBar({ 
  value, 
  onChange, 
  onSearch,
  placeholder = "Search movies, directors, genres...",
  className = ""
}: SearchBarProps) {
  const [isFocused, setIsFocused] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch?.(value);
  };

  const handleClear = () => {
    onChange('');
    onSearch?.('');
  };

  return (
    <form onSubmit={handleSubmit} className={className}>
      <div 
        className={`relative flex items-center rounded-xl border bg-card transition-all ${
          isFocused 
            ? 'border-primary ring-2 ring-primary/20' 
            : 'border-border hover:border-primary/50'
        }`}
      >
        <Search className="absolute left-4 h-5 w-5 text-muted-foreground" />
        <Input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          className="h-12 border-0 bg-transparent pl-12 pr-24 focus-visible:ring-0 focus-visible:ring-offset-0"
        />
        
        {value && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleClear}
            className="absolute right-16 h-7 w-7 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
        
        <Button
          type="submit"
          size="sm"
          className="absolute right-2 rounded-lg"
        >
          Search
        </Button>
      </div>
    </form>
  );
}
