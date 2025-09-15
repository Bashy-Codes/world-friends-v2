import React from "react";
import { View } from "react-native";
import { useTranslation } from "react-i18next";
import { ProfileItem } from "./ProfileItem";

interface ProfileSectionProps {
  aboutMe: string;
  spokenLanguageCodes: string[];
  learningLanguageCodes: string[];
  hobbies: string[];
}

export const ProfileSection: React.FC<ProfileSectionProps> = ({
  aboutMe,
  spokenLanguageCodes,
  learningLanguageCodes,
  hobbies,
}) => {
  const { t } = useTranslation();
  return (
    <View>
      <ProfileItem
        type="about"
        title={t("profile.items.aboutMe")}
        icon="person-circle"
        data={{ aboutMe }}
      />
      <ProfileItem
        type="languages"
        title={t("profile.items.languages")}
        icon="language"
        data={{
          spokenLanguages: spokenLanguageCodes,
          learningLanguages: learningLanguageCodes,
        }}
      />
      <ProfileItem
        type="hobbies"
        title={t("profile.items.hobbies")}
        icon="heart"
        data={{ hobbies }}
      />
    </View>
  );
};
