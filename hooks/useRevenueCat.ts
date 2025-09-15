import { useState, useEffect, useCallback } from 'react';
import { Platform } from 'react-native';
import {
  initializeRevenueCat,
  getSupporterPackage,
  purchaseSupporterPackage,
  checkSupporterStatus,
  restorePurchases,
  getCustomerInfo
} from '@/lib/RevenueCat';
import { PurchasesPackage, CustomerInfo } from 'react-native-purchases';
import Toast from 'react-native-toast-message';
import { useTranslation } from 'react-i18next';

interface UseRevenueCatReturn {
  // State
  isInitialized: boolean;
  isLoading: boolean;
  isPurchasing: boolean;
  isRestoring: boolean;
  supporterPackage: PurchasesPackage | null;
  isSupporterActive: boolean;
  customerInfo: CustomerInfo | null;

  // Actions
  initializeSDK: (userId?: string) => Promise<void>;
  makePurchase: () => Promise<boolean>;
  restoreUserPurchases: () => Promise<boolean>;
  refreshSupporterStatus: () => Promise<void>;
}

/**
 * Custom hook for managing RevenueCat integration
 * 
 * This hook provides:
 * - SDK initialization
 * - Purchase handling
 * - Supporter status checking
 * - Purchase restoration
 * - Loading states
 */
export const useRevenueCat = (): UseRevenueCatReturn => {
  const { t } = useTranslation();

  // State
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [supporterPackage, setSupporterPackage] = useState<PurchasesPackage | null>(null);
  const [isSupporterActive, setIsSupporterActive] = useState(false);
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null);

  /**
   * Initialize RevenueCat SDK
   */
  const initializeSDK = useCallback(async (userId?: string) => {
    if (isInitialized) return;

    try {
      setIsLoading(true);

      // Initialize RevenueCat
      await initializeRevenueCat(userId);
      setIsInitialized(true);
      console.log("RevenueCat initialized successfully")

      // Load supporter package
      const supporterPackage = await getSupporterPackage();
      setSupporterPackage(supporterPackage);

      // Check current supporter status
      const isSupporter = await checkSupporterStatus();
      setIsSupporterActive(isSupporter);

      // Get customer info
      const info = await getCustomerInfo();
      setCustomerInfo(info);

    } catch (error) {
      console.error('Failed to initialize RevenueCat:', error);
      Toast.show({
        type: 'error',
        text1: 'Initialization Failed',
        text2: 'Failed to initialize payment system',
      });
    } finally {
      setIsLoading(false);
    }
  }, [isInitialized]);

  /**
   * Make a purchase
   */
  const makePurchase = useCallback(async (): Promise<boolean> => {
    if (!isInitialized || !supporterPackage) {
      Toast.show({
        type: 'error',
        text1: 'Not Ready',
        text2: 'Payment system not ready. Please try again.',
      });
      return false;
    }

    try {
      setIsPurchasing(true);

      const result = await purchaseSupporterPackage();

      if (result.success) {
        // Update supporter status
        setIsSupporterActive(true);
        setCustomerInfo(result.customerInfo || null);

        Toast.show({
          type: 'success',
          text1: 'Thank You! ❤️',
          text2: 'You are now a WorldFriends supporter!',
        });

        return true;
      } else {
        // Handle purchase errors
        if (result.error !== 'Purchase was cancelled') {
          Toast.show({
            type: 'error',
            text1: 'Purchase Failed',
            text2: result.error || 'Something went wrong',
          });
        }

        return false;
      }
    } catch (error) {
      console.error('Purchase error:', error);
      Toast.show({
        type: 'error',
        text1: 'Purchase Failed',
        text2: 'An unexpected error occurred',
      });
      return false;
    } finally {
      setIsPurchasing(false);
    }
  }, [isInitialized, supporterPackage]);

  /**
   * Restore purchases
   */
  const restoreUserPurchases = useCallback(async (): Promise<boolean> => {
    if (!isInitialized) {
      Toast.show({
        type: 'error',
        text1: 'Not Ready',
        text2: 'Payment system not ready. Please try again.',
      });
      return false;
    }

    try {
      setIsRestoring(true);

      const result = await restorePurchases();

      if (result.success) {
        // Check if supporter status was restored
        const isSupporter = await checkSupporterStatus();
        setIsSupporterActive(isSupporter);
        setCustomerInfo(result.customerInfo || null);

        if (isSupporter) {
          Toast.show({
            type: 'success',
            text1: 'Purchases Restored',
            text2: 'Your supporter status has been restored!',
          });
        } else {
          Toast.show({
            type: 'info',
            text1: 'No Purchases Found',
            text2: 'No previous purchases to restore',
          });
        }

        return true;
      } else {
        Toast.show({
          type: 'error',
          text1: 'Restore Failed',
          text2: result.error || 'Failed to restore purchases',
        });
        return false;
      }
    } catch (error) {
      console.error('Restore error:', error);
      Toast.show({
        type: 'error',
        text1: 'Restore Failed',
        text2: 'An unexpected error occurred',
      });
      return false;
    } finally {
      setIsRestoring(false);
    }
  }, [isInitialized]);

  /**
   * Refresh supporter status
   */
  const refreshSupporterStatus = useCallback(async () => {
    if (!isInitialized) return;

    try {
      const isSupporter = await checkSupporterStatus();
      setIsSupporterActive(isSupporter);

      const info = await getCustomerInfo();
      setCustomerInfo(info);
    } catch (error) {
      console.error('Failed to refresh supporter status:', error);
    }
  }, [isInitialized]);

  return {
    // State
    isInitialized,
    isLoading,
    isPurchasing,
    isRestoring,
    supporterPackage,
    isSupporterActive,
    customerInfo,

    // Actions
    initializeSDK,
    makePurchase,
    restoreUserPurchases,
    refreshSupporterStatus,
  };
};