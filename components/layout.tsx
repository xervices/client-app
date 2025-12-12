import { View, ViewStyle, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import React from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface LayoutProps {
  children: React.ReactNode;
  scrollable?: boolean;
  bottomPadding?: number;
  topPadding?: number;
  horizontalPadding?: boolean;
  paddingHorizontal?: number;
  keyboardAvoiding?: boolean;
  useBackground?: boolean;
  stickyHeader?: React.ReactNode; // NEW
}

export function Layout({
  children,
  bottomPadding = 8,
  horizontalPadding = true,
  keyboardAvoiding = true,
  paddingHorizontal = 24,
  scrollable = true,
  topPadding = 8,
  useBackground = false,
  stickyHeader, // NEW
}: LayoutProps) {
  const insets = useSafeAreaInsets();

  const safePaddingTop = insets.top + topPadding;
  const safePaddingBottom = insets.bottom + bottomPadding;

  const containerStyles: ViewStyle = {
    flex: 1,
    backgroundColor: '#FFFFFF',
  };

  const stickyHeaderStyles: ViewStyle = {
    paddingTop: safePaddingTop,
    ...(horizontalPadding && { paddingHorizontal }),
    backgroundColor: '#FFFFFF',
  };

  const contentContainerStyles: ViewStyle = {
    backgroundColor: '#FFFFFF',
    flexGrow: 1,
    paddingTop: stickyHeader ? 0 : safePaddingTop,
    paddingBottom: safePaddingBottom,
    ...(horizontalPadding && { paddingHorizontal }),
  };

  const renderContent = () => {
    if (scrollable) {
      return (
        <ScrollView
          contentContainerStyle={contentContainerStyles}
          keyboardShouldPersistTaps="handled"
          nestedScrollEnabled={true}
          showsVerticalScrollIndicator={false}>
          {children}
        </ScrollView>
      );
    }
    return <View style={[contentContainerStyles, { flex: 1 }]}>{children}</View>;
  };

  const content = (
    <>
      {/* Sticky header section - NEW */}
      {stickyHeader && <View style={stickyHeaderStyles}>{stickyHeader}</View>}
      {renderContent()}
    </>
  );

  return (
    <>
      {keyboardAvoiding ? (
        <KeyboardAvoidingView
          style={containerStyles}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}>
          {content}
        </KeyboardAvoidingView>
      ) : (
        <View style={containerStyles}>{content}</View>
      )}
    </>
  );
}
