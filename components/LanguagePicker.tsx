import React, { forwardRef, useMemo, useCallback, useImperativeHandle, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, Modal, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { scale, verticalScale, moderateScale } from "react-native-size-matters";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/lib/Theme";
import {
  SUPPORTED_LANGUAGES,
  SupportedLanguageCode,
  changeLanguage,
  getCurrentLanguage,
} from "@/lib/i18n";
import { FlatList } from "react-native-gesture-handler";

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Language flag mapping based on language codes
const LANGUAGE_FLAGS: Record<SupportedLanguageCode, string> = {
  en: "🇺🇸", // English - US flag
  fr: "🇫🇷", // French - France flag
  es: "🇪🇸", // Spanish - Spain flag
  de: "🇩🇪", // German - Germany flag
  it: "🇮🇹", // Italian - Italy flag
  tr: "🇹🇷", // Turkish - Turkey flag
  ru: "🇷🇺", // Russian - Russia flag
  ja: "🇯🇵", // Japanese - Japan flag
  ko: "🇰🇷", // Korean - South Korea flag
  zh: "🇨🇳", // Chinese - China flag
};

interface LanguageItem {
  code: SupportedLanguageCode;
  name: string;
  nativeName: string;
  flag: string;
}

export interface LanguagePickerRef {
  present: () => void;
  dismiss: () => void;
}

interface LanguagePickerProps {
  onLanguageChange?: (languageCode: SupportedLanguageCode) => void;
}

export const LanguagePicker = forwardRef<LanguagePickerRef, LanguagePickerProps>(
  ({ onLanguageChange }, ref) => {
    const theme = useTheme();
    const { t } = useTranslation();
    const [visible, setVisible] = useState(false);
    const [tempSelectedLanguage, setTempSelectedLanguage] = useState<SupportedLanguageCode | null>(null);
    const currentLanguage = getCurrentLanguage();

    // Expose methods via ref
    useImperativeHandle(ref, () => ({
      present: () => {
        setVisible(true);
        setTempSelectedLanguage(currentLanguage);
      },
      dismiss: () => {
        setVisible(false);
        setTempSelectedLanguage(null);
      },
    }), [currentLanguage]);

    const languageItems: LanguageItem[] = useMemo(() => {
      return SUPPORTED_LANGUAGES.map((lang) => ({
        code: lang.code,
        name: lang.name,
        nativeName: lang.nativeName,
        flag: LANGUAGE_FLAGS[lang.code],
      }));
    }, []);

    const handleLanguageSelect = useCallback(
      (languageCode: SupportedLanguageCode) => {
        setTempSelectedLanguage(languageCode);
      },
      []
    );

    const handleClose = useCallback(() => {
      setVisible(false);
      setTempSelectedLanguage(null);
    }, []);

    const handleConfirm = useCallback(async () => {
      if (tempSelectedLanguage && tempSelectedLanguage !== currentLanguage) {
        try {
          await changeLanguage(tempSelectedLanguage);
          onLanguageChange?.(tempSelectedLanguage);
        } catch (error) {
          console.error("Error changing language:", error);
        }
      }
      setVisible(false);
      setTempSelectedLanguage(null);
    }, [tempSelectedLanguage, currentLanguage, onLanguageChange]);

    const styles = StyleSheet.create({
      overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        justifyContent: 'center',
        alignItems: 'center',
      },
      container: {
        backgroundColor: theme.colors.surface,
        borderRadius: scale(theme.borderRadius.xl),
        width: screenWidth * 0.9,
        height: screenHeight * 0.8,
        maxWidth: scale(500),
        maxHeight: scale(700),
        shadowColor: theme.colors.shadow,
        shadowOffset: {
          width: 0,
          height: 12,
        },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 20,
        overflow: 'hidden',
      },
      content: {
        flex: 1,
        paddingHorizontal: scale(16),
        paddingVertical: verticalScale(8),
      },
      item: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: verticalScale(16),
        paddingHorizontal: scale(16),
        borderRadius: scale(theme.borderRadius.md),
        marginVertical: verticalScale(2),
        backgroundColor: theme.colors.background,
      },
      itemSelected: {
        backgroundColor: theme.colors.primary + "15",
        borderWidth: 1,
        borderColor: theme.colors.primary,
      },
      itemContent: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
      },
      itemFlag: {
        fontSize: moderateScale(20),
        marginRight: scale(12),
      },
      itemTextContainer: {
        flex: 1,
      },
      itemName: {
        fontSize: moderateScale(16),
        color: theme.colors.text,
        fontWeight: "500",
        marginBottom: verticalScale(2),
      },
      itemNameSelected: {
        color: theme.colors.primary,
        fontWeight: "600",
      },
      itemNativeName: {
        fontSize: moderateScale(13),
        color: theme.colors.textMuted,
        fontWeight: "400",
      },
      itemNativeNameSelected: {
        color: theme.colors.primary + "80",
      },
      checkIcon: {
        marginLeft: scale(12),
      },
      actionsContainer: {
        backgroundColor: theme.colors.background,
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: scale(24),
        paddingVertical: verticalScale(16),
        gap: scale(12),
        borderRadius: theme.borderRadius.lg,
      },
      actionButton: {
        width: scale(100),
        height: scale(50),
        borderRadius: scale(25),
        alignItems: 'center',
        justifyContent: 'center',
      },
      cancelButton: {
        backgroundColor: theme.colors.error,
      },
      confirmButton: {
        backgroundColor: theme.colors.primary,
      },
      confirmButtonDisabled: {
        backgroundColor: theme.colors.surfaceSecondary,
      },
    });

    const renderItem = useCallback(
      ({ item }: { item: LanguageItem }) => {
        const isSelected = tempSelectedLanguage === item.code;

        return (
          <TouchableOpacity
            style={[styles.item, isSelected && styles.itemSelected]}
            onPress={() => handleLanguageSelect(item.code)}
            activeOpacity={0.7}
          >
            <View style={styles.itemContent}>
              <Text style={styles.itemFlag}>{item.flag}</Text>
              <View style={styles.itemTextContainer}>
                <Text
                  style={[
                    styles.itemName,
                    isSelected && styles.itemNameSelected,
                  ]}
                >
                  {item.name}
                </Text>
                <Text
                  style={[
                    styles.itemNativeName,
                    isSelected && styles.itemNativeNameSelected,
                  ]}
                >
                  {item.nativeName}
                </Text>
              </View>
            </View>
            {isSelected && (
              <Ionicons
                name="checkmark"
                size={scale(20)}
                color={theme.colors.primary}
                style={styles.checkIcon}
              />
            )}
          </TouchableOpacity>
        );
      },
      [tempSelectedLanguage, handleLanguageSelect, styles, theme.colors.primary]
    );

    const keyExtractor = useCallback((item: LanguageItem) => item.code, []);

    // Check if language has changed
    const hasLanguageChanged = tempSelectedLanguage && tempSelectedLanguage !== currentLanguage;

    return (
      <Modal
        visible={visible}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={handleClose}
      >
        <Pressable style={styles.overlay} onPress={handleClose}>
          <Pressable style={styles.container} onPress={(e) => e.stopPropagation()}>
            {/* Content */}
            <View style={styles.content}>
              <FlatList
                data={languageItems}
                keyExtractor={keyExtractor}
                renderItem={renderItem}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{
                  paddingVertical: verticalScale(8),
                }}
              />
            </View>

            {/* Bottom Actions */}
            <View style={styles.actionsContainer}>
              <TouchableOpacity
                style={[styles.actionButton, styles.cancelButton]}
                onPress={handleClose}
                activeOpacity={0.7}
              >
                <Ionicons
                  name="close"
                  size={scale(20)}
                  color={theme.colors.white}
                />
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.actionButton,
                  hasLanguageChanged ? styles.confirmButton : styles.confirmButtonDisabled,
                ]}
                onPress={handleConfirm}
                activeOpacity={0.7}
                disabled={!hasLanguageChanged}
              >
                <Ionicons
                  name="checkmark"
                  size={scale(20)}
                  color={hasLanguageChanged ? theme.colors.white : theme.colors.textMuted}
                />
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    );
  }
);

LanguagePicker.displayName = "LanguagePicker";
