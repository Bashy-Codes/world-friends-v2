import { useCallback } from "react";
import { useQuery } from "convex/react";
import { router } from "expo-router";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useTranslation } from "react-i18next";

export const useLetter = (letterId: Id<"letters">) => {
    const { t } = useTranslation();


  // Fetch letter data
  const letter = useQuery(api.communications.letters.getLetter, { letterId });

  // Loading state
  const isLoading = letter === undefined;

  // Error state (letter is null when query completes but letter not found)
  const hasError = letter === null;

  // Navigation handlers
  const handleBack = useCallback(() => {
    router.back();
  }, []);


const getTimeAgo = useCallback(() => {
  if (!letter) return "";

  const now = Date.now();
  const diffMs = now - letter.createdAt;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    if (diffHours === 0) {
      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      return diffMinutes <= 1 ? t('time.just_now') : `${diffMinutes} ${t('time.minutes')}`;
    }
    return diffHours === 1 ? `${t('time.hour')}` : `${diffHours} ${t('time.hours')}`;
  } else if (diffDays === 1) {
    return t('time.yesterday');
  } else if (diffDays < 7) {
    return `${diffDays} ${t('time.days')}`;
  } else if (diffDays < 30) {
    const diffWeeks = Math.floor(diffDays / 7);
    return diffWeeks === 1 ? `${t('time.week')}` : `${diffWeeks} ${t('time.weeks')}`;
  } else if (diffDays < 365) {
    const diffMonths = Math.floor(diffDays / 30);
    return diffMonths === 1 ? `${t('time.month')}` : `${diffMonths} ${t('time.months')}`;
  } else {
    const diffYears = Math.floor(diffDays / 365);
    return diffYears === 1 ? `${t('time.year')}` : `${diffYears} ${t('time.years')}`;
  }
}, [letter, t]);

  // Calculate days until delivery
  const getDaysUntilDelivery = useCallback(() => {
    if (!letter || letter.isDelivered) return "";
    const now = Date.now();
    const diffMs = letter.deliverAt - now;
    const days = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    return days === 1 ? "1 ☀️" : `${days} ☀️ 🌙`;
  }, [letter]);

  return {
    // Data
    letter,

    // States
    isLoading,
    hasError,

    // Handlers
    handleBack,

    // Utilities
    getTimeAgo,
    getDaysUntilDelivery,
  };
};