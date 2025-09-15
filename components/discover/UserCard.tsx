import type React from "react";
import { memo, useCallback } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { scale, verticalScale, moderateScale } from "react-native-size-matters";
import { useTheme } from "@/lib/Theme";
import { getCountryByCode, getLanguageByCode } from "@/constants/geographics";
import type { UserCardData } from "@/types/discover";
import { useTranslation } from "react-i18next";
import { Id } from "@/convex/_generated/dataModel";
import AgeGenderChip from "../ui/AgeGenderChip";
import ProfilePhoto from "../ui/ProfilePhoto";

interface UserCardProps {
  user: UserCardData;
  onViewProfile: (userId: Id<"users">) => void;
}

const UserCardComponent: React.FC<UserCardProps> = ({
  user,
  onViewProfile,
}) => {
  const theme = useTheme();
  const { t } = useTranslation();

  const country = getCountryByCode(user.country);

  const spokenLanguages = user.spokenLanguages
    .slice(0, 2)
    .map((code: string) => getLanguageByCode(code)?.name)
    .filter(Boolean)
    .join(", ");

  const learningLanguages = user.learningLanguages
    .slice(0, 2)
    .map((code: string) => getLanguageByCode(code)?.name)
    .filter(Boolean)
    .join(", ");

  const handleViewProfile = useCallback(() => {
    onViewProfile(user.userId);
  }, [user.userId, onViewProfile]);

  const styles = StyleSheet.create({
    card: {
      backgroundColor: theme.colors.surface,
      borderRadius: scale(theme.borderRadius.lg),
      padding: scale(20),
      marginHorizontal: scale(16),
      marginVertical: verticalScale(8),
      alignItems: "center",
      shadowColor: theme.colors.shadow,
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 3.84,
      elevation: 5,
    },
    profileImageContainer: {
      width: scale(100),
      height: scale(100),
      borderRadius: scale(theme.borderRadius.full),
      borderWidth: scale(3),
      borderColor: theme.colors.primary,
      justifyContent: "center",
      alignItems: "center",
      marginBottom: verticalScale(16),
      overflow: "hidden",
    },
    nameContainer: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      marginBottom: verticalScale(12),
    },
    name: {
      fontSize: moderateScale(24),
      fontWeight: "700",
      color: theme.colors.text,
    },
    verifiedIcon: {
      marginLeft: scale(6),
    },
    supporterIcon: {
      marginLeft: scale(4),
    },
    infoRow: {
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      marginBottom: verticalScale(12),
    },
    detailRow: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: theme.colors.background,
      borderRadius: scale(theme.borderRadius.md),
      paddingVertical: verticalScale(12),
      paddingHorizontal: scale(16),
      marginBottom: verticalScale(10),
      width: "100%",
    },
    detailIcon: {
      marginRight: scale(12),
    },
    detailLabel: {
      fontSize: moderateScale(14),
      color: theme.colors.textSecondary,
      fontWeight: "500",
      marginRight: scale(8),
    },
    detailValue: {
      fontSize: moderateScale(14),
      color: theme.colors.text,
      fontWeight: "600",
      flexShrink: 1,
    },
    flagEmoji: {
      fontSize: moderateScale(16),
      marginRight: scale(8),
    },
  });

  return (
    <TouchableOpacity onPress={handleViewProfile} activeOpacity={0.8} style={styles.card}>
     <ProfilePhoto
      profilePicture={user.profilePicture}
      size="large"
      />

      <View style={styles.nameContainer}>
        <Text style={styles.name}>{user.name}</Text>
        {user.isAdmin && (
          <Ionicons
            name="shield-checkmark"
            size={scale(16)}
            color={theme.colors.primary}
            style={styles.verifiedIcon}
          />
        )}
        {user.isSupporter && (
          <Ionicons
            name="heart"
            size={scale(16)}
            color={theme.colors.secondary}
            style={styles.supporterIcon}
          />
        )}
      </View>

      <View style={styles.infoRow}>
        <AgeGenderChip
        size="large"
        gender={user.gender}
        age={user.age}
        />
      </View>

      <View style={styles.detailRow}>
        <Ionicons
          name="location-outline"
          size={scale(20)}
          color={theme.colors.error}
          style={styles.detailIcon}
        />
        <Text style={styles.detailLabel}>{t("userCard.country")}</Text>
        <Text style={styles.flagEmoji}>{country?.flag}</Text>
        <Text style={styles.detailValue}>{country?.name || "Unknown"}</Text>
      </View>

      <View style={styles.detailRow}>
        <Ionicons
          name="language-outline"
          size={scale(20)}
          color={theme.colors.success}
          style={styles.detailIcon}
        />
        <Text style={styles.detailLabel}>{t("userCard.speaks")}</Text>
        <Text style={styles.detailValue}>{spokenLanguages || "🌍"}</Text>
      </View>

      <View style={styles.detailRow}>
        <Ionicons
          name="earth-outline"
          size={scale(20)}
          color={theme.colors.info}
          style={styles.detailIcon}
        />
        <Text style={styles.detailLabel}>{t("userCard.learning")}</Text>
        <Text style={styles.detailValue}>{learningLanguages || "🌍"}</Text>
      </View>
    </TouchableOpacity>
  );
};

export const UserCard = memo(UserCardComponent);
