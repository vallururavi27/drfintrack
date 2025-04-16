/**
 * Theme utility functions for handling light/dark/system mode and custom colors
 */

// Theme modes
export const THEME_MODES = {
  LIGHT: 'light',
  DARK: 'dark',
  SYSTEM: 'system'
};

// Default theme colors
export const DEFAULT_COLORS = {
  primary: '#00af91',    // Primary brand color
  secondary: '#0077C5',  // Secondary brand color
  accent: '#3b82f6',     // Accent color for highlights
  success: '#22c55e',    // Success indicators
  warning: '#f59e0b',    // Warning indicators
  danger: '#ef4444',     // Error/danger indicators
  background: {
    light: '#f9fafb',    // Light mode background
    dark: '#111827'      // Dark mode background
  },
  text: {
    light: '#1f2937',    // Light mode text
    dark: '#f9fafb'       // Dark mode text
  }
};

/**
 * Check if the system prefers dark mode
 * @returns {boolean} - True if system prefers dark mode
 */
export const systemPrefersDark = () => {
  return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
};

/**
 * Get custom colors from localStorage or return defaults
 * @returns {Object} - Custom colors object
 */
export const getCustomColors = () => {
  const savedColors = localStorage.getItem('customColors');
  if (savedColors) {
    try {
      return JSON.parse(savedColors);
    } catch (e) {
      console.error('Error parsing custom colors:', e);
    }
  }
  return DEFAULT_COLORS;
};

/**
 * Save custom colors to localStorage
 * @param {Object} colors - Custom colors object
 */
export const saveCustomColors = (colors) => {
  localStorage.setItem('customColors', JSON.stringify(colors));
  applyCustomColors(colors);
};

/**
 * Apply custom colors to CSS variables
 * @param {Object} colors - Custom colors object
 */
export const applyCustomColors = (colors = null) => {
  const customColors = colors || getCustomColors();
  const root = document.documentElement;

  // Set CSS variables for colors
  root.style.setProperty('--color-primary', customColors.primary);
  root.style.setProperty('--color-secondary', customColors.secondary);
  root.style.setProperty('--color-accent', customColors.accent);
  root.style.setProperty('--color-success', customColors.success);
  root.style.setProperty('--color-warning', customColors.warning);
  root.style.setProperty('--color-danger', customColors.danger);

  // Background and text colors depend on current theme
  const isDark = root.classList.contains('dark');
  root.style.setProperty('--color-background', isDark ?
    customColors.background.dark : customColors.background.light);
  root.style.setProperty('--color-text', isDark ?
    customColors.text.dark : customColors.text.light);
};

/**
 * Apply theme based on the selected mode
 * @param {string} mode - The theme mode (light, dark, or system)
 */
export const applyTheme = (mode) => {
  let isDark = false;

  if (mode === THEME_MODES.DARK) {
    isDark = true;
  } else if (mode === THEME_MODES.SYSTEM) {
    isDark = systemPrefersDark();
  }

  const customColors = getCustomColors();

  if (isDark) {
    document.documentElement.classList.add('dark');
    document.body.style.backgroundColor = customColors.background.dark;
  } else {
    document.documentElement.classList.remove('dark');
    document.body.style.backgroundColor = customColors.background.light;
  }

  // Apply custom colors after theme change
  applyCustomColors(customColors);
};

/**
 * Set the theme mode and apply it
 * @param {string} mode - The theme mode to set (light, dark, or system)
 */
export const setThemeMode = (mode) => {
  localStorage.setItem('themeMode', mode);
  applyTheme(mode);
};

/**
 * Get the current theme mode
 * @returns {string} - The current theme mode (light, dark, or system)
 */
export const getThemeMode = () => {
  const savedMode = localStorage.getItem('themeMode');
  if (savedMode && Object.values(THEME_MODES).includes(savedMode)) {
    return savedMode;
  }
  return THEME_MODES.SYSTEM; // Default to system preference
};

/**
 * Check if dark mode is currently active
 * @returns {boolean} - True if dark mode is active
 */
export const isDarkMode = () => {
  const mode = getThemeMode();
  if (mode === THEME_MODES.DARK) return true;
  if (mode === THEME_MODES.LIGHT) return false;
  return systemPrefersDark();
};

/**
 * Reset custom colors to defaults
 */
export const resetCustomColors = () => {
  saveCustomColors(DEFAULT_COLORS);
};

/**
 * Initialize theme based on saved preference or system preference
 */
export const initializeTheme = () => {
  // Set up listener for system preference changes
  if (window.matchMedia) {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', () => {
      if (getThemeMode() === THEME_MODES.SYSTEM) {
        applyTheme(THEME_MODES.SYSTEM);
      }
    });
  }

  // Apply the current theme
  applyTheme(getThemeMode());

  // Apply custom colors
  applyCustomColors();
};

