import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Dimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useAuthActions } from "@convex-dev/auth/react";
import Toast from "react-native-toast-message";
import { OtpInput } from "react-native-otp-entry";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/lib/Theme";
import { scale, verticalScale, moderateScale } from "react-native-size-matters";
import { useTranslation } from "react-i18next";
import { KeyboardHandler } from "@/components/common/KeyboardHandler";

const { width } = Dimensions.get("window");

export default function OtpVerificationScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const router = useRouter();
  const { email } = useLocalSearchParams<{ email: string }>();
  const { signIn } = useAuthActions();
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  const handleVerify = async () => {
    if (code.length < 6) {
      Toast.show({
        type: "error",
        text1: t("errorToasts.invalidOTP.text1"),
        text2: t("errorToasts.invalidOTP.text2")
      });
      return;
    }

    setLoading(true);
    try {
      const formDataObj = new FormData();
      formDataObj.append("code", code);
      formDataObj.append("flow", "email-verification");
      formDataObj.append("email", email || "");

      await signIn("password", formDataObj);
      router.replace("/screens/create-profile");
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: t("errorToasts.invalidOTP.text1"),
        text2: t("errorToasts.invalidOTP.text2")
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <KeyboardHandler>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
            <Text style={[styles.title, { color: theme.colors.text }]}>{t("auth.verifyEmail")}</Text>
            <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
              {t("auth.enterCode")} {email}
            </Text>

            <View style={styles.otpContainer}>
              <OtpInput
                numberOfDigits={6}
                onTextChange={setCode}
                type="numeric"
                autoFocus={true}
                focusColor={theme.colors.primary}
                blurOnFilled={true}
                secureTextEntry={false}
                theme={{
                    containerStyle: styles.otpInputContainer,
                    pinCodeContainerStyle: styles.pinCodeContainer,
                    pinCodeTextStyle: styles.pinCodeText,
                    focusedPinCodeContainerStyle: styles.activePinCodeContainer,
                    filledPinCodeContainerStyle: styles.filledPinCodeContainer,
                  }}
              />
            </View>

            <TouchableOpacity
              style={[
                styles.button,
                { backgroundColor: theme.colors.primary },
                (loading || code.length < 6) && styles.buttonDisabled,
              ]}
              activeOpacity={0.7}
              onPress={handleVerify}
              disabled={loading || code.length < 6}
            >
              <Ionicons
                name="checkmark"
                size={moderateScale(24)}
                color={theme.colors.white}
              />
            </TouchableOpacity>
          </View>
        </ScrollView>
        </KeyboardHandler>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: scale(16),
    paddingVertical: verticalScale(32),
  },
  card: {
    borderRadius: moderateScale(16),
    padding: scale(24),
    marginHorizontal: scale(8),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  title: {
    fontSize: moderateScale(24),
    fontWeight: "700",
    textAlign: "center",
    marginBottom: verticalScale(8),
  },
  subtitle: {
    fontSize: moderateScale(14),
    fontWeight: "400",
    textAlign: "center",
    marginBottom: verticalScale(24),
  },
  otpContainer: {
    marginBottom: verticalScale(24),
  },
  otpInputContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  pinCodeContainer: {
    borderWidth: 1,
    borderRadius: moderateScale(12),
    width: width / 9,
    height: verticalScale(48),
    justifyContent: "center",
    alignItems: "center",
  },
  pinCodeText: {
    color: "#fff",
    fontSize: moderateScale(20),
    fontWeight: "500",
  },
  activePinCodeContainer: {
    borderWidth: 2,
  },
  filledPinCodeContainer: {
    borderWidth: 1,
  },
  button: {
    borderRadius: moderateScale(26),
    padding: scale(12),
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  buttonDisabled: {
    backgroundColor: "#A0A0A0",
    shadowOpacity: 0,
    elevation: 0,
  },
});
