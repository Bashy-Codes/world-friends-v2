import React, { memo, useMemo } from "react";
import { View, Text, StyleSheet, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { scale, verticalScale, moderateScale } from "react-native-size-matters";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/lib/Theme";
import {
  getCountryByCode,
  getLanguageByCode,
  getHobbyById,
} from "@/constants/geographics";

interface ProfileItemProps {
  type: "about" | "languages" | "travel" | "hobbies" | "books";
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  data?: {
    aboutMe?: string;
    spokenLanguages?: string[];
    learningLanguages?: string[];
    visitedCountries?: string[];
    wantToVisitCountries?: string[];
    hobbies?: string[];
    books?: string[];
  };
}

export const ProfileItem = memo<ProfileItemProps>(
  ({ type, title, icon, data }) => {
    const theme = useTheme();
    const { t } = useTranslation();

    const styles = StyleSheet.create({
      container: {
        backgroundColor: theme.colors.card,
        borderRadius: scale(theme.borderRadius.lg),
        marginHorizontal: scale(20),
        marginBottom: verticalScale(16),
        padding: scale(16),
        ...Platform.select({
          ios: {
            shadowColor: theme.colors.shadow,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
          },
          android: {
            elevation: 2,
          },
        }),
      },
      header: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: verticalScale(12),
      },
      iconContainer: {
        width: scale(32),
        height: scale(32),
        borderRadius: scale(16),
        backgroundColor: theme.colors.primary + "15",
        justifyContent: "center",
        alignItems: "center",
        marginRight: scale(12),
      },
      title: {
        fontSize: moderateScale(18),
        fontWeight: "700",
        color: theme.colors.text,
      },
      aboutText: {
        fontSize: moderateScale(15),
        lineHeight: moderateScale(22),
        color: theme.colors.textSecondary,
        marginTop: verticalScale(4),
      },
      subsection: {
        backgroundColor: theme.colors.surface,
        borderRadius: scale(theme.borderRadius.md),
        padding: scale(12),
        marginBottom: verticalScale(12),
      },
      subsectionHeader: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: verticalScale(8),
      },
      subsectionIcon: {
        marginRight: scale(8),
      },
      subsectionTitle: {
        fontSize: moderateScale(15),
        fontWeight: "600",
        color: theme.colors.text,
      },
      chipsContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: scale(8),
      },
      chip: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: theme.colors.surface,
        paddingHorizontal: scale(12),
        paddingVertical: verticalScale(6),
        borderRadius: scale(theme.borderRadius.full),
        borderWidth: 1,
        borderColor: theme.colors.border,
      },
      chipText: {
        fontSize: moderateScale(13),
        fontWeight: "500",
        color: theme.colors.text,
      },
      bookChip: {
        maxWidth: scale(200),
      },
      bookTitle: {
        fontSize: moderateScale(13),
        fontWeight: "600",
        color: theme.colors.text,
      },
    });

    const renderChips = useMemo(() => {
      switch (type) {
        case "languages":
          return (
            <>
              {data?.spokenLanguages && data.spokenLanguages.length > 0 && (
                <View style={styles.subsection}>
                  <View style={styles.subsectionHeader}>
                    <Ionicons
                      name="checkmark-circle"
                      size={scale(16)}
                      color={theme.colors.success}
                      style={styles.subsectionIcon}
                    />
                    <Text style={styles.subsectionTitle}>
                      {t("profile.subsections.speaking")}
                    </Text>
                  </View>
                  <View style={styles.chipsContainer}>
                    {data.spokenLanguages.map((langCode) => {
                      const language = getLanguageByCode(langCode);
                      return language ? (
                        <View key={langCode} style={styles.chip}>
                          <Text style={styles.chipText}>
                            {" "}
                            💬 {language.name}
                          </Text>
                        </View>
                      ) : null;
                    })}
                  </View>
                </View>
              )}
              {data?.learningLanguages && data.learningLanguages.length > 0 && (
                <View style={styles.subsection}>
                  <View style={styles.subsectionHeader}>
                    <Ionicons
                      name="school"
                      size={scale(16)}
                      color={theme.colors.warning}
                      style={styles.subsectionIcon}
                    />
                    <Text style={styles.subsectionTitle}>
                      {t("profile.subsections.learning")}
                    </Text>
                  </View>
                  <View style={styles.chipsContainer}>
                    {data.learningLanguages.map((langCode) => {
                      const language = getLanguageByCode(langCode);
                      return language ? (
                        <View key={langCode} style={styles.chip}>
                          <Text style={styles.chipText}>
                            📚 {language.name}
                          </Text>
                        </View>
                      ) : null;
                    })}
                  </View>
                </View>
              )}
            </>
          );

        case "travel":
          return (
            <>
              {data?.visitedCountries && data.visitedCountries.length > 0 && (
                <View style={styles.subsection}>
                  <View style={styles.subsectionHeader}>
                    <Ionicons
                      name="checkmark-circle"
                      size={scale(16)}
                      color={theme.colors.success}
                      style={styles.subsectionIcon}
                    />
                    <Text style={styles.subsectionTitle}>
                      {t("profile.subsections.visited")}
                    </Text>
                  </View>
                  <View style={styles.chipsContainer}>
                    {data.visitedCountries.map((countryCode) => {
                      const country = getCountryByCode(countryCode);
                      return country ? (
                        <View key={countryCode} style={styles.chip}>
                          <Text style={styles.chipText}>
                            {country.flag} {country.name}
                          </Text>
                        </View>
                      ) : null;
                    })}
                  </View>
                </View>
              )}
              {data?.wantToVisitCountries &&
                data.wantToVisitCountries.length > 0 && (
                  <View style={styles.subsection}>
                    <View style={styles.subsectionHeader}>
                      <Ionicons
                        name="heart"
                        size={scale(16)}
                        color={theme.colors.error}
                        style={styles.subsectionIcon}
                      />
                      <Text style={styles.subsectionTitle}>
                        {t("profile.subsections.wantToVisit")}
                      </Text>
                    </View>
                    <View style={styles.chipsContainer}>
                      {data.wantToVisitCountries.map((countryCode) => {
                        const country = getCountryByCode(countryCode);
                        return country ? (
                          <View key={countryCode} style={styles.chip}>
                            <Text style={styles.chipText}>
                              {country.flag} {country.name}
                            </Text>
                          </View>
                        ) : null;
                      })}
                    </View>
                  </View>
                )}
            </>
          );

        case "hobbies":
          return data?.hobbies && data.hobbies.length > 0 ? (
            <View style={styles.chipsContainer}>
              {data.hobbies.map((hobbyId) => {
                const hobby = getHobbyById(hobbyId);
                return hobby ? (
                  <View key={hobbyId} style={styles.chip}>
                    <Text style={styles.chipText}>
                      {hobby.emoji} {hobby.name}
                    </Text>
                  </View>
                ) : null;
              })}
            </View>
          ) : null;

        case "books":
          return data?.books && data.books.length > 0 ? (
            <View style={styles.chipsContainer}>
              {data.books.map((book, index) => (
                <View
                  key={`book-${index}`}
                  style={[styles.chip, styles.bookChip]}
                >
                  <View>
                    <Text
                      style={styles.bookTitle}
                      numberOfLines={1}
                      ellipsizeMode="tail"
                    >
                      📚 {book}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          ) : null;

        default:
          return null;
      }
    }, [type, data, theme, styles]);

    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Ionicons
              name={icon}
              size={scale(18)}
              color={theme.colors.primary}
            />
          </View>
          <Text style={styles.title}>{title}</Text>
        </View>

        {type === "about" && data?.aboutMe ? (
          <Text style={styles.aboutText}>{data.aboutMe}</Text>
        ) : (
          renderChips
        )}
      </View>
    );
  }
);

ProfileItem.displayName = "ProfileItem";
