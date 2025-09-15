import React, { memo } from "react";
import { View, Text, StyleSheet } from "react-native";
import { scale, verticalScale, moderateScale } from "react-native-size-matters";
import { useTheme } from "@/lib/Theme";
import { getCountryByCode } from "@/constants/geographics";
import AgeGenderChip from "../ui/AgeGenderChip";
import ProfilePhoto from "../ui/ProfilePhoto";
import NameContainer from "../ui/NameContainer";

interface UserInfoProps {
  profilePicture: string;
  name: string;
  username: string;
  gender: "male" | "female" | "other";
  age: number;
  countryCode: string;
  isAdmin?: boolean;
  isSupporter?: boolean;
}

export const UserInfo = memo<UserInfoProps>(
  ({
    profilePicture,
    name,
    username,
    gender,
    age,
    countryCode,
    isAdmin = false,
    isSupporter = false,
  }) => {
    const theme = useTheme();

    const country = getCountryByCode(countryCode);

    const styles = StyleSheet.create({
      container: {
        alignItems: "center",
        paddingVertical: verticalScale(20),
        paddingHorizontal: scale(20),
      },
      username: {
        fontSize: moderateScale(18),
        fontWeight: "500",
        color: theme.colors.textSecondary,
        textAlign: "center",
        marginBottom: verticalScale(12),
      },
      detailRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: `${theme.colors.info}15`,
        paddingHorizontal: scale(16),
        paddingVertical: verticalScale(10),
        borderRadius: scale(theme.borderRadius.full),
        gap: scale(8),
      },
      countryFlag: {
        fontSize: moderateScale(18),
      },
      countryText: {
        fontSize: moderateScale(16),
        fontWeight: "600",
        color: theme.colors.text,
      },
    });

    return (
      <View style={styles.container}>
        <ProfilePhoto
          profilePicture={profilePicture}
          size="large"
        />
        <NameContainer
          size="large"
          name={name}
          isAdmin={isAdmin}
          isSupporter={isSupporter}
          />
        <Text style={styles.username}>@{username}</Text>
         <AgeGenderChip
          size="large"
          gender={gender}
          showGenerText
          age={age}
          />
          <View style={styles.detailRow}>
            <Text style={styles.countryFlag}>{country?.flag}</Text>
            <Text style={styles.countryText}>{country?.name}</Text>
          </View>
      </View>
    );
  }
);

UserInfo.displayName = "UserInfo";
