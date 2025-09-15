import React, { ReactNode } from 'react';
import {
  View,
  Platform,
  StyleSheet,
  ViewStyle,
  Animated,
} from 'react-native';
import { useSafeKeyboardHeight } from '@/hooks/useKeyboardHandler';

interface CustomKeyboardAvoidingViewProps {
  children: ReactNode;
  style?: ViewStyle;
  enabled?: boolean;
  behavior?: 'padding' | 'height' | 'position';
  keyboardVerticalOffset?: number;
}

/**
 * Custom KeyboardAvoidingView that fixes the bottom gap issue
 * This component uses native React Native APIs without third-party dependencies
 */
export const CustomKeyboardAvoidingView: React.FC<CustomKeyboardAvoidingViewProps> = ({
  children,
  style,
  enabled = true,
  behavior = Platform.OS === 'ios' ? 'padding' : 'height',
  keyboardVerticalOffset = 0,
}) => {
  const keyboardHeight = useSafeKeyboardHeight();

  if (!enabled) {
    return <View style={style}>{children}</View>;
  }

  const getContainerStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      flex: 1,
      ...StyleSheet.flatten(style),
    };

    if (keyboardHeight === 0) {
      return baseStyle;
    }

    const adjustedKeyboardHeight = Math.max(0, keyboardHeight - keyboardVerticalOffset);

    switch (behavior) {
      case 'padding':
        return {
          ...baseStyle,
          paddingBottom: adjustedKeyboardHeight,
        };
      case 'height':
        return {
          ...baseStyle,
          height: `calc(100% - ${adjustedKeyboardHeight}px)` as any,
        };
      case 'position':
        return {
          ...baseStyle,
          bottom: adjustedKeyboardHeight,
        };
      default:
        return baseStyle;
    }
  };

  return <View style={getContainerStyle()}>{children}</View>;
};

/**
 * Alternative implementation using Animated.View for smoother transitions
 */
export const AnimatedKeyboardAvoidingView: React.FC<CustomKeyboardAvoidingViewProps> = ({
  children,
  style,
  enabled = true,
  behavior = Platform.OS === 'ios' ? 'padding' : 'height',
  keyboardVerticalOffset = 0,
}) => {
  const keyboardHeight = useSafeKeyboardHeight();
  const animatedValue = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    const adjustedHeight = Math.max(0, keyboardHeight - keyboardVerticalOffset);
    
    Animated.timing(animatedValue, {
      toValue: adjustedHeight,
      duration: Platform.OS === 'ios' ? 250 : 200,
      useNativeDriver: false,
    }).start();
  }, [keyboardHeight, keyboardVerticalOffset, animatedValue]);

  if (!enabled) {
    return <View style={style}>{children}</View>;
  }

  const getAnimatedStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      flex: 1,
      ...StyleSheet.flatten(style),
    };

    switch (behavior) {
      case 'padding':
        return {
          ...baseStyle,
          paddingBottom: animatedValue,
        };
      case 'height':
        return {
          ...baseStyle,
          marginBottom: animatedValue,
        };
      case 'position':
        return {
          ...baseStyle,
          transform: [{ translateY: Animated.multiply(animatedValue, -1) }],
        };
      default:
        return baseStyle;
    }
  };

  return <Animated.View style={getAnimatedStyle()}>{children}</Animated.View>;
};

/**
 * Simple wrapper that applies the most reliable solution for each platform
 */
export const ReliableKeyboardAvoidingView: React.FC<CustomKeyboardAvoidingViewProps> = ({
  children,
  style,
  enabled = true,
  keyboardVerticalOffset = 0,
}) => {
  const keyboardHeight = useSafeKeyboardHeight();

  if (!enabled) {
    return <View style={style}>{children}</View>;
  }

  const containerStyle: ViewStyle = {
    flex: 1,
    ...StyleSheet.flatten(style),
    ...(Platform.OS === 'ios' && keyboardHeight > 0
      ? { paddingBottom: Math.max(0, keyboardHeight - keyboardVerticalOffset) }
      : {}),
    ...(Platform.OS === 'android' && keyboardHeight > 0
      ? { marginBottom: Math.max(0, keyboardHeight - keyboardVerticalOffset) }
      : {}),
  };

  return <View style={containerStyle}>{children}</View>;
};
