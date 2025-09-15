import { useTheme } from "@/lib/Theme"
import { forwardRef, useImperativeHandle, useState, useCallback } from "react"
import { StyleSheet, Modal, View, Dimensions, Pressable } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { scale, verticalScale } from "react-native-size-matters"
import { Button } from "@/components/ui/Button"

const { height: screenHeight } = Dimensions.get('window');

export interface ActionSheetOption {
  id: string
  title: string
  icon: string
  color?: string
  onPress: () => void
}

interface ActionSheetProps {
  options: ActionSheetOption[]
}

export interface ActionSheetRef {
  present: () => void
  dismiss: () => void
}

export const ActionSheet = forwardRef<ActionSheetRef, ActionSheetProps>(({ options }, ref) => {
  const theme = useTheme()
  const insets = useSafeAreaInsets()
  const [visible, setVisible] = useState(false)

  // Expose methods via ref
  useImperativeHandle(ref, () => ({
    present: () => setVisible(true),
    dismiss: () => setVisible(false),
  }), [])

  const handleClose = useCallback(() => {
    setTimeout(() => {
      setVisible(false)
    }, 100);
  }, [])

  const handleOptionPress = useCallback((option: ActionSheetOption) => {
    option.onPress()
    handleClose()
  }, [handleClose])

  const styles = StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'flex-end',
    },
    container: {
      backgroundColor: theme.colors.surface,
      borderTopLeftRadius: scale(theme.borderRadius.xl),
      borderTopRightRadius: scale(theme.borderRadius.xl),
      paddingHorizontal: scale(20),
      paddingBottom: insets.bottom,
      paddingTop: verticalScale(8),
      maxHeight: screenHeight * 0.5,
    },
    header: {
      alignItems: "center",
      paddingVertical: verticalScale(12),
      marginBottom: verticalScale(8),
    },
    headerLine: {
      width: scale(40),
      height: verticalScale(4),
      backgroundColor: theme.colors.textMuted,
      borderRadius: scale(theme.borderRadius.full),
    },
    optionsContainer: {
      gap: verticalScale(8),
    },
  })

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      statusBarTranslucent
      onRequestClose={handleClose}
    >
      <Pressable style={styles.overlay} onPress={handleClose}>
        <Pressable style={styles.container} onPress={(e) => e.stopPropagation()}>
          {/* Header with drag indicator */}
          <View style={styles.header}>
            <View style={styles.headerLine} />
          </View>

          {/* Options */}
          <View style={styles.optionsContainer}>
            {options.map((option) => (
              <Button
                key={option.id}
                iconName={option.icon as any}
                iconColor={option.color || theme.colors.text}
                text={option.title}
                textStyle={{ color: option.color || theme.colors.text }}
                onPress={() => handleOptionPress(option)}
                bgColor={theme.colors.background}
                style={{ direction: "rtl" }}
              />
            ))}
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  )
})

ActionSheet.displayName = "ActionSheet"
