import * as React from 'react';
import { cn } from '@/lib/utils';
import {
  Platform,
  TextInput,
  type TextInputProps,
  View,
  Pressable,
  Modal,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Eye, EyeOff, ChevronDown } from 'lucide-react-native';
import { Text } from './text';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './dropdown-menu';

interface InputProps extends TextInputProps {
  className?: string;
  placeholderClassName?: string;
  /** Whether to show password toggle icon */
  secureTextEntry?: boolean;
  /** Whether the field has a validation error */
  hasError?: boolean;
  icon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  /** Callback when country code is selected */
  onCountryCodeChange?: (countryCode: string, dialCode: string) => void;
}

interface Country {
  code: string;
  name: string;
  dialCode: string;
  flag: string;
}

const WEST_AFRICAN_COUNTRIES: Country[] = [
  { code: 'NG', name: 'Nigeria', dialCode: '+234', flag: '🇳🇬' },
  { code: 'GH', name: 'Ghana', dialCode: '+233', flag: '🇬🇭' },
  { code: 'SN', name: 'Senegal', dialCode: '+221', flag: '🇸🇳' },
  { code: 'CI', name: "Côte d'Ivoire", dialCode: '+225', flag: '🇨🇮' },
  { code: 'BJ', name: 'Benin', dialCode: '+229', flag: '🇧🇯' },
  { code: 'TG', name: 'Togo', dialCode: '+228', flag: '🇹🇬' },
  { code: 'BF', name: 'Burkina Faso', dialCode: '+226', flag: '🇧🇫' },
  { code: 'ML', name: 'Mali', dialCode: '+223', flag: '🇲🇱' },
  { code: 'NE', name: 'Niger', dialCode: '+227', flag: '🇳🇪' },
  { code: 'GW', name: 'Guinea-Bissau', dialCode: '+245', flag: '🇬🇼' },
  { code: 'GN', name: 'Guinea', dialCode: '+224', flag: '🇬🇳' },
  { code: 'SL', name: 'Sierra Leone', dialCode: '+232', flag: '🇸🇱' },
  { code: 'LR', name: 'Liberia', dialCode: '+231', flag: '🇱🇷' },
  { code: 'MR', name: 'Mauritania', dialCode: '+222', flag: '🇲🇷' },
  { code: 'GM', name: 'Gambia', dialCode: '+220', flag: '🇬🇲' },
  { code: 'CV', name: 'Cape Verde', dialCode: '+238', flag: '🇨🇻' },
];

const Input = React.forwardRef<TextInput, InputProps>(
  (
    {
      className,
      placeholderClassName,
      secureTextEntry,
      hasError,
      icon,
      rightIcon,
      onCountryCodeChange,
      ...props
    },
    ref
  ) => {
    const [isPasswordVisible, setIsPasswordVisible] = React.useState(false);
    const [isFocused, setIsFocused] = React.useState(false);
    const [selectedCountry, setSelectedCountry] = React.useState<Country>(
      WEST_AFRICAN_COUNTRIES[0]
    );

    const insets = useSafeAreaInsets();
    const contentInsets = {
      top: insets.top,
      bottom: insets.bottom,
      left: 4,
      right: 4,
    };

    // Determine if this is meant to be a secure input (password field)
    const isSecureInput = secureTextEntry === true;

    // Determine if this is a phone input
    const isPhoneInput = props.keyboardType === 'phone-pad';

    const togglePasswordVisibility = () => {
      setIsPasswordVisible((prev) => !prev);
    };

    const handleCountrySelect = (country: Country) => {
      setSelectedCountry(country);
      onCountryCodeChange?.(country.code, country.dialCode);
    };

    return (
      <View className="relative w-full">
        <TextInput
          ref={ref}
          secureTextEntry={isSecureInput ? !isPasswordVisible : secureTextEntry}
          placeholderTextColor="#9F9FA7"
          style={{
            color: '#1B1B1E',
          }}
          className={cn(
            // Base styles
            'flex h-[56px] w-full min-w-0 flex-row items-center rounded-[4px] border bg-white px-4 py-1 font-cabinet-medium text-base text-[#1B1B1E]',
            // Error state border color
            hasError ? 'border-error' : isFocused ? 'border-[#FE6A00]' : 'border-[#DFDFE1]',
            // Add right padding only if we have the eye icon to prevent text overlap
            isSecureInput && 'pr-12',
            isPhoneInput && 'pl-[110px]',
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
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...props}
        />

        {/* Password toggle button */}
        {isSecureInput && (
          <Pressable
            onPress={togglePasswordVisibility}
            className="absolute right-4 top-0 flex h-[56px] items-center justify-center"
            accessibilityLabel={isPasswordVisible ? 'Hide password' : 'Show password'}
            accessibilityRole="button"
            hitSlop={8}>
            {isPasswordVisible ? (
              <Eye size={20} color="#B4B4BC" />
            ) : (
              <EyeOff size={20} color="#B4B4BC" />
            )}
          </Pressable>
        )}

        {/* Country code selector for phone input */}
        {isPhoneInput && (
          <View className="absolute left-4 top-0 flex h-[56px] items-center justify-center">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Pressable
                  className="flex flex-row items-center justify-center gap-2"
                  accessibilityLabel="Select country code"
                  accessibilityRole="button"
                  hitSlop={8}>
                  <View className="flex h-6 w-10 flex-row items-center justify-center rounded-sm bg-[#F4F4F5]">
                    <Text className="text-sm">{selectedCountry.flag}</Text>

                    <ChevronDown size={16} color="#B4B4BC" />
                  </View>
                  <Text className="font-cabinet-medium text-[#FE6A00]">
                    {selectedCountry.dialCode}
                  </Text>
                </Pressable>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-72 bg-white" align="start">
                {WEST_AFRICAN_COUNTRIES.map((country) => (
                  <DropdownMenuItem
                    key={country.code}
                    onPress={() => handleCountrySelect(country)}
                    className={cn(
                      'flex-row items-center gap-3',
                      selectedCountry.code === country.code && 'bg-[#FFF5ED]'
                    )}>
                    <Text className="text-[20px]">{country.flag}</Text>
                    <View className="flex-1">
                      <Text className="font-cabinet-medium text-[14px] text-[#1B1B1E]">
                        {country.name}
                      </Text>
                    </View>
                    <Text className="font-cabinet-medium text-[12px] text-[#737381]">
                      {country.dialCode}
                    </Text>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </View>
        )}

        {/* Left icon */}
        {icon && (
          <View className="absolute left-4 top-0 flex h-[56px] items-center justify-center">
            {icon}
          </View>
        )}

        {/* Right icon */}
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
