import { View, Pressable, ScrollView, TouchableWithoutFeedback } from 'react-native';
import { Input } from '../ui/input';
import { Search, X, AlertCircle } from 'lucide-react-native';
import { Button } from '../ui/button';
import { Text } from '../ui/text';
import { useState, useMemo, useEffect, useRef } from 'react';
import { router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/api';
import { Image } from 'expo-image';
import { LoadingIndicator } from '../ui/loading-indicator';

// Type definition for category
type Category = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  iconUrl?: string | null;
  isActive: boolean;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
};

const MIN_SEARCH_LENGTH = 2;
const MAX_RESULTS = 8;

interface SearchInputProps {
  defaultCategoryId?: string;
}

export function SearchInput({ defaultCategoryId }: SearchInputProps = {}) {
  const { data, isLoading, isError, error } = useQuery(api.getAllCategories());
  const [showBanner, setShowBanner] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  const inputRef = useRef<any>(null);

  // Update selected category when defaultCategoryId changes
  useEffect(() => {
    if (!data) return;

    if (defaultCategoryId) {
      const defaultCategory = data.find((cat) => cat.id === defaultCategoryId);

      if (defaultCategory) {
        setSelectedCategory(defaultCategory);
        setSearchValue(defaultCategory.name);
      } else {
        console.warn(`Default category with id "${defaultCategoryId}" not found`);
      }
    } else {
      // Clear selection if defaultCategoryId is removed
      setSelectedCategory(null);
      setSearchValue('');
    }
  }, [defaultCategoryId, data]);

  // Filter categories based on search value
  const filteredCategories = useMemo(() => {
    if (!data) return [];
    if (!searchValue.trim()) return data.filter((cat) => cat.isActive).slice(0, MAX_RESULTS);

    const query = searchValue.toLowerCase().trim();

    return data
      .filter((category) => {
        if (!category.isActive) return false;

        const nameMatch = category.name.toLowerCase().includes(query);
        const descriptionMatch = category.description?.toLowerCase().includes(query);
        const slugMatch = category.slug.toLowerCase().includes(query);

        return nameMatch || descriptionMatch || slugMatch;
      })
      .sort((a, b) => {
        // Prioritize exact name matches
        const aNameMatch = a.name.toLowerCase().startsWith(query);
        const bNameMatch = b.name.toLowerCase().startsWith(query);

        if (aNameMatch && !bNameMatch) return -1;
        if (!aNameMatch && bNameMatch) return 1;

        // Then by display order
        return a.displayOrder - b.displayOrder;
      })
      .slice(0, MAX_RESULTS);
  }, [data, searchValue]);

  // Close banner when clicking outside
  useEffect(() => {
    if (!showBanner) {
      setSelectedCategory(null);
    }
  }, [showBanner]);

  const handleCategorySelect = (category: Category) => {
    setSelectedCategory(category);
    setSearchValue(category.name);
    setShowBanner(false);

    // Navigate with both name and id
    router.navigate({
      pathname: '/book',
      params: {
        search: category.name,
        id: category.id,
      },
    });
  };

  const handleManualSearch = () => {
    // Only allow search if a category has been selected
    if (!selectedCategory) {
      return;
    }

    setShowBanner(false);

    router.navigate({
      pathname: '/book',
      params: {
        search: selectedCategory.name,
        id: selectedCategory.id,
      },
    });
  };

  const handleClearSearch = () => {
    setSearchValue('');
    setSelectedCategory(null);
    inputRef.current?.focus();
  };

  const handleCloseBanner = () => {
    setShowBanner(false);
    inputRef.current?.blur();
  };

  // Determine what to show in the banner
  const getBannerContent = () => {
    // Loading state
    if (isLoading) {
      return (
        <View className="flex items-center justify-center py-8">
          <LoadingIndicator />
          <Text className="mt-2 text-sm text-gray-500">Loading categories...</Text>
        </View>
      );
    }

    // Error state
    if (isError) {
      return (
        <View className="flex items-center justify-center py-8">
          <AlertCircle size={32} color="#EF4444" />
          <Text className="mt-2 text-center text-sm text-red-500">
            {error?.message || 'Failed to load categories'}
          </Text>
        </View>
      );
    }

    // No results state
    if (searchValue.trim().length >= MIN_SEARCH_LENGTH && filteredCategories.length === 0) {
      return (
        <View className="flex gap-3">
          <View className="flex items-center justify-center py-4">
            <Search size={32} color="#B4B4BC" />
            <Text className="mt-2 text-center text-sm text-gray-500">
              No services found for "{searchValue}"
            </Text>
            <Text className="mt-1 text-center text-xs text-gray-400">
              Try a different search term
            </Text>
          </View>
        </View>
      );
    }

    // Results state
    if (filteredCategories.length > 0) {
      return (
        <View className="flex gap-3">
          <Text className="font-cabinet-medium text-xs uppercase text-gray-500">
            {searchValue.trim() ? 'Matching Services' : 'Popular Services'}
          </Text>

          <ScrollView
            className="max-h-[300px]"
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled">
            {filteredCategories.map((category) => (
              <Pressable
                key={category.id}
                onPress={() => handleCategorySelect(category)}
                className="flex flex-row items-center gap-3 rounded-lg p-3 active:bg-gray-50"
                android_ripple={{ color: '#F5F5F5' }}>
                {category.iconUrl && (
                  <View className="h-10 w-10 overflow-hidden rounded-lg bg-gray-100">
                    <Image
                      source={{ uri: category.iconUrl }}
                      style={{ width: 40, height: 40 }}
                      contentFit="cover"
                    />
                  </View>
                )}

                <View className="flex-1">
                  <Text className="font-cabinet-medium text-[#1B1B1E]">{category.name}</Text>
                  {category.description && (
                    <Text className="text-xs text-gray-500" numberOfLines={1} ellipsizeMode="tail">
                      {category.description}
                    </Text>
                  )}
                </View>
              </Pressable>
            ))}
          </ScrollView>
        </View>
      );
    }

    // Default state - show helper text
    return (
      <View className="flex gap-3">
        <View className="flex flex-row justify-between gap-1">
          <Text className="font-cabinet-bold text-[#1B1B1E]">
            We'll match you with a professional.
          </Text>
        </View>
        <Text className="text-sm text-[#737381]">
          We're here to help you get the chore off your list—affordably and stress-free.
        </Text>
        <Text className="text-xs text-gray-400">Start typing to search for a service</Text>
      </View>
    );
  };

  return (
    <View className="relative">
      <Input
        ref={inputRef}
        placeholder="Book a service"
        className="rounded-full bg-white"
        icon={<Search size={20} color="#B4B4BC" />}
        value={searchValue}
        onFocus={() => setShowBanner(true)}
        onChangeText={(text) => {
          setSearchValue(text);
          setSelectedCategory(null);
          if (!showBanner) setShowBanner(true);
        }}
        onSubmitEditing={handleManualSearch}
        returnKeyType="search"
        autoCapitalize="none"
        autoCorrect={false}
        editable={!isLoading}
        rightIcon={
          searchValue ? (
            <Pressable onPress={handleClearSearch} className="rounded-full p-1">
              <X size={16} color="#B4B4BC" />
            </Pressable>
          ) : undefined
        }
      />

      {showBanner && (
        <TouchableWithoutFeedback>
          <View
            className="absolute left-0 right-0 top-[70px] z-10 flex w-full gap-2 rounded-[8px] bg-white p-4"
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 8,
              elevation: 4,
            }}>
            {/* Custom Triangle Pointer */}
            <View
              style={{
                position: 'absolute',
                top: -8,
                left: 24,
                width: 0,
                height: 0,
                backgroundColor: 'transparent',
                borderStyle: 'solid',
                borderLeftWidth: 8,
                borderRightWidth: 8,
                borderBottomWidth: 8,
                borderLeftColor: 'transparent',
                borderRightColor: 'transparent',
                borderBottomColor: '#FFFFFF',
              }}
            />

            {/* Close button */}
            <View className="absolute right-4 top-4 z-10">
              <Pressable
                onPress={handleCloseBanner}
                className="flex h-6 w-6 items-center justify-center rounded-full bg-[#FFF4EA]">
                <X color={'#1B1B1E'} size={16} />
              </Pressable>
            </View>

            {/* Dynamic content */}
            {getBannerContent()}
          </View>
        </TouchableWithoutFeedback>
      )}
    </View>
  );
}
