import React from "react";
import { SystemBars } from "react-native-edge-to-edge";
import { useIsDark } from "@/lib/Theme";

interface SystemBarsProviderProps {
  children: React.ReactNode;
}

/**
 * SystemBarsProvider component that provides the SystemBars configuration
 * based on the current theme.
 *
 * This component handles:
 * - StatusBar and NavigationBar style updates
 * - Edge-to-edge compatible system bars
 * - Immediate rendering without blocking UI
 *
 */
export const SystemBarsProvider: React.FC<SystemBarsProviderProps> = ({ children }) => {
  const isDark = useIsDark();

  return (
    <>
      <SystemBars style={isDark ? "light" : "dark"} />
      {children}
    </>
  );
};
