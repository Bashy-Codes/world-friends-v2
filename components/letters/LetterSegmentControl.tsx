import React from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from "react-native";
import { scale, verticalScale, moderateScale } from "react-native-size-matters";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/lib/Theme";

type LetterSegmentType = "received" | "sent";

interface LetterSegmentControlProps {
  activeSegment: LetterSegmentType;
  onSegmentChange: (segment: LetterSegmentType) => void;
}

export const LetterSegmentControl: React.FC<LetterSegmentControlProps> = ({
  activeSegment,
  onSegmentChange,
}) => {
  const theme = useTheme();

  const styles = StyleSheet.create({
    segmentedContainer: {
      paddingHorizontal: scale(8),
      paddingVertical: verticalScale(16),
    },
    segmentedControl: {
      flexDirection: "row",
      backgroundColor: theme.colors.surface,
      borderRadius: scale(theme.borderRadius.lg),
      padding: scale(4),
      ...Platform.select({
        ios: {
          shadowColor: theme.colors.shadow,
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.1,
          shadowRadius: 2,
        },
        android: {
          elevation: 1,
        },
      }),
    },
    segmentButton: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: verticalScale(12),
      borderRadius: scale(theme.borderRadius.md),
    },
    activeSegmentButton: {
      backgroundColor: theme.colors.primary,
      ...Platform.select({
        ios: {
          shadowColor: theme.colors.shadow,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.15,
          shadowRadius: 3,
        },
        android: {
          elevation: 2,
        },
      }),
    },
    segmentButtonText: {
      fontSize: moderateScale(16),
      fontWeight: "600",
      color: theme.colors.textSecondary,
    },
    activeSegmentButtonText: {
      color: theme.colors.white,
    },
  });

  return (
    <View style={styles.segmentedContainer}>
      <View style={styles.segmentedControl}>
        <TouchableOpacity
          style={[
            styles.segmentButton,
            activeSegment === "received" && styles.activeSegmentButton,
          ]}
          onPress={() => onSegmentChange("received")}
          activeOpacity={0.7}
        >
          <Ionicons
            name="mail"
            size={scale(24)}
            color={
              activeSegment === "received"
                ? theme.colors.white
                : theme.colors.textSecondary
            }
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.segmentButton,
            activeSegment === "sent" && styles.activeSegmentButton,
          ]}
          onPress={() => onSegmentChange("sent")}
          activeOpacity={0.7}
        >
          <Ionicons
            name="send"
            size={scale(24)}
            color={
              activeSegment === "sent"
                ? theme.colors.white
                : theme.colors.textSecondary
            }
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};
