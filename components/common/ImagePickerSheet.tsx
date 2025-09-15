import React, { forwardRef, useState, useCallback, useImperativeHandle } from "react";
import { View, StyleSheet, Modal, Pressable } from "react-native";
import { scale, verticalScale } from "react-native-size-matters";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/lib/Theme";
import Toast from "react-native-toast-message";
import { Button } from "../ui/Button";

interface ImagePickerSheetProps {
  onImageSelected: (imageUri: string) => void;
}

export interface ImagePickerSheetRef {
  present: () => void;
  dismiss: () => void;
}

export const ImagePickerSheet = forwardRef<ImagePickerSheetRef, ImagePickerSheetProps>(
  ({ onImageSelected }, ref) => {
    const theme = useTheme();
    const { t } = useTranslation();
    const insets = useSafeAreaInsets();
    const [visible, setVisible] = useState(false);

    // Expose methods via ref
    useImperativeHandle(ref, () => ({
      present: () => setVisible(true),
      dismiss: () => setVisible(false),
    }), []);

    const handleClose = useCallback(() => {
      setVisible(false);
    }, []);

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
        paddingTop: verticalScale(8),
        paddingBottom: insets.bottom,
      },
      headerLine: {
        width: scale(40),
        height: verticalScale(4),
        backgroundColor: theme.colors.textMuted,
        borderRadius: scale(theme.borderRadius.full),
        alignSelf: 'center',
        marginBottom: verticalScale(24),
      },
      content: {
        flexDirection: 'row',
        justifyContent: 'space-evenly',
      },
      option: {
        width: scale(150),
        height: scale(70),
      },
    });

    const handleCameraPress = async () => {
      try {
        // Request camera permissions
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== "granted") {
          Toast.show({
            type: "error",
            text1: t("errorToasts.cameraPermission.text1"),
            text2: t("errorToasts.cameraPermission.text2"),
            position: "top",
          });
          return;
        }

        // Launch camera
        const result = await ImagePicker.launchCameraAsync({
          mediaTypes: ["images"],
          allowsEditing: true,
          // aspect: [1, 1],
          // quality: 1,
        });

        if (!result.canceled && result.assets[0]) {
          onImageSelected(result.assets[0].uri);
          setVisible(false);
        }
      } catch (error) {
        console.error("Camera error:", error);
        Toast.show({
          type: "error",
          text1: t("errorToasts.genericError.text1"),
          text2: t("errorToasts.genericError.text2"),
          position: "top",
        });
      }
    };

    const handleGalleryPress = async () => {
      try {
        // Request media library permissions
        const { status } =
          await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== "granted") {
          Toast.show({
            type: "error",
            text1: t("errorToasts.photoLibraryPermission.text1"),
            text2: t("errorToasts.photoLibraryPermission.text2"),
            position: "top",
          });
          return;
        }

        // Launch image picker
        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ["images"],
          allowsEditing: true,
          // aspect: [1, 1],
          // quality: 1,
        });

        if (!result.canceled && result.assets[0]) {
          onImageSelected(result.assets[0].uri);
          setVisible(false);
        }
      } catch (error) {
        console.error("Gallery error:", error);
        Toast.show({
          type: "error",
          text1: t("errorToasts.genericError.text1"),
          text2: t("errorToasts.genericError.text2"),
          position: "top",
        });
      }
    };

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
            {/* Drag indicator */}
            <View style={styles.headerLine} />

            {/* Content */}
            <View style={styles.content}>
              <Button
                iconName="camera"
                iconColor={theme.colors.primary}
                iconSize={scale(28)}
                bgColor={theme.colors.background}
                onPress={handleCameraPress}
                style={styles.option}
              />
              <Button
                iconName="images"
                iconColor={theme.colors.primary}
                iconSize={scale(28)}
                bgColor={theme.colors.background}
                onPress={handleGalleryPress}
                style={styles.option}
              />
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    );
  }
);

ImagePickerSheet.displayName = "ImagePickerSheet";
