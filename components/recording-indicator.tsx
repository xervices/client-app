import * as React from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import { Text } from './ui/text';

interface RecordingIndicatorProps {
  /** Whether recording is active */
  isRecording: boolean;
  /** Show timer alongside indicator */
  showTimer?: boolean;
  /** Custom size for the indicator */
  size?: number;
  /** Style variant */
  variant?: 'dot' | 'badge' | 'minimal';
}

export function RecordingIndicator({
  isRecording,
  showTimer = true,
  size = 12,
  variant = 'dot',
}: RecordingIndicatorProps) {
  const [recordingTime, setRecordingTime] = React.useState(0);
  const opacity = useSharedValue(1);
  const scale = useSharedValue(1);

  // Timer effect
  React.useEffect(() => {
    let interval: number;

    if (isRecording) {
      setRecordingTime(0);
      interval = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } else {
      setRecordingTime(0);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRecording]);

  // Pulse animation
  React.useEffect(() => {
    if (isRecording) {
      opacity.value = withRepeat(
        withSequence(
          withTiming(0.3, { duration: 800, easing: Easing.inOut(Easing.ease) }),
          withTiming(1, { duration: 800, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        false
      );

      scale.value = withRepeat(
        withSequence(
          withTiming(1.2, { duration: 800, easing: Easing.inOut(Easing.ease) }),
          withTiming(1, { duration: 800, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        false
      );
    } else {
      opacity.value = withTiming(1, { duration: 200 });
      scale.value = withTiming(1, { duration: 200 });
    }
  }, [isRecording]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isRecording) return null;

  if (variant === 'minimal') {
    return (
      <Animated.View style={[styles.minimalContainer, animatedStyle]}>
        <View style={[styles.dot, { width: size, height: size }]} />
      </Animated.View>
    );
  }

  if (variant === 'badge') {
    return (
      <View style={styles.badgeContainer}>
        <Animated.View style={[styles.dot, { width: size, height: size }, animatedStyle]} />
        {showTimer && <Text>{formatTime(recordingTime)}</Text>}
      </View>
    );
  }

  // Default 'dot' variant
  return (
    <View className="flex flex-row items-center gap-2 rounded-sm bg-black-1/60 px-3 py-2">
      <Animated.View style={animatedStyle}>
        <View style={[styles.dot, { width: size, height: size }]} />
      </Animated.View>
      {showTimer && (
        <Text className="font-cabinet-bold text-sm text-white">{formatTime(recordingTime)}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  badgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#DC2626',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  minimalContainer: {
    padding: 8,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 999,
    backgroundColor: '#EF4444',
  },
});
