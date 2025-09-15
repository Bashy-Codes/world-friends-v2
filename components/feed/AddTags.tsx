import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { scale, verticalScale, moderateScale } from "react-native-size-matters";
import { useTheme } from "@/lib/Theme";
import { getTagById } from "@/constants/geographics";
import { useTranslation } from "react-i18next";

interface AddTagsProps {
  selectedTags: string[];
  onPress: () => void;
  onRemoveTag: (tagId: string) => void;
}

export const AddTags: React.FC<AddTagsProps> = ({ selectedTags, onPress, onRemoveTag }) => {
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
      justifyContent: "space-between",
      marginBottom: verticalScale(12),
    },
    headerLeft: {
      flexDirection: "row",
      alignItems: "center",
    },
    icon: {
      marginRight: scale(8),
    },
    title: {
      fontSize: moderateScale(16),
      fontWeight: "600",
      color: theme.colors.text,
    },
    addButton: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: theme.colors.primary,
      paddingHorizontal: scale(12),
      paddingVertical: verticalScale(6),
      borderRadius: scale(theme.borderRadius.md),
    },
    addButtonText: {
      fontSize: moderateScale(12),
      fontWeight: "500",
      color: theme.colors.white,
      marginLeft: scale(4),
    },
    selectedTagsContainer: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: scale(8),
    },
    tagChip: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: theme.colors.primary + "20",
      paddingLeft: scale(12),
      paddingRight: scale(8),
      paddingVertical: verticalScale(6),
      borderRadius: scale(theme.borderRadius.full),
      borderWidth: 1,
      borderColor: theme.colors.primary + "40",
      position: "relative",
    },
    tagEmoji: {
      fontSize: moderateScale(14),
      marginRight: scale(4),
    },
    tagText: {
      fontSize: moderateScale(12),
      fontWeight: "500",
      color: theme.colors.primary,
      marginRight: scale(4),
    },
    closeButton: {
      padding: scale(2),
      borderRadius: scale(8),
      backgroundColor: theme.colors.primary + "30",
    },
    emptyState: {
      alignItems: "center",
      paddingVertical: verticalScale(20),
    },
  });

  const renderSelectedTags = () => {
    if (selectedTags.length === 0) {
      return (
        <View style={styles.emptyState}>
          <Ionicons
            name="pricetag-outline"
            size={scale(36)}
            color={theme.colors.textMuted}
          />
        </View>
      );
    }

    return (
      <View style={styles.selectedTagsContainer}>
        {selectedTags.map((tagId) => {
          const tag = getTagById(tagId);
          if (!tag) return null;

          return (
            <View key={tagId} style={styles.tagChip}>
              <Text style={styles.tagEmoji}>{tag.emoji}</Text>
              <Text style={styles.tagText}>{tag.name}</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => onRemoveTag(tagId)}
                activeOpacity={0.7}
              >
                <Ionicons
                  name="close"
                  size={scale(10)}
                  color={theme.colors.error}
                />
              </TouchableOpacity>
            </View>
          );
        })}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Ionicons
            name="pricetag"
            size={scale(20)}
            color={theme.colors.primary}
            style={styles.icon}
          />
          <Text style={styles.title}>{t("createPost.sections.addTags")}</Text>
        </View>
        <TouchableOpacity
          style={styles.addButton}
          onPress={onPress}
          activeOpacity={0.7}
        >
          <Ionicons
            name="add"
            size={scale(16)}
            color={theme.colors.white}
          />
        </TouchableOpacity>
      </View>
      
      {renderSelectedTags()}
    </View>
  );
};
