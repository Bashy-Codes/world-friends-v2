import React, { memo } from "react";
import { View, StyleSheet, ViewStyle } from "react-native";
import { Image } from "expo-image";
import { scale, verticalScale } from "react-native-size-matters";
import { useTheme } from "@/lib/Theme";

interface ProfilePhotoProps {
  profilePicture: string;
  size?: "tiny" | "small" | "medium" | "large";
style?: ViewStyle;
}   

const ProfilePhoto: React.FC<ProfilePhotoProps> = ({
  profilePicture,
  size = "medium",
  style
}) => {
  const theme = useTheme();

  const sizeStyles = {
    tiny: {
      width: scale(40),
      height: scale(40),
      borderRadius: scale(20),
    },
    small: {
      width: scale(80),
      height: scale(80),
      borderRadius: scale(40),
    },
    medium: {
      width: scale(100),
      height: scale(100),
      borderRadius: scale(50),
    },
    large: {
      width: scale(120),
      height: scale(120),
      borderRadius: scale(60),
    },
  };

  const styles = StyleSheet.create({
    container: {
      width: sizeStyles[size].width,
      height: sizeStyles[size].height,
      borderRadius: sizeStyles[size].borderRadius,
      borderWidth: scale(3),
      borderColor: theme.colors.primary,
      justifyContent: "center",
      alignItems: "center",
      marginBottom: verticalScale(16),
      overflow: "hidden",
    },
    image: {
      width: "100%",
      height: "100%",
      borderRadius: sizeStyles[size].borderRadius,
    },
  });

  return (
    <View style={[styles.container, style]}>
        <Image
          source={{ uri: profilePicture }}
          style={styles.image}
          contentFit="cover"
          priority="normal"
          cachePolicy={"memory"}
          placeholder={"@/assets/images/user.png"}
          placeholderContentFit="scale-down"
        />
    </View>
  );
};

export default memo(ProfilePhoto);