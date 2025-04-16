import { supabase } from './supabaseClient';

export const profileService = {
  // Get user profile
  async getProfile() {
    const user = supabase.auth.user();
    if (!user) throw new Error('User not authenticated');
    
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    
    if (error) throw error;
    return data;
  },
  
  // Update user profile
  async updateProfile(profileData) {
    const user = supabase.auth.user();
    if (!user) throw new Error('User not authenticated');
    
    const { data, error } = await supabase
      .from('profiles')
      .update(profileData)
      .eq('id', user.id);
    
    if (error) throw error;
    return data[0];
  },
  
  // Upload profile picture
  async uploadProfilePicture(file) {
    const user = supabase.auth.user();
    if (!user) throw new Error('User not authenticated');
    
    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}.${fileExt}`;
    const filePath = `profile-pictures/${fileName}`;
    
    // Upload the file
    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file, { upsert: true });
    
    if (uploadError) throw uploadError;
    
    // Get the public URL
    const { publicURL, error: urlError } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath);
    
    if (urlError) throw urlError;
    
    // Update the profile with the new picture URL
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ profile_picture: publicURL })
      .eq('id', user.id);
    
    if (updateError) throw updateError;
    
    return publicURL;
  },
  
  // Get login history
  async getLoginHistory() {
    const user = supabase.auth.user();
    if (!user) throw new Error('User not authenticated');
    
    const { data, error } = await supabase
      .from('login_history')
      .select('*')
      .eq('user_id', user.id)
      .order('timestamp', { ascending: false });
    
    if (error) throw error;
    return data || [];
  }
};
