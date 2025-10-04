export const gradientPresets = {
  blueTeal: ['rgba(203,230,246,1)', 'rgba(143,228,201,1)'] as [string, string, ...string[]],
  peachPink: ['rgba(255,218,185,1)', 'rgba(255,182,193,1)'] as [string, string, ...string[]],
  lavenderPurple: ['rgba(221,214,243,1)', 'rgba(196,181,253,1)'] as [string, string, ...string[]], //TO DO add retail colors
};
interface SettingsContextType {
  isDarkMode: boolean;              // Is dark mode on?
  isPerformanceMode: boolean;       // Is performance mode on?
  isSimpleMode: boolean;            // Is simple mode on?
  toggleDarkMode: () => void;       // Function to turn dark mode on/off
  togglePerformanceMode: () => void;
  toggleSimpleMode: () => void;
}
