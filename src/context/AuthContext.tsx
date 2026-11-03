import React, { createContext, useContext, useEffect, useState } from 'react';
import { UserProfile } from '../types/user';
import { supabase, isSupabaseConfigured } from '../services/supabase';
import { storageService } from '../services/storage';

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  isSupabaseConnected: boolean;
  signInAsGuest: () => void;
  signInWithEmail: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  signUpWithEmail: (email: string, pass: string, name?: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  updateTimezone: (tz: string) => void;
  updateProfileName: (name: string) => void;
}

const GUEST_STORAGE_KEY = 'a2z_tracker_guest_user';
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Initialize auth
  useEffect(() => {
    async function initAuth() {
      if (isSupabaseConfigured && supabase) {
        try {
          const { data } = await supabase.auth.getSession();
          if (data?.session?.user) {
            const u = data.session.user;
            setUser({
              id: u.id,
              email: u.email || '',
              display_name: u.user_metadata?.full_name || u.email?.split('@')[0] || 'Engineer',
              is_guest: false,
              timezone: localStorage.getItem('a2z_user_timezone') || 'Asia/Kolkata',
              created_at: u.created_at,
            });
            setLoading(false);
            return;
          }
        } catch (err) {
          console.warn('Supabase auth session check failed:', err);
        }

        // Listen for auth changes
        const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
          if (session?.user) {
            const u = session.user;
            const newUser: UserProfile = {
              id: u.id,
              email: u.email || '',
              display_name: u.user_metadata?.full_name || u.email?.split('@')[0] || 'Engineer',
              is_guest: false,
              timezone: localStorage.getItem('a2z_user_timezone') || 'Asia/Kolkata',
              created_at: u.created_at,
            };
            setUser(newUser);
            // Migrate local guest progress to this authenticated user
            await storageService.migrateLocalToRemote(u.id);
          } else {
            // Check for guest user
            loadGuestSession();
          }
        });

        // Cleanup listener on unmount
        return () => {
          authListener.subscription.unsubscribe();
        };
      }

      loadGuestSession();
      setLoading(false);
    }

    initAuth();
  }, []);

  function loadGuestSession() {
    const saved = localStorage.getItem(GUEST_STORAGE_KEY);
    if (saved) {
      try {
        setUser(JSON.parse(saved));
        setLoading(false);
        return;
      } catch {
        // invalid JSON
      }
    }
    // Default guest session so the user can immediately use the tracker!
    const defaultGuest: UserProfile = {
      id: 'guest_user',
      email: 'guest@a2ztracker.local',
      display_name: 'DSA Explorer',
      is_guest: true,
      timezone: localStorage.getItem('a2z_user_timezone') || 'Asia/Kolkata',
      created_at: new Date().toISOString(),
    };
    setUser(defaultGuest);
    localStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify(defaultGuest));
    setLoading(false);
  }

  const signInAsGuest = () => {
    loadGuestSession();
  };

  const signInWithEmail = async (email: string, pass: string) => {
    if (!isSupabaseConfigured || !supabase) {
      // Local simulated auth if Supabase credentials are not active
      const localUser: UserProfile = {
        id: `user_${email.replace(/[^a-zA-Z0-9]/g, '_')}`,
        email,
        display_name: email.split('@')[0],
        is_guest: false,
        timezone: localStorage.getItem('a2z_user_timezone') || 'Asia/Kolkata',
        created_at: new Date().toISOString(),
      };
      setUser(localUser);
      localStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify(localUser));
      return { success: true };
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password: pass,
      });
      if (error) {
        return { success: false, error: error.message };
      }
      if (data?.user) {
        const u = data.user;
        setUser({
          id: u.id,
          email: u.email || email,
          display_name: u.user_metadata?.full_name || email.split('@')[0],
          is_guest: false,
          timezone: localStorage.getItem('a2z_user_timezone') || 'Asia/Kolkata',
          created_at: u.created_at,
        });
        await storageService.migrateLocalToRemote(u.id);
      }
      return { success: true };
    } catch (err) {
      return { success: false, error: (err as Error).message };
    }
  };

  const signUpWithEmail = async (email: string, pass: string, name?: string) => {
    if (!isSupabaseConfigured || !supabase) {
      const localUser: UserProfile = {
        id: `user_${email.replace(/[^a-zA-Z0-9]/g, '_')}`,
        email,
        display_name: name || email.split('@')[0],
        is_guest: false,
        timezone: localStorage.getItem('a2z_user_timezone') || 'Asia/Kolkata',
        created_at: new Date().toISOString(),
      };
      setUser(localUser);
      localStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify(localUser));
      return { success: true };
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password: pass,
        options: {
          data: {
            full_name: name || email.split('@')[0],
          },
        },
      });
      if (error) {
        return { success: false, error: error.message };
      }
      if (data?.user) {
        const u = data.user;
        setUser({
          id: u.id,
          email: u.email || email,
          display_name: name || email.split('@')[0],
          is_guest: false,
          timezone: localStorage.getItem('a2z_user_timezone') || 'Asia/Kolkata',
          created_at: u.created_at,
        });
      }
      return { success: true };
    } catch (err) {
      return { success: false, error: (err as Error).message };
    }
  };

  const signOut = async () => {
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.auth.signOut();
      } catch (err) {
        console.warn('Sign out error:', err);
      }
    }
    // Revert to guest user
    const guest: UserProfile = {
      id: 'guest_user',
      email: 'guest@a2ztracker.local',
      display_name: 'DSA Explorer',
      is_guest: true,
      timezone: localStorage.getItem('a2z_user_timezone') || 'Asia/Kolkata',
      created_at: new Date().toISOString(),
    };
    setUser(guest);
    localStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify(guest));
  };

  const updateTimezone = (tz: string) => {
    if (user) {
      const updated = { ...user, timezone: tz };
      setUser(updated);
      localStorage.setItem('a2z_user_timezone', tz);
      if (user.is_guest) {
        localStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify(updated));
      }
    }
  };

  const updateProfileName = (name: string) => {
    if (user) {
      const updated = { ...user, display_name: name };
      setUser(updated);
      if (user.is_guest) {
        localStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify(updated));
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isSupabaseConnected: isSupabaseConfigured,
        signInAsGuest,
        signInWithEmail,
        signUpWithEmail,
        signOut,
        updateTimezone,
        updateProfileName,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
