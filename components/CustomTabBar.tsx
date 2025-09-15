import React, { useMemo } from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { scale, verticalScale } from 'react-native-size-matters';
import { useTheme } from '@/lib/Theme';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';

const TAB_ICONS = {
  index: { active: 'home', inactive: 'home-outline' },
  discover: { active: 'earth', inactive: 'earth-outline' },
  friends: { active: 'people', inactive: 'people-outline' },
  conversations: { active: 'chatbox-ellipses', inactive: 'chatbox-ellipses-outline' },
  profile: { active: 'person', inactive: 'person-outline' },
} as const;

export const CustomTabBar: React.FC<BottomTabBarProps> = ({
  state,
  descriptors,
  navigation,
}) => {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  const styles = useMemo(() => StyleSheet.create({
    container: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: theme.colors.tabBar,
      borderTopLeftRadius: scale(theme.borderRadius.xl),
      borderTopRightRadius: scale(theme.borderRadius.xl),
      paddingBottom: Math.max(insets.bottom, verticalScale(8)),
      paddingTop: verticalScale(12),
      paddingHorizontal: scale(16),
      shadowColor: theme.colors.black,
      shadowOffset: {
        width: 0,
        height: -2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 3.84,
      elevation: 5,
      zIndex: 1000,
    },
    tabContainer: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      alignItems: 'center',
    },
    tabButton: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: verticalScale(8),
      borderRadius: scale(theme.borderRadius.md),
    },
    activeTab: {
      backgroundColor: `${theme.colors.primary}15`,
    },
  }), [theme, insets]);

  return (
    <View style={styles.container}>
      <View style={styles.tabContainer}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          const onLongPress = () => {
            navigation.emit({
              type: 'tabLongPress',
              target: route.key,
            });
          };

          const iconName = TAB_ICONS[route.name as keyof typeof TAB_ICONS];
          const iconToShow = isFocused ? iconName?.active : iconName?.inactive;

          return (
            <TouchableOpacity
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              testID={options.tabBarButtonTestID}
              onPress={onPress}
              onLongPress={onLongPress}
              style={[styles.tabButton, isFocused && styles.activeTab]}
              activeOpacity={0.7}
            >
              <Ionicons
                name={iconToShow as any}
                size={scale(24)}
                color={
                  isFocused ? theme.colors.tabBarActive : theme.colors.textMuted
                }
              />
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};
