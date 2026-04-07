import { supabase } from "../lib/supabase";

export const signInWithGoogle = async () => {
  return supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: "http://localhost:5173/dashboard",
    },
  });
};

export const signInWithGithub = async () => {
  return supabase.auth.signInWithOAuth({
    provider: "github",
    options: {
      redirectTo: "http://localhost:5173/dashboard",
    },
  });
};

export const signOut = async () => {
  return supabase.auth.signOut();
};
