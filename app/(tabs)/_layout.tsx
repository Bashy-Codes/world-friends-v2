import { createBottomTabNavigator } from "@react-navigation/bottom-tabs"
import { CustomTabBar } from "@/components/CustomTabBar"

import HomeTab from "./index"
import DiscoverTab from "./discover"
import FriendsTab from "./friends"
import ConversationsTab from "./conversations"
import ProfileTab from "./profile"

const Tab = createBottomTabNavigator()

export default function TabLayout() {
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        tabBarHideOnKeyboard: true,
      }}
    >
      <Tab.Screen name="index" component={HomeTab} />
      <Tab.Screen name="discover" component={DiscoverTab} />
      <Tab.Screen name="friends" component={FriendsTab} />
      <Tab.Screen name="conversations" component={ConversationsTab} />
      <Tab.Screen name="profile" component={ProfileTab} />
    </Tab.Navigator>
  )
}
