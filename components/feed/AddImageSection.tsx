import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { scale, verticalScale, moderateScale } from "react-native-size-matters";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/lib/Theme";
import { ImageViewer } from "@/components/common/ImageViewer";
import { Button } from "../ui/Button";

interface AddImageSectionProps {
  images: string[];
  onAddImage: () => void;
  onRemoveImage: (index: number) => void;
}

export const AddImageSection: React.FC<AddImageSectionProps> = ({
  images,
  onAddImage,
  onRemoveImage,
}) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [showImageViewer, setShowImageViewer] = useState(false);

  const canAddMore = images.length < 3;

  // Render image viewer
  const handleImagePress = (imageUri: string) => {
    setSelectedImage(imageUri);
    setShowImageViewer(true);
  };

  const styles = StyleSheet.create({
    container: {
      backgroundColor: theme.colors.surface,
      borderRadius: scale(theme.borderRadius.lg),
      padding: scale(16),
      marginTop: verticalScale(16),
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: verticalScale(12),
    },
    headerIcon: {
      marginRight: scale(8),
    },
    headerText: {
      fontSize: moderateScale(16),
      fontWeight: "600",
      color: theme.colors.text,
    },
    addButton: {
      borderWidth: 2,
      borderColor: theme.colors.primary + "30",
      borderStyle: "dashed",
      opacity: canAddMore ? 1 : 0.5,
    },
    imagesContainer: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "space-between",
      marginBottom: verticalScale(12),
    },
    imageContainer: {
      position: "relative",
      width: scale(80),
      height: scale(80),
      borderRadius: scale(theme.borderRadius.md),
      overflow: "hidden",
    },
    image: {
      width: "100%",
      height: "100%",
    },
    removeButton: {
      position: "absolute",
      top: scale(4),
      right: scale(4),
      width: scale(24),
      height: scale(24),
      borderRadius: scale(theme.borderRadius.full),
      backgroundColor: theme.colors.error,
      alignItems: "center",
      justifyContent: "center",
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons
          name="images"
          size={scale(20)}
          color={theme.colors.primary}
          style={styles.headerIcon}
        />
        <Text style={styles.headerText}>
          {t("createPost.sections.addImages")}
        </Text>
      </View>

      {images.length > 0 && (
        <View style={styles.imagesContainer}>
          {images.map((imageUri, index) => (
            <View key={index} style={styles.imageContainer}>
              <TouchableOpacity
                onPress={() => handleImagePress(imageUri)}
                activeOpacity={0.7}
              >
                <Image source={{ uri: imageUri }} style={styles.image} />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => onRemoveImage(index)}
                activeOpacity={0.7}
              >
                <Ionicons
                  name="close"
                  size={scale(16)}
                  color={theme.colors.white}
                />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}

      {canAddMore && (
        <Button
          iconName="add"
          iconColor={theme.colors.primary}
          onPress={onAddImage}
          text={images.length === 0
            ? t("createPost.sections.addImages")
            : `(${images.length}/3)`}
          bgColor={theme.colors.primary + "15"}
          style={styles.addButton}
          textStyle={{ color: theme.colors.primary }}
        />
      )}
      <ImageViewer
        images={images.map((uri) => ({ uri }))}
        imageIndex={selectedImage ? images.indexOf(selectedImage) : 0}
        visible={showImageViewer}
        onRequestClose={() => setShowImageViewer(false)}
      />
    </View>
  );
};
