import type { ImgHTMLAttributes } from 'react';
import { cn } from './ui/utils';
import logoDark from '../../assets/brand/logo-mv-dark.png';
import logoClear from '../../assets/brand/logo-mv-clear.png';

interface BrandLogoProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src'> {
  className?: string;
}

export function BrandLogo({ className, alt = 'MovieVault', ...props }: BrandLogoProps) {
  return (
    <>
      <img
        src={logoDark}
        alt={alt}
        className={cn('block dark:hidden', className)}
        {...props}
      />
      <img
        src={logoClear}
        alt={alt}
        className={cn('hidden dark:block', className)}
        {...props}
      />
    </>
  );
}

export default BrandLogo;
