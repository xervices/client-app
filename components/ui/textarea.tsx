import { cn } from '@/lib/utils';
import { Platform, TextInput, type TextInputProps } from 'react-native';
import * as React from 'react';

interface TextareaProps extends TextInputProps {
  className?: string;
  placeholderClassName?: string;
  /** Whether the field has a validation error */
  hasError?: boolean;
}

const Textarea = React.forwardRef<TextInput, TextareaProps>(
  (
    {
      className,
      multiline = true,
      numberOfLines = Platform.select({ web: 2, native: 8 }),
      placeholderClassName,
      placeholderTextColor = '#9F9FA7',
      hasError,
      ...props
    },
    ref
  ) => {
    return (
      <TextInput
        ref={ref}
        style={{
          color: '#1B1B1E',
        }}
        className={cn(
          'flex min-h-20 w-full flex-row rounded-[4px] border bg-transparent px-4 py-2 font-cabinet-medium text-base text-[#1B1B1E] md:text-sm',
          // Error state border color
          hasError ? 'border-error' : 'border-input',
          Platform.select({
            web: cn(
              'field-sizing-content resize-y outline-none transition-[color,box-shadow] placeholder:text-muted-foreground disabled:cursor-not-allowed',
              hasError
                ? 'focus-visible:border-[#DC2626] focus-visible:ring-[3px] focus-visible:ring-[#DC2626]/20'
                : 'focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50',
              'aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive'
            ),
          }),
          props.editable === false && 'opacity-50',
          className
        )}
        placeholderTextColor={placeholderTextColor}
        multiline={multiline}
        numberOfLines={numberOfLines}
        textAlignVertical="top"
        {...props}
      />
    );
  }
);

Textarea.displayName = 'Textarea';

export { Textarea };
