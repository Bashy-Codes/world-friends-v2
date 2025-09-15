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

type TabType = "profile" | "posts" | "collections";

interface SegmentControlProps {
  activeTab: TabType;
  onTabPress: (tab: TabType) => void;
}

export const SegmentControl: React.FC<SegmentControlProps> = ({
  activeTab,
  onTabPress,
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
      fontSize: moderateScale(14),
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
            activeTab === "profile" && styles.activeSegmentButton,
          ]}
          onPress={() => onTabPress("profile")}
          activeOpacity={0.7}
        >
          <Ionicons
            name="person"
            size={scale(18)}
            color={
              activeTab === "profile"
                ? theme.colors.white
                : theme.colors.textSecondary
            }
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.segmentButton,
            activeTab === "posts" && styles.activeSegmentButton,
          ]}
          onPress={() => onTabPress("posts")}
          activeOpacity={0.7}
        >
          <Ionicons
            name="grid"
            size={scale(18)}
            color={
              activeTab === "posts"
                ? theme.colors.white
                : theme.colors.textSecondary
            }
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.segmentButton,
            activeTab === "collections" && styles.activeSegmentButton,
          ]}
          onPress={() => onTabPress("collections")}
          activeOpacity={0.7}
        >
          <Ionicons
            name="albums"
            size={scale(18)}
            color={
              activeTab === "collections"
                ? theme.colors.white
                : theme.colors.textSecondary
            }
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};
