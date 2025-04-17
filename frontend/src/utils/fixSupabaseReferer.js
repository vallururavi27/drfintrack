/**
 * Utility to fix the Supabase referer issue
 * 
 * This function checks if the current URL is the production URL
 * and updates the localStorage to indicate that the app should
 * use the production URL as the referer for Supabase requests
 */
export const fixSupabaseReferer = () => {
  try {
    // Check if we're on the production domain
    const isProduction = window.location.hostname === 'drfintrack.vercel.app';
    
    // Store this information in localStorage
    if (isProduction) {
      localStorage.setItem('useProductionReferer', 'true');
      console.log('Set to use production referer for Supabase requests');
    } else {
      localStorage.removeItem('useProductionReferer');
      console.log('Using default referer for Supabase requests');
    }
    
    return isProduction;
  } catch (error) {
    console.error('Error fixing Supabase referer:', error);
    return false;
  }
};
