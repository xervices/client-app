import * as React from 'react';
import { cn } from '@/lib/utils';
import { Platform, TextInput, type TextInputProps, View, Pressable } from 'react-native';
import { Eye, EyeOff } from 'lucide-react-native';
import { Text } from './text';

interface InputProps extends TextInputProps {
  className?: string;
  placeholderClassName?: string;
  /** Whether to show password toggle icon */
  secureTextEntry?: boolean;
  /** Whether the field has a validation error */
  hasError?: boolean;
  icon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Input = React.forwardRef<TextInput, InputProps>(
  (
    { className, placeholderClassName, secureTextEntry, hasError, icon, rightIcon, ...props },
    ref
  ) => {
    const [isPasswordVisible, setIsPasswordVisible] = React.useState(false);

    // Determine if this is meant to be a secure input (password field)
    const isSecureInput = secureTextEntry === true;

    // Determine if this is a phone input
    const isPhoneInput = props.keyboardType === 'phone-pad';

    const togglePasswordVisibility = () => {
      setIsPasswordVisible((prev) => !prev);
    };

    return (
      <View className="relative w-full">
        <TextInput
          ref={ref}
          // logic: if it is a password field, toggle visibility based on state.
          // if it is not a password field, just use the passed prop (usually undefined/false).
          secureTextEntry={isSecureInput ? !isPasswordVisible : secureTextEntry}
          className={cn(
            // Base styles
            'flex h-[56px] w-full min-w-0 flex-row items-center rounded-[4px] border bg-white px-4 py-1 font-cabinet text-base font-thin text-[#1B1B1E]',
            // Error state border color
            hasError ? 'border-error' : 'border-[#DFDFE1]',
            // Add right padding only if we have the eye icon to prevent text overlap
            isSecureInput && 'pr-12',
            isPhoneInput && 'pl-14',
            icon && 'pl-10',
            rightIcon && 'pr-12',
            // Disabled state styling
            props.editable === false &&
              cn(
                'opacity-50',
                Platform.select({
                  web: 'disabled:pointer-events-none disabled:cursor-not-allowed',
                })
              ),
            // Platform specific focus and placeholder styles
            Platform.select({
              web: cn(
                'outline-none transition-[color,box-shadow] selection:bg-primary selection:text-primary-foreground md:text-sm',
                hasError
                  ? 'focus-visible:border-[#DC2626] focus-visible:ring-[3px] focus-visible:ring-[#DC2626]/20'
                  : 'focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50',
                'aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive'
              ),
              native: 'placeholder:text-[#B4B4BC]',
            }),
            className
          )}
          {...props}
        />

        {/* Conditionally render the toggle button */}
        {isSecureInput && (
          <Pressable
            onPress={togglePasswordVisibility}
            className="absolute right-4 top-0 flex h-[56px] items-center justify-center"
            accessibilityLabel={isPasswordVisible ? 'Hide password' : 'Show password'}
            accessibilityRole="button"
            // HitSlop increases the touchable area without changing the layout
            hitSlop={8}>
            {isPasswordVisible ? (
              <Eye size={20} color="#B4B4BC" />
            ) : (
              <EyeOff size={20} color="#B4B4BC" />
            )}
          </Pressable>
        )}

        {isPhoneInput && (
          <Pressable
            onPress={togglePasswordVisibility}
            className="absolute left-4 top-0 flex h-[56px] items-center justify-center"
            accessibilityLabel={'Area Code'}
            accessibilityRole="button"
            // HitSlop increases the touchable area without changing the layout
            hitSlop={8}>
            <Text className="text-primary">+234 </Text>
          </Pressable>
        )}

        {icon && (
          <View className="absolute left-4 top-0 flex h-[56px] items-center justify-center">
            {icon}
          </View>
        )}

        {rightIcon && (
          <View className="absolute right-4 top-0 flex h-[56px] items-center justify-center">
            {rightIcon}
          </View>
        )}
      </View>
    );
  }
);

Input.displayName = 'Input';

export { Input };
