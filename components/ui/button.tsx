import { TextClassContext } from '@/components/ui/text';
import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';
import { Platform, Pressable } from 'react-native';
import { LoadingIndicator } from './loading-indicator';

const buttonVariants = cva(
  cn(
    'group shrink-0 flex-row items-center justify-center gap-2 rounded-full shadow-none',
    Platform.select({
      web: "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive whitespace-nowrap outline-none transition-all focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0",
    })
  ),
  {
    variants: {
      variant: {
        default: cn(
          'shadow-black/5 border border-[#CC5600] bg-[#FE6A00] shadow-sm',
          Platform.select({ web: 'hover:bg-primary/90' })
        ),
        destructive: cn(
          'shadow-black/5 bg-[#B3031E] shadow-sm',
          Platform.select({
            web: 'hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40',
          })
        ),
        outline: cn(
          'shadow-black/5 border border-[#CC5600] bg-white shadow-sm',
          Platform.select({
            web: 'hover:bg-accent dark:hover:bg-input/50',
          })
        ),
        secondary: cn(
          'shadow-black/5 bg-secondary shadow-sm',
          Platform.select({ web: 'hover:bg-secondary/80' })
        ),
        ghost: cn('', Platform.select({ web: 'hover:bg-accent dark:hover:bg-accent/50' })),
        link: '',
      },
      size: {
        default: cn('h-14 px-4 py-2 sm:h-9', Platform.select({ web: 'has-[>svg]:px-3' })),
        sm: cn('h-8 gap-1.5 px-3 sm:h-8', Platform.select({ web: 'has-[>svg]:px-2.5' })),
        lg: cn('h-16 rounded-md px-6 sm:h-10', Platform.select({ web: 'has-[>svg]:px-4' })),
        icon: 'h-12 w-12 sm:h-9 sm:w-9',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

const buttonTextVariants = cva(
  cn(
    'font-cabinet-extrabold text-sm text-foreground',
    Platform.select({ web: 'pointer-events-none transition-colors' })
  ),
  {
    variants: {
      variant: {
        default: 'text-primary-foreground',
        destructive: 'text-white',
        outline: cn(
          'text-[#CC5600]',
          Platform.select({ web: 'group-hover:text-accent-foreground' })
        ),
        secondary: 'text-secondary-foreground',
        ghost: 'group-active:text-accent-foreground',
        link: cn(
          'text-primary group-active:underline',
          Platform.select({ web: 'underline-offset-4 hover:underline group-hover:underline' })
        ),
      },
      size: {
        default: '',
        sm: 'font-cabinet-medium',
        lg: '',
        icon: '',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

type ButtonProps = React.ComponentProps<typeof Pressable> &
  React.RefAttributes<typeof Pressable> &
  VariantProps<typeof buttonVariants> & {
    children?: React.ReactNode;
    icon?: React.ReactNode;
    isLoading?: boolean;
    loadingIndicatorColor?: string;
  };

function Button({
  className,
  variant,
  size,
  children,
  icon,
  isLoading,
  loadingIndicatorColor = '#ffffff',
  ...props
}: ButtonProps) {
  const hasText =
    typeof children === 'string' || (React.isValidElement(children) && children.type === Text);

  return (
    <TextClassContext.Provider value={buttonTextVariants({ variant, size })}>
      <Pressable
        className={cn(props.disabled && 'opacity-50', buttonVariants({ variant, size }), className)}
        role="button"
        {...props}>
        {isLoading ? (
          <LoadingIndicator color={loadingIndicatorColor} size={24} />
        ) : (
          <>
            {icon}
            {typeof children === 'string' ? <Text>{children}</Text> : children}
          </>
        )}
      </Pressable>
    </TextClassContext.Provider>
  );
}

export { Button, buttonTextVariants, buttonVariants };
export type { ButtonProps };
