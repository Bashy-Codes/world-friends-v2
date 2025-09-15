import { useState } from "react"
import { View, Text, TextInput, StyleSheet, ScrollView } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { useRouter } from "expo-router"
import { useAuthActions } from "@convex-dev/auth/react"
import Toast from "react-native-toast-message"
import { Ionicons } from "@expo/vector-icons"
import { signUpSchema, signInSchema, type SignUpFormData, type SignInFormData } from "@/validations/auth"
import { useTheme } from "@/lib/Theme"
import { scale, verticalScale, moderateScale } from "react-native-size-matters"
import { ReliableKeyboardAvoidingView } from "@/components/common/KeyboardHandler"
import { Button } from "@/components/ui/Button"
import { useTranslation } from "react-i18next"

type AuthMode = "login" | "signup"

interface AuthFormData extends SignUpFormData {
  // SignUpFormData already includes email, password, confirmPassword
}

interface FieldValidation {
  email: "none" | "valid" | "error"
  password: "none" | "valid" | "error"
  confirmPassword: "none" | "valid" | "error"
}

export default function AuthScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { t } = useTranslation();
  const { signIn } = useAuthActions()
  
  const [mode, setMode] = useState<AuthMode>("login")
  const [formData, setFormData] = useState<AuthFormData>({
    email: "",
    password: "",
    confirmPassword: "",
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Partial<AuthFormData>>({})
  const [fieldValidation, setFieldValidation] = useState<FieldValidation>({
    email: "none",
    password: "none",
    confirmPassword: "none",
  })

  const isSignupMode = mode === "signup"

  const validateForm = () => {
    try {
      if (isSignupMode) {
        signUpSchema.parse(formData)
      } else {
        const loginData: SignInFormData = {
          email: formData.email,
          password: formData.password,
        }
        signInSchema.parse(loginData)
      }
      setErrors({})
      return true
    } catch (error: any) {
      const fieldErrors: Partial<AuthFormData> = {}
      error.errors?.forEach((err: any) => {
        if (err.path?.[0]) {
          fieldErrors[err.path[0] as keyof AuthFormData] = err.message
        }
      })
      setErrors(fieldErrors)
      return false
    }
  }

  const handleSubmit = async () => {
    if (!validateForm()) {
      Toast.show({
        type: "error",
        text1: t("errorToasts.validationError.text1"),
        text2: t("errorToasts.validationError.text2")
      })
      return
    }

    setLoading(true)
    try {
      const formDataObj = new FormData()
      formDataObj.append("email", formData.email)
      formDataObj.append("password", formData.password)
      formDataObj.append("flow", isSignupMode ? "signUp" : "signIn")

      await signIn("password", formDataObj)
      
      if (isSignupMode) {
        router.push({ 
          pathname: "/screens/otp-verification", 
          params: { email: formData.email } 
        })
      } else {
        router.replace("/(tabs)")
      }
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: t("errorToasts.genericError.text1"),
        text2:  t("errorToasts.genericError.text2"),
      })
    } finally {
      setLoading(false)
    }
  }

  const updateField = (field: keyof AuthFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    
    // Clear errors for this field
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }))
    }

    // Update field validation
    if (field === "email") {
      updateEmailValidation(value)
    } else if (field === "password") {
      updatePasswordValidation(value)
    } else if (field === "confirmPassword") {
      updateConfirmPasswordValidation(value)
    }
  }

  const updateEmailValidation = (value: string) => {
    if (value.length === 0) {
      setFieldValidation((prev) => ({ ...prev, email: "none" }))
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      setFieldValidation((prev) => ({
        ...prev,
        email: emailRegex.test(value) ? "valid" : "error",
      }))
    }
  }

  const updatePasswordValidation = (value: string) => {
    if (value.length === 0) {
      setFieldValidation((prev) => ({ ...prev, password: "none" }))
    } else {
      const isValid = isSignupMode 
        ? value.length >= 6 && !/\s/.test(value)
        : value.length >= 6
      setFieldValidation((prev) => ({
        ...prev,
        password: isValid ? "valid" : "error",
      }))
    }

    // Also validate confirm password when password changes (signup mode only)
    if (isSignupMode && formData.confirmPassword.length > 0) {
      setFieldValidation((prev) => ({
        ...prev,
        confirmPassword: value === formData.confirmPassword ? "valid" : "error",
      }))
    }
  }

  const updateConfirmPasswordValidation = (value: string) => {
    if (value.length === 0) {
      setFieldValidation((prev) => ({ ...prev, confirmPassword: "none" }))
    } else {
      setFieldValidation((prev) => ({
        ...prev,
        confirmPassword: value === formData.password ? "valid" : "error",
      }))
    }
  }

  const switchMode = () => {
    setMode(mode === "login" ? "signup" : "login")
    setErrors({})
    setFormData({ email: "", password: "", confirmPassword: "" })
    setFieldValidation({ email: "none", password: "none", confirmPassword: "none" })
  }

  const renderInput = (
    field: keyof AuthFormData,
    placeholder: string,
    keyboardType?: "email-address" | "default",
  ) => {
    const showValidation = fieldValidation[field] !== "none"
    const isValid = fieldValidation[field] === "valid"

    return (
      <View style={styles.inputContainer}>
        <View style={styles.inputWrapper}>
          <TextInput
            style={[
              styles.input,
              { 
                borderColor: theme.colors.border, 
                backgroundColor: theme.colors.background,
                color: theme.colors.text 
              },
              errors[field] && styles.inputError,
            ]}
            placeholder={placeholder}
            placeholderTextColor={theme.colors.textMuted}
            value={formData[field]}
            onChangeText={(text) => updateField(field, text)}
            keyboardType={keyboardType}
            autoCapitalize="none"
            autoCorrect={false}
          />
          {showValidation && (
            <View style={styles.validationIcon}>
              <Ionicons
                name={isValid ? "checkmark-circle" : "close-circle"}
                size={moderateScale(20)}
                color={isValid ? theme.colors.success : theme.colors.error}
              />
            </View>
          )}
        </View>
        {errors[field] && (
          <Text style={[styles.errorText, { color: theme.colors.error }]}>
            {errors[field]}
          </Text>
        )}
      </View>
    )
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ReliableKeyboardAvoidingView enabled={true}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
            <Text style={[styles.title, { color: theme.colors.text }]}>
              {isSignupMode ? t("auth.signupTitle") : t("auth.loginTitle")}
            </Text>
            <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
              {isSignupMode 
                ? t("auth.signupSubTitle")
                : t("auth.loginSubTitle")}
            </Text>

            {renderInput("email", t("auth.email"), "email-address")}
            {renderInput("password", t("auth.password"), "default")}
            {isSignupMode && renderInput("confirmPassword", t("auth.confirmPassword"), "default")}

            <Button
              iconName={isSignupMode ? "checkmark" : "log-in-outline"}
              onPress={handleSubmit}
              disabled={loading}
            />
          </View>

          <View style={styles.linkButton}>
            <Text style={[styles.linkText, { color: theme.colors.textSecondary }]}>
              {isSignupMode ? t("auth.alreadyHaveAccountCTA") : t("auth.noAccountCTA") }
              <Text
                style={[styles.linkTextBold, { color: theme.colors.primary }]}
                onPress={switchMode}
              >
                {isSignupMode ? t("auth.signIn") : t("auth.signUp")}
              </Text>
            </Text>
          </View>
        </ScrollView>
      </ReliableKeyboardAvoidingView>
    </SafeAreaView>
  )
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
  inputContainer: {
    marginBottom: verticalScale(16),
  },
  inputWrapper: {
    position: "relative",
  },
  input: {
    borderWidth: 1,
    borderRadius: moderateScale(12),
    paddingHorizontal: scale(16),
    paddingVertical: verticalScale(12),
    paddingRight: scale(50),
    fontSize: moderateScale(16),
    fontWeight: "500",
  },
  validationIcon: {
    position: "absolute",
    right: scale(16),
    top: "50%",
    transform: [{ translateY: -moderateScale(10) }],
  },
  inputError: {
    borderColor: "#FF3B30",
    backgroundColor: "#FFF5F5",
  },
  errorText: {
    fontSize: moderateScale(12),
    fontWeight: "500",
    marginTop: verticalScale(4),
    marginLeft: scale(4),
  },
  linkButton: {
    alignItems: "center",
    paddingVertical: verticalScale(16),
  },
  linkText: {
    fontSize: moderateScale(14),
    fontWeight: "400",
  },
  linkTextBold: {
    fontWeight: "600",
  },
})