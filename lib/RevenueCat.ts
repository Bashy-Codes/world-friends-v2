import Purchases, {
  PurchasesOffering,
  PurchasesPackage,
  CustomerInfo,
} from 'react-native-purchases';
import { Platform } from 'react-native';

// RevenueCat configuration
const REVENUECAT_CONFIG = {
  
  // You'll need to replace these with your actual API keys from RevenueCat dashboard
  apiKeys: {
    apple: 'appl_YOUR_APPLE_API_KEY', // Replace with your Apple API key
    google: 'goog_HveuqiqhyWQwsXRkbMPptyXxhry', // Replace with your Google API key
  },
  // Your entitlement identifier from RevenueCat dashboard
  entitlements: {
    supporter: 'supporter', // Replace with your entitlement ID
  },
  // Your offering identifier from RevenueCat dashboard
  offerings: {
    supporter: 'supporter_donation', // Replace with your offering ID
  },
};

/**
 * Initialize RevenueCat SDK
 * Call this once when your app starts
 */
export const initializeRevenueCat = async (userId?: string): Promise<void> => {
  try {
    const apiKey = Platform.OS === 'ios'
      ? REVENUECAT_CONFIG.apiKeys.apple
      : REVENUECAT_CONFIG.apiKeys.google;
    
    Purchases.setLogLevel(Purchases.LOG_LEVEL.DEBUG); // For testing in dev
    
    // Configure RevenueCat
    await Purchases.configure({ apiKey });

    // Set user ID if provided (for tracking purchases across devices)
    if (userId) {
      await Purchases.logIn(userId);
    }

    console.log('RevenueCat initialized successfully');
  } catch (error) {
    console.error('Failed to initialize RevenueCat:', error);
    throw error;
  }
};

/**
 * Get available offerings (products) from RevenueCat
 */
export const getOfferings = async (): Promise<PurchasesOffering | null> => {
  try {
    const offerings = await Purchases.getOfferings();
    return offerings.current;
  } catch (error) {
    console.error('Failed to get offerings:', error);
    return null;
  }
};

/**
 * Get supporter package from offerings
 */
export const getSupporterPackage = async (): Promise<PurchasesPackage | null> => {
  try {
    const offering = await getOfferings();
    if (!offering) return null;

    // Find the supporter package (you can customize this based on your package identifier)
    const supporterPackage = offering.availablePackages.find(
      pkg => pkg.identifier === 'supporter_donation' // Replace with your package identifier
    );

    return supporterPackage || null;
  } catch (error) {
    console.error('Failed to get supporter package:', error);
    return null;
  }
};

/**
 * Purchase the supporter package
 */
export const purchaseSupporterPackage = async (): Promise<{
  success: boolean;
  customerInfo?: CustomerInfo;
  error?: string;
}> => {
  try {
    const supporterPackage = await getSupporterPackage();

    if (!supporterPackage) {
      return {
        success: false,
        error: 'Supporter package not available',
      };
    }

    // Make the purchase
    const { customerInfo } = await Purchases.purchasePackage(supporterPackage);

    return {
      success: true,
      customerInfo,
    };
  } catch (error) {
    console.error('Purchase failed:', error);
    return {
      success: false,
      error: 'An unexpected error occurred',
    };
  }
};

/**
 * Check if user has supporter status
 */
export const checkSupporterStatus = async (): Promise<boolean> => {
  try {
    const customerInfo = await Purchases.getCustomerInfo();
    return customerInfo.entitlements.active[REVENUECAT_CONFIG.entitlements.supporter] !== undefined;
  } catch (error) {
    console.error('Failed to check supporter status:', error);
    return false;
  }
};

/**
 * Restore purchases (for users who already purchased)
 */
export const restorePurchases = async (): Promise<{
  success: boolean;
  customerInfo?: CustomerInfo;
  error?: string;
}> => {
  try {
    const customerInfo = await Purchases.restorePurchases();
    return {
      success: true,
      customerInfo,
    };
  } catch (error) {
    console.error('Failed to restore purchases:', error);
    return {
      success: false,
      error: 'Failed to restore purchases',
    };
  }
};

/**
 * Get customer info
 */
export const getCustomerInfo = async (): Promise<CustomerInfo | null> => {
  try {
    return await Purchases.getCustomerInfo();
  } catch (error) {
    console.error('Failed to get customer info:', error);
    return null;
  }
};

/**
 * Log out user from RevenueCat (call when user logs out of your app)
 */
export const logOutRevenueCat = async (): Promise<void> => {
  try {
    await Purchases.logOut();
  } catch (error) {
    console.error('Failed to log out from RevenueCat:', error);
  }
};