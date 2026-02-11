/**
 * Theme utilities for admin pages
 * Provides consistent theme-aware styling across all admin components
 */

export type Theme = 'light' | 'dark'

export const getThemeClasses = (theme: Theme) => ({
  // Main backgrounds
  bgGradient: theme === 'dark'
    ? 'bg-gradient-to-b from-[#0f0e13] to-[#1a1625]'
    : 'bg-gradient-to-b from-gray-50 to-gray-100',

  // Text colors
  textPrimary: theme === 'dark' ? 'text-white' : 'text-gray-900',
  textSecondary: theme === 'dark' ? 'text-gray-300' : 'text-gray-700',
  textMuted: theme === 'dark' ? 'text-gray-400' : 'text-gray-600',

  // Card and containers
  card: theme === 'dark'
    ? 'bg-[var(--card-bg,#11131a)] border-white/10'
    : 'bg-white border-gray-200',

  // Inputs
  input: theme === 'dark'
    ? 'bg-white/5 border-white/10 text-white placeholder-gray-500'
    : 'bg-gray-100 border-gray-300 text-gray-900 placeholder-gray-600',

  // Buttons
  buttonGhost: theme === 'dark'
    ? 'bg-white/5 border border-white/10 text-white hover:bg-white/10 hover:border-white/20'
    : 'bg-gray-200 border border-gray-300 text-gray-900 hover:bg-gray-300 hover:border-gray-400',

  buttonIcon: theme === 'dark'
    ? 'border-white/20 bg-white/10 text-white hover:border-white/30 hover:bg-white/20'
    : 'border-gray-300 bg-gray-200 text-gray-700 hover:border-gray-400 hover:bg-gray-300',

  // Filters
  filterInactive: theme === 'dark'
    ? 'bg-white/5 border border-white/10 text-white hover:bg-white/10'
    : 'bg-gray-200 border border-gray-300 text-gray-900 hover:bg-gray-300',

  // Table/List
  tableHeader: theme === 'dark'
    ? 'from-white/10 to-transparent border-[rgba(201,162,77,0.2)] text-gray-200'
    : 'from-amber-100 to-transparent border-amber-200 text-gray-700',

  tableRow: theme === 'dark'
    ? 'border-white/5 hover:bg-white/5'
    : 'border-gray-200 hover:bg-gray-50',

  tableRowEmpty: theme === 'dark' ? 'text-gray-400' : 'text-gray-600',

  // Badges
  badgeInactive: theme === 'dark'
    ? 'bg-white/5 border border-white/10'
    : 'bg-gray-200 border border-gray-300',

  // Forms
  formLabel: theme === 'dark' ? 'text-white' : 'text-gray-900',
})

export const useThemeClasses = (theme: Theme) => getThemeClasses(theme)
