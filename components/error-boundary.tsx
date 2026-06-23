import React, { ReactNode } from 'react';
import { View } from 'react-native';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  error: Error | null;
  hasError: boolean;
  errorCount: number;
}

/**
 * Error boundary component for catching and displaying errors gracefully
 * Prevents crash screens and shows user-friendly error UI
 */
export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      error: null,
      hasError: false,
      errorCount: 0,
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      error,
      hasError: true,
      errorCount: 0,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error details for debugging
    console.error('ErrorBoundary caught an error:', error);
    console.error('Component stack:', errorInfo.componentStack);

    // Update error count (useful for detecting error loops)
    this.setState((prev) => ({
      errorCount: prev.errorCount + 1,
    }));

    // If error count exceeds threshold, don't keep retrying
    if (this.state.errorCount >= 3) {
      console.error('Error boundary exceeded retry limit');
    }
  }

  handleReset = () => {
    this.setState({
      error: null,
      hasError: false,
      errorCount: 0,
    });
  };

  render() {
    if (this.state.hasError && this.state.error) {
      // If custom fallback provided, use it
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <View className="flex-1 items-center justify-center gap-6 bg-white px-6 py-8">
          <View className="items-center gap-3">
            <Text className="text-center font-cabinet-bold text-lg text-red-600">
              Something went wrong
            </Text>
            <Text className="text-center text-sm text-[#737381]">
              {this.state.error.message || 'An unexpected error occurred'}
            </Text>
          </View>

          {process.env.NODE_ENV === 'development' && (
            <View className="w-full bg-gray-100 p-4">
              <Text className="text-xs text-gray-600">{this.state.error.stack}</Text>
            </View>
          )}

          <View className="w-full gap-3 pt-4">
            <Button onPress={this.handleReset}>Try Again</Button>
          </View>

          {this.state.errorCount >= 3 && (
            <Text className="text-center text-xs text-red-500">
              Multiple errors detected. Please restart the app.
            </Text>
          )}
        </View>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
