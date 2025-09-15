import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { scale, verticalScale, moderateScale } from "react-native-size-matters";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/lib/Theme";
import { Id } from "@/convex/_generated/dataModel";
import { Button } from "../ui/Button";

interface SelectCollectionProps {
  selectedCollectionId: Id<"collections"> | null;
  onAddCollection: () => void;
  onRemoveCollection: () => void;
}

export const SelectCollection: React.FC<SelectCollectionProps> = ({
  selectedCollectionId,
  onAddCollection,
  onRemoveCollection,
}) => {
  const theme = useTheme();
  const { t } = useTranslation();

  const styles = StyleSheet.create({
    container: {
      backgroundColor: theme.colors.surface,
      borderRadius: scale(theme.borderRadius.lg),
      padding: scale(16),
      marginTop: verticalScale(16),
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: verticalScale(12),
    },
    headerIcon: {
      marginRight: scale(8),
    },
    headerText: {
      fontSize: moderateScale(16),
      fontWeight: "600",
      color: theme.colors.text,
    },
    selectedContainer: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      backgroundColor: `${theme.colors.primary}15`,
      borderRadius: scale(theme.borderRadius.md),
      paddingVertical: verticalScale(12),
      paddingHorizontal: scale(16),
      borderWidth: 1,
      borderColor: `${theme.colors.primary}30`,
    },
    selectedInfo: {
      flexDirection: "row",
      alignItems: "center",
      flex: 1,
    },
    selectedIcon: {
      marginRight: scale(8),
    },
    selectedText: {
      fontSize: moderateScale(14),
      fontWeight: "500",
      color: theme.colors.primary,
    },
    removeButton: {
      width: scale(24),
      height: scale(24),
      borderRadius: scale(12),
      backgroundColor: theme.colors.error,
      alignItems: "center",
      justifyContent: "center",
    },
    addButton: {
      borderWidth: 2,
      borderColor: theme.colors.primary + "30",
      borderStyle: "dashed",
    }
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <MaterialIcons
          name="bookmark-add"
          size={scale(20)}
          color={theme.colors.primary}
          style={styles.headerIcon}
        />
        <Text style={styles.headerText}>{t('createPost.sections.selectCollection')}</Text>
      </View>

      {selectedCollectionId ? (
        <View style={styles.selectedContainer}>
          <View style={styles.selectedInfo}>
            <Ionicons
              name="checkmark-circle"
              size={scale(20)}
              color={theme.colors.primary}
              style={styles.selectedIcon}
            />
            <Text style={styles.selectedText}>{t('common.selected')}</Text>
          </View>
          <TouchableOpacity
            style={styles.removeButton}
            onPress={onRemoveCollection}
            activeOpacity={0.7}
          >
            <Ionicons
              name="close"
              size={scale(14)}
              color={theme.colors.white}
            />
          </TouchableOpacity>
        </View>
      ) : (
        <Button
          iconName="add"
          iconColor={theme.colors.primary}
          onPress={onAddCollection}
          text={t('createPost.sections.selectCollection')}
          bgColor={theme.colors.primary + "15"}
          style={styles.addButton}
          textStyle={{ color: theme.colors.primary }}
        />
      )}
    </View>
  );
};
