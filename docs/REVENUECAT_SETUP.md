# RevenueCat Setup Guide for WorldFriends

This guide will walk you through setting up RevenueCat for in-app purchases in your WorldFriends app.

## Prerequisites

Since this is an Expo managed workflow app, you'll need to:

1. **Export your project** and work locally (e.g., in Cursor or VS Code)
2. **Create development builds** using Expo Dev Client to test purchases

## Step 1: Create RevenueCat Account

1. Go to [RevenueCat Dashboard](https://app.revenuecat.com/signup)
2. Sign up for a free account
3. Create a new project called "WorldFriends"

## Step 2: Configure Your App in RevenueCat

### iOS Setup (App Store Connect)

1. **Create App in App Store Connect:**
   - Go to [App Store Connect](https://appstoreconnect.apple.com)
   - Create a new app with your bundle ID: `com.anonymous.worldfriends`
   - Fill in required app information

2. **Create In-App Purchase:**
   - In App Store Connect, go to your app → Features → In-App Purchases
   - Click "+" to create a new in-app purchase
   - Choose "Non-Consumable"
   - Product ID: `supporter_donation` (this matches the code)
   - Reference Name: `WorldFriends Supporter`
   - Price: $2.99 (Tier 3)
   - Add localizations for different languages

3. **Configure RevenueCat:**
   - In RevenueCat dashboard, go to Project Settings → Apps
   - Add iOS app with your bundle ID
   - Connect to App Store Connect (follow RevenueCat's guide)

### Android Setup (Google Play Console)

1. **Create App in Google Play Console:**
   - Go to [Google Play Console](https://play.google.com/console)
   - Create a new app with your package name: `com.anonymous.worldfriends`

2. **Create In-App Product:**
   - Go to Monetize → Products → In-app products
   - Create new product
   - Product ID: `supporter_donation`
   - Name: `WorldFriends Supporter`
   - Price: $2.99

3. **Configure RevenueCat:**
   - In RevenueCat dashboard, add Android app
   - Connect to Google Play Console

## Step 3: Configure Products in RevenueCat

1. **Create Entitlement:**
   - Go to RevenueCat dashboard → Entitlements
   - Create new entitlement: `supporter_status`
   - Description: "WorldFriends Supporter Status"

2. **Create Offering:**
   - Go to Offerings
   - Create new offering: `supporter_offering`
   - Add package: `supporter_donation`
   - Attach the `supporter_status` entitlement

## Step 4: Get API Keys

1. In RevenueCat dashboard, go to Project Settings → API Keys
2. Copy your API keys:
   - **Apple API Key** (for iOS)
   - **Google API Key** (for Android)

## Step 5: Update Your Code

Update the configuration in `lib/RevenueCat.ts`:

```typescript
const REVENUECAT_CONFIG = {
  apiKeys: {
    apple: 'appl_YOUR_ACTUAL_APPLE_API_KEY', // Replace with your Apple API key
    google: 'goog_YOUR_ACTUAL_GOOGLE_API_KEY', // Replace with your Google API key
  },
  entitlements: {
    supporter: 'supporter_status', // This should match your entitlement ID
  },
  offerings: {
    supporter: 'supporter_offering', // This should match your offering ID
  },
};
```

## Step 6: Export and Build Locally

Since RevenueCat requires native code:

1. **Export your Expo project:**
   ```bash
   npx expo export
   ```

2. **Install dependencies locally:**
   ```bash
   npm install react-native-purchases
   ```

3. **Create development build:**
   ```bash
   npx expo install expo-dev-client
   npx expo run:ios # for iOS
   npx expo run:android # for Android
   ```

## Step 7: Test Purchases

### iOS Testing
1. Create a sandbox tester account in App Store Connect
2. Sign out of your Apple ID in Settings
3. Test the purchase flow in your development build

### Android Testing
1. Add test accounts in Google Play Console
2. Upload a signed APK to Internal Testing
3. Test the purchase flow

## Step 8: Handle Purchase Success

When a purchase is successful, you should update the user's supporter status in your database. The current implementation includes a mutation for this:

```typescript
// This is already implemented in convex/profiles.ts
const updateSupporterStatus = mutation({
  args: { isSupporter: v.boolean() },
  handler: async (ctx, args) => {
    // Updates user's supporter status in database
  },
});
```

## Step 9: Production Setup

1. **Submit your app for review** in both App Store Connect and Google Play Console
2. **Make sure your in-app purchases are approved**
3. **Update RevenueCat configuration** to use production API keys
4. **Test with real purchases** before going live

## Important Notes

- **RevenueCat will NOT work in Bolt's browser preview** - it requires native code
- **Always test on real devices** with development builds
- **Sandbox testing is crucial** before production
- **Keep your API keys secure** - never commit them to version control
- **RevenueCat handles receipt validation** automatically
- **The integration includes restore purchases functionality** for users switching devices

## Troubleshooting

- **"Package not found" error:** Check your product IDs match between stores and RevenueCat
- **"Not initialized" error:** Make sure RevenueCat is properly initialized before making purchases
- **Purchase fails silently:** Check your entitlements and offerings configuration
- **Restore doesn't work:** Ensure you're testing with the same Apple ID/Google account used for purchase

## Support

- [RevenueCat Documentation](https://docs.revenuecat.com/)
- [RevenueCat Expo Guide](https://www.revenuecat.com/docs/getting-started/installation/expo)
- [RevenueCat Community](https://community.revenuecat.com/)

Remember: This is a one-time setup process. Once configured, RevenueCat handles all the complex billing logic for you!