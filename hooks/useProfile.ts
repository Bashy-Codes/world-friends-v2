import { useCallback } from "react"
import { useRouter } from "expo-router"
import { useQuery, useConvexAuth } from "convex/react"
import { useTheme } from "@/lib/Theme"
import { api } from "@/convex/_generated/api"

export const useProfile = () => {
  const theme = useTheme()
  const router = useRouter()

  // Check if user is authenticated
  const { isAuthenticated } = useConvexAuth()

  // Get current user profile from Convex - only if authenticated
  const Profile = useQuery(api.users.getCurrentProfile, isAuthenticated ? {} : "skip")

  const isLoading = Profile === undefined

  const handleSettingsPress = useCallback(() => {
    router.push("/screens/settings")
  }, [router])

  return {
    // Profile data and states
    Profile,
    isLoading,

    // Theme
    theme,

    // Navigation handlers
    handleSettingsPress,
  }
}
