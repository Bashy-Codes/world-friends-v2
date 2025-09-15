import type React from "react";
import { StyleSheet, TouchableOpacity, View, Dimensions } from "react-native";
import ImageView from "react-native-image-viewing";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { scale } from "react-native-size-matters";
import { useTheme } from "@/lib/Theme";

const Screen_WIDTH = Dimensions.get("window").width;

interface ImageViewerProps {
  images: Array<{ uri: string }>;
  imageIndex: number;
  visible: boolean;
  onRequestClose: () => void;
}

export const ImageViewer: React.FC<ImageViewerProps> = ({
  images,
  imageIndex,
  visible,
  onRequestClose,
}) => {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  const styles = StyleSheet.create({
    footerContainer: {
      bottom: insets.bottom,
      alignItems: "center",
      justifyContent: "center",
    },
    closeButton: {
      width: Screen_WIDTH * 0.8,
      height: scale(50),
      borderRadius: scale(25),
      backgroundColor: "rgba(255, 255, 255, 0.2)",
      alignItems: "center",
      justifyContent: "center",
    },
  });

  // empty header to hide close button
  const renderHeader = () => null;

  const renderFooter = () => (
    <View style={styles.footerContainer}>
      <TouchableOpacity
        style={styles.closeButton}
        onPress={onRequestClose}
        activeOpacity={0.7}
      >
        <Ionicons name="close" size={scale(30)} color={theme.colors.white} />
      </TouchableOpacity>
    </View>
  );

  return (
    <ImageView
      images={images}
      imageIndex={imageIndex}
      visible={visible}
      onRequestClose={onRequestClose}
      FooterComponent={renderFooter}
      HeaderComponent={renderHeader}
      swipeToCloseEnabled={true}
      doubleTapToZoomEnabled={true}
      animationType="fade"
      backgroundColor="#0F172A"
    />
  );
};
