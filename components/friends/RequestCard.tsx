import type React from "react";
import { memo, useCallback, useState } from "react";
import { View, Text, StyleSheet, Modal } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { scale, verticalScale, moderateScale } from "react-native-size-matters";
import { useTheme } from "@/lib/Theme";
import { getCountryByCode } from "@/constants/geographics";
import type { Request } from "@/types/friendships";
import { Id } from "@/convex/_generated/dataModel";
import AgeGenderChip from "../ui/AgeGenderChip";
import { Button } from "../ui/Button";
import ProfilePhoto from "../ui/ProfilePhoto";

interface RequestCardProps {
  request: Request;
  onAccept: (requestId: Id<"friendRequests">) => void;
  onDecline: (requestId: Id<"friendRequests">) => void;
}

const RequestCardComponent: React.FC<RequestCardProps> = ({
  request,
  onAccept,
  onDecline,
}) => {
  const theme = useTheme();
  const [showMessageModal, setShowMessageModal] = useState(false);

  const country = getCountryByCode(request.country);

  const handleReadMessage = useCallback(() => {
    setShowMessageModal(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setShowMessageModal(false);
  }, []);

  const handleAccept = useCallback(() => {
    onAccept(request.requestId);
    setShowMessageModal(false);
  }, [request.requestId, onAccept]);

  const handleDecline = useCallback(() => {
    onDecline(request.requestId);
    setShowMessageModal(false);
  }, [request.requestId, onDecline]);

  const styles = StyleSheet.create({
    card: {
      backgroundColor: theme.colors.surface,
      borderRadius: scale(theme.borderRadius.lg),
      marginHorizontal: scale(16),
      marginVertical: verticalScale(8),
      padding: scale(16),
      shadowColor: theme.colors.shadow,
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 4,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: verticalScale(12),
    },
    userInfo: {
      flex: 1,
    },
    name: {
      fontSize: moderateScale(16),
      fontWeight: "700",
      color: theme.colors.text,
      marginBottom: verticalScale(2),
    },
    countryContainer: {
      flexDirection: "row",
      alignItems: "center",
      marginTop: verticalScale(8),
      gap: scale(6),
    },
    flagEmoji: {
      fontSize: moderateScale(16),
    },
    countryText: {
      fontSize: moderateScale(14),
      color: theme.colors.textSecondary,
      fontWeight: "500",
    },
    actionsContainer: {
      flexDirection: "row",
      gap: scale(12),
      marginTop: verticalScale(12),
    },
    // Modal styles
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalContainer: {
      backgroundColor: theme.colors.surface,
      borderRadius: scale(theme.borderRadius.xl),
      width: '90%',
      maxWidth: scale(400),
      padding: scale(24),
      shadowColor: theme.colors.shadow,
      shadowOffset: {
        width: 0,
        height: 12,
      },
      shadowOpacity: 0.3,
      shadowRadius: 20,
      elevation: 20,
    },
    modalHeader: {
      alignItems: 'center',
      marginBottom: verticalScale(20),
    },
    messageContainer: {
      backgroundColor: theme.colors.background,
      borderRadius: scale(theme.borderRadius.md),
      padding: scale(16),
      marginBottom: verticalScale(20),
    },
    messageText: {
      fontSize: moderateScale(16),
      color: theme.colors.text,
      lineHeight: moderateScale(22),
    },
    modalActionsContainer: {
      flexDirection: 'row',
      gap: scale(12),
    },
  });

  return (
    <>
      <View style={styles.card}>
        {/* Header with profile info */}
        <View style={styles.header}>
            <ProfilePhoto
              profilePicture={request.profilePicture}
            />
          <View style={{ flex:1 }}>
            <Text style={styles.name}>{request.name}</Text>
            <AgeGenderChip
              size="small"
              gender={request.gender}
              age={request.age}
              />
          </View>
        </View>

        {/* Country info */}
        <View style={styles.countryContainer}>
          <Text style={styles.flagEmoji}>{country?.flag}</Text>
          <Text style={styles.countryText}>
            {country?.name}
          </Text>
        </View>

        {/* Action buttons */}
        <View style={styles.actionsContainer}>
        <Button
          iconName="mail-open"
          onPress={handleReadMessage}
          />
        </View>
      </View>

      {/* Message Modal */}
      <Modal
        visible={showMessageModal}
        transparent
        animationType="fade"
        onRequestClose={handleCloseModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Ionicons
                name="reader"
                size={scale(76)}
                color={theme.colors.primary}
              />
            </View>

            <View style={styles.messageContainer}>
              <Text style={styles.messageText}>
               {request.requestMessage}
              </Text>
            </View>

            <View style={styles.modalActionsContainer}>
              <Button
              iconName="close"
              onPress={handleDecline}
              bgColor={theme.colors.error}
              style={{flex:1}}
              />

              <Button
              iconName="checkmark"
              onPress={handleAccept}
               style={{flex:1}}
              />
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

export const RequestCard = memo(RequestCardComponent);
