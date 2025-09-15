import type React from "react";
import { memo, useCallback } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { scale, verticalScale, moderateScale } from "react-native-size-matters";
import { useTheme } from "@/lib/Theme";

interface SegmentedControlProps {
  segments: string[];
  selectedIndex: number;
  onSegmentPress: (index: number) => void;
}

const SegmentedControlComponent: React.FC<SegmentedControlProps> = ({
  segments,
  selectedIndex,
  onSegmentPress,
}) => {
  const theme = useTheme();

  const handleSegmentPress = useCallback(
    (index: number) => {
      onSegmentPress(index);
    },
    [onSegmentPress]
  );

  const styles = StyleSheet.create({
    container: {
      flexDirection: "row",
      backgroundColor: theme.colors.surfaceSecondary,
      borderRadius: scale(theme.borderRadius.lg),
      padding: scale(4),
      marginHorizontal: scale(8),
      marginTop: verticalScale(16),
      marginBottom: verticalScale(12),
      position: "absolute",
      top: verticalScale(80),
      left: 0,
      right: 0,
      zIndex: 999,
    },
    segment: {
      flex: 1,
      paddingVertical: verticalScale(14),
      paddingHorizontal: scale(20),
      borderRadius: scale(theme.borderRadius.md),
      alignItems: "center",
      justifyContent: "center",
      minHeight: verticalScale(44),
    },
    selectedSegment: {
      backgroundColor: theme.colors.primary,
      shadowColor: theme.colors.shadow,
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 3.84,
      elevation: 5,
    },
    segmentText: {
      fontSize: moderateScale(16),
      fontWeight: "600",
      color: theme.colors.textSecondary,
    },
    selectedSegmentText: {
      color: theme.colors.white,
    },
  });

  return (
    <View style={styles.container}>
      {segments.map((segment, index) => (
        <TouchableOpacity
          key={segment}
          style={[
            styles.segment,
            selectedIndex === index && styles.selectedSegment,
          ]}
          onPress={() => handleSegmentPress(index)}
          activeOpacity={0.8}
        >
          <Text
            style={[
              styles.segmentText,
              selectedIndex === index && styles.selectedSegmentText,
            ]}
          >
            {segment}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

export const SegmentedControl = memo(SegmentedControlComponent);
