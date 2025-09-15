// User age calculation utility

export const calculateAge = (birthdate: Date) => {
    const today = new Date();
    const birthDate = new Date(birthdate);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    return age;
  };

// Counter color utility for input validation
export const getCounterColor = (length: number, minLength: number, maxLength: number, theme: any) => {
  if (length === 0) return theme.colors.text;
  if (length > 0 && length < minLength) return theme.colors.error;
  if (length >= minLength && length < maxLength * 0.8) return theme.colors.success;
  if (length >= maxLength * 0.8 && length < maxLength) return theme.colors.warning;
  if (length >= maxLength) return theme.colors.error;
  return theme.colors.text;
};

// Delivery message utility for letters
export const getDeliveryMessage = (
  isSender: boolean,
  otherUserName: string,
  countryName: string,
  countryFlag: string,
  timeAgo: string,
  t: (key: string, options?: any) => string
) => {
  if (isSender) {
    // For sent letters: "Composed by you to be delivered to [user] in [country]"
    return t("letter.delivery.sent", {
      userName: otherUserName,
      timeAgo,
      countryName,
      countryFlag
    });
  } else {
    // For received letters: "Composed by [user] [time] from [country]"
    return t("letter.delivery.received", {
      userName: otherUserName,
      timeAgo,
      countryName,
      countryFlag
    });
  }
};
