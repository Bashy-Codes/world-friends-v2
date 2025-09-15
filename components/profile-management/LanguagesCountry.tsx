import React, { useRef, useMemo } from "react";
import { View, Text, StyleSheet } from "react-native";
import { Controller, Control, FieldErrors } from "react-hook-form";
import { scale, verticalScale, moderateScale } from "react-native-size-matters";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/lib/Theme";
import { ItemPickerSheet, PickerItem, ItemPickerSheetRef } from "@/components/ItemPickerSheet";
import {
  COUNTRIES,
  LANGUAGES,
  getCountryByCode,
  getLanguageByCode,
} from "@/constants/geographics";
import { Separator } from "@/components/common/Separator";
import { KeyboardHandler } from "@/components/common/KeyboardHandler";
import { ItemSelector } from "@/components/common/ItemSelector";
import { SelectedItem } from "@/components/common/SelectedItem";

interface LanguagesCountryProps {
  control: Control<any>;
  errors: FieldErrors<any>;
}

export const LanguagesCountry: React.FC<LanguagesCountryProps> = ({
  control,
  errors,
}) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const countrySheetRef = useRef<ItemPickerSheetRef>(null);
  const languagesSpokenSheetRef = useRef<ItemPickerSheetRef>(null);
  const languagesLearningSheetRef = useRef<ItemPickerSheetRef>(null);

  const countryItems: PickerItem[] = useMemo(
    () =>
      COUNTRIES.map((country) => ({
        id: country.code,
        name: country.name,
        code: country.code,
        emoji: country.flag,
      })),
    []
  );

  const languageItems: PickerItem[] = useMemo(
    () =>
      LANGUAGES.map((language) => ({
        id: language.code,
        name: language.name,
        code: language.code,
        emoji: "🌍", // Generic language emoji
      })),
    []
  );

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      paddingHorizontal: scale(20),
    },
    section: {
      marginBottom: verticalScale(24),
    },
    label: {
      fontSize: moderateScale(16),
      fontWeight: "600",
      color: theme.colors.text,
      marginBottom: verticalScale(8),
    },

  });

  const renderSelectedCountryText = (countryCode: string) => {
    const country = getCountryByCode(countryCode);
    if (!country) return "";
    return `${country.flag} ${country.name}`;
  };

  const renderSelectedLanguages = (
    languageCodes: string[],
    onRemove: (code: string) => void
  ) => {
    if (languageCodes.length === 0) return null;

    return (
      <>
        {languageCodes.map((code) => {
          const language = getLanguageByCode(code);
          if (!language) return null;

          return (
            <SelectedItem
              key={code}
              text={language.name}
              emoji="🌍"
              onRemove={() => onRemove(code)}
            />
          );
        })}
      </>
    );
  };

  return (
    <KeyboardHandler enabled style={{paddingHorizontal: scale(20)}}>
      {/* Country Selection */}
      <View style={styles.section}>
        <Text style={styles.label}>
          {t("createProfile.languagesCountry.country.label")}
        </Text>
        <Controller
          control={control}
          name="country"
          render={({ field: { onChange, value } }) => (
            <>
              <ItemSelector
                placeholder={value ? renderSelectedCountryText(value) : t("createProfile.languagesCountry.country.placeholder")}
                hasError={!!errors.country}
                onPress={() => countrySheetRef.current?.present()}
              />
              <ItemPickerSheet
                ref={countrySheetRef}
                items={countryItems}
                selectedItems={value ? [value] : []}
                onSelectionChange={(selected) => onChange(selected[0] || "")}
                onConfirm={() => countrySheetRef.current?.dismiss()}
                multiSelect={false}
                searchPlaceholder={t("common.searchPlaceholder")}
              />
            </>
          )}
        />
      </View>

      <Separator customOptions={["☾ ⋆⁺₊✧ ── ✧₊⁺⋆ ☽"]} />

      {/* Languages Spoken */}
      <View style={styles.section}>
        <Text style={styles.label}>
          {t("createProfile.languagesCountry.spokenLanguages.label")}
        </Text>
        <Controller
          control={control}
          name="languagesSpoken"
          render={({ field: { onChange, value } }) => (
            <>
              <ItemSelector
                placeholder={t("createProfile.languagesCountry.spokenLanguages.placeholder")}
                hasError={!!errors.languagesSpoken}
                onPress={() => languagesSpokenSheetRef.current?.present()}
              >
                {value &&
                  value.length > 0 &&
                  renderSelectedLanguages(value, (code) => {
                    const newValue = value.filter(
                      (lang: string) => lang !== code
                    );
                    onChange(newValue);
                  })}
              </ItemSelector>
              <ItemPickerSheet
                ref={languagesSpokenSheetRef}
                items={languageItems}
                selectedItems={value || []}
                onSelectionChange={onChange}
                onConfirm={() => languagesSpokenSheetRef.current?.dismiss()}
                multiSelect={true}
                searchPlaceholder={t("common.searchPlaceholder")}
              />
            </>
          )}
        />
      </View>
      <Separator customOptions={["☾ ⋆⁺₊✧ ── ✧₊⁺⋆ ☽"]} />
      {/* Languages Learning */}
      <View style={styles.section}>
        <Text style={styles.label}>
          {t("createProfile.languagesCountry.learningLanguages.label")}
        </Text>
        <Controller
          control={control}
          name="languagesLearning"
          render={({ field: { onChange, value } }) => (
            <>
              <ItemSelector
                placeholder={t("createProfile.languagesCountry.learningLanguages.placeholder")}
                hasError={!!errors.languagesLearning}
                onPress={() => languagesLearningSheetRef.current?.present()}
              >
                {value &&
                  value.length > 0 &&
                  renderSelectedLanguages(value, (code) => {
                    const newValue = value.filter(
                      (lang: string) => lang !== code
                    );
                    onChange(newValue);
                  })}
              </ItemSelector>
              <ItemPickerSheet
                ref={languagesLearningSheetRef}
                items={languageItems}
                selectedItems={value || []}
                onSelectionChange={onChange}
                onConfirm={() => languagesLearningSheetRef.current?.dismiss()}
                multiSelect={true}
                searchPlaceholder={t("common.searchPlaceholder")}
              />
            </>
          )}
        />
      </View>
    </KeyboardHandler>
  );
};
