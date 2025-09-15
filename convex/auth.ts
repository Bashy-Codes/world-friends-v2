import { Password } from "@convex-dev/auth/providers/Password";
import { convexAuth } from "@convex-dev/auth/server";
import { MutationCtx } from "./_generated/server";
import { ResendOTP } from "./ResendOTP";

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
providers: [Password({ verify: ResendOTP })],
  callbacks: {
    async createOrUpdateUser(ctx: MutationCtx, args) {
      // If user already exists, just return the existing user ID
      if (args.existingUserId) {
        return args.existingUserId;
      }

      // Create a new user with required fields and default values
      const userId = await ctx.db.insert("users", {
        // Auth-related fields
        email: args.profile.email as string | undefined,
        emailVerificationTime: args.profile.emailVerificationTime as number | undefined,

        // Required fields with default values - these will be updated during profile creation
        userName: "",
        name: "",
        profilePicture: "",
        gender: "other",
        birthDate: "", 
        country: "", 
        isAdmin: false, // Default to non-admin
        isSupporter: false, // Default to non-supporter
      });

      return userId;
    },
  },
});
