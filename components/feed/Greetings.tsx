import React, { useMemo } from "react";
import { View, Text, StyleSheet } from "react-native";
import { scale, verticalScale, moderateScale } from "react-native-size-matters";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/lib/Theme";
import { Separator } from "@/components/common/Separator";
import { Button } from "@/components/ui/Button";

interface GreetingsProps {
  onCreatePost?: () => void;
  actionText: string
}

export const Greetings: React.FC<GreetingsProps> = ({ onCreatePost, actionText }) => {
  const theme = useTheme();
  const { t } = useTranslation();

  const getGreeting = useMemo(() => {
    const hour = new Date().getHours();

    if (hour >= 5 && hour < 12) {
      return t("greetings.goodMorning");
    } else if (hour >= 12 && hour < 17) {
      return t("greetings.goodAfternoon");
    } else if (hour >= 17 && hour < 22) {
      return t("greetings.goodEvening");
    } else {
      return t("greetings.goodNight");
    }
  }, [t]);

  const { greeting, timeEmoji } = useMemo(() => {
    const hour = new Date().getHours();

    if (hour >= 5 && hour < 12) {
      return { greeting: getGreeting, timeEmoji: "🌄" };
    } else if (hour >= 12 && hour < 17) {
      return { greeting: getGreeting, timeEmoji: "☀️" };
    } else if (hour >= 17 && hour < 21) {
      return { greeting: getGreeting, timeEmoji: "🌅" };
    } else {
      return { greeting: getGreeting, timeEmoji: "🌙" };
    }
  }, [getGreeting]);

  const styles = StyleSheet.create({
    container: {
      backgroundColor: theme.colors.surface,
      marginHorizontal: scale(16),
      marginVertical: verticalScale(12),
      borderRadius: scale(theme.borderRadius.xl),
      padding: scale(20),
      shadowColor: theme.colors.shadow,
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.12,
      shadowRadius: 8,
      elevation: 8,
      flexDirection: "column",
      alignItems: "center",
    },
    greetingSection: {
      width: "100%",
      marginBottom: verticalScale(16),
    },
    greetingText: {
      fontSize: moderateScale(24),
      fontWeight: "800",
      color: theme.colors.text,
      textAlign: "center",
    },
  });

  return (
    <>
      <View style={styles.container}>
        <View style={styles.greetingSection}>
          <Text style={styles.greetingText}>
            {greeting} {timeEmoji}
          </Text>
        </View>
        {onCreatePost && (
          <Button
            iconName="create"
            text={actionText}
            onPress={onCreatePost}
            style={{ width: "100%" }}
          />
        )}
      </View>
      <Separator />
    </>
  );
};
