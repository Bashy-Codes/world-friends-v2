import React, { memo } from "react";
import { View, StyleSheet, ViewStyle } from "react-native";
import { Image } from "expo-image";
import { scale } from "react-native-size-matters";
import { useTheme } from "@/lib/Theme";

interface ProfilePictureProps {
  profilePicture?: string;
  size?: number;
  style?: ViewStyle;
}

export const ProfilePicture = memo<ProfilePictureProps>(
  ({
    profilePicture,
    size = 60,
    style,
  }) => {
    const theme = useTheme();

    const containerSize = scale(size);

    const styles = StyleSheet.create({
      container: {
        width: containerSize,
        height: containerSize,
        borderRadius: containerSize / 2,
        position: "relative",
      },
      image: {
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        borderRadius: containerSize / 2,
        backgroundColor: theme.colors.surface,
        zIndex: 2,
      },

    });

    return (
      <View style={[styles.container, style]}>
        <Image
          source={{ uri: profilePicture }}
          style={styles.image}
          contentFit="cover"
          cachePolicy={"memory-disk"}
          priority={"normal"}
          placeholder={require("@/assets/images/user.png")}
          placeholderContentFit="cover"
        />
      </View>
    );
  }
);

ProfilePicture.displayName = "ProfilePicture";
