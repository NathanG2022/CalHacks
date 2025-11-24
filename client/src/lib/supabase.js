import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const signIn = async (email, password) => {
  return await supabase.auth.signInWithPassword({
    email,
    password,
  });
};

export const signUp = async (email, password, name) => {
  return await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name: name,  // Store name in user_metadata
      }
    }
  });
};

export const signOut = async () => {
  return await supabase.auth.signOut();
};

export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  return { user };
};

export const signInWithGoogle = async () => {
  return await supabase.auth.signInWithOAuth({
    provider: 'google',
  });
};

export const signInWithMicrosoft = async () => {
  return await supabase.auth.signInWithOAuth({
    provider: 'azure',
  });
};











