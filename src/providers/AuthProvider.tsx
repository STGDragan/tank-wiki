
import { supabase } from '@/integrations/supabase/client';
import { Session, User } from '@supabase/supabase-js';
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tables } from '@/integrations/supabase/types';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  roles: string[] | null;
  subscriber: Tables<'subscribers'> | null;
  hasActiveSubscription: boolean;
  refreshRoles: () => Promise<void>;
  refreshSubscriber: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  roles: null,
  subscriber: null,
  hasActiveSubscription: false,
  refreshRoles: async () => {},
  refreshSubscriber: async () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [roles, setRoles] = useState<string[] | null>(null);
  const [subscriber, setSubscriber] = useState<Tables<'subscribers'> | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasActiveSubscription, setHasActiveSubscription] = useState(false);
  const navigate = useNavigate();

  const fetchRoles = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId);

      if (error) {
        console.error('Error fetching user roles:', error);
        setRoles(null);
      } else {
        setRoles(data.map(r => r.role));
      }
    } catch (error) {
      console.error('Error in fetchRoles:', error);
      setRoles(null);
    }
  }, []);

  const checkAdminSubscriptionOverride = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('admin_subscription_override')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error checking admin override:', error);
        return false;
      }

      return data?.admin_subscription_override || false;
    } catch (error) {
      console.error('Error in checkAdminSubscriptionOverride:', error);
      return false;
    }
  }, []);

  const checkAdminGrantedSubscription = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase.rpc('has_admin_granted_subscription', { _user_id: userId });

      if (error) {
        console.error('Error checking admin granted subscription:', error);
        return false;
      }

      return data || false;
    } catch (error) {
      console.error('Error in checkAdminGrantedSubscription:', error);
      return false;
    }
  }, []);

  const fetchSubscriber = useCallback(async (userId: string) => {
    try {
      const { error: syncError } = await supabase.functions.invoke('check-subscription-status');
      if (syncError) {
        console.error('Error syncing subscription status with Stripe:', syncError.message);
      }

      const { data, error } = await supabase
        .from('subscribers')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching subscriber info:', error);
        setSubscriber(null);
      } else {
        setSubscriber(data);
      }

      // Check for admin overrides and granted subscriptions
      const [hasAdminOverride, hasGrantedSub] = await Promise.all([
        checkAdminSubscriptionOverride(userId),
        checkAdminGrantedSubscription(userId)
      ]);

      // User has active subscription if:
      // 1. They have a paid subscription, OR
      // 2. They have admin subscription override, OR  
      // 3. They have an active admin-granted subscription
      const hasPaidSubscription = data?.subscribed || false;
      setHasActiveSubscription(hasPaidSubscription || hasAdminOverride || hasGrantedSub);

    } catch (error) {
      console.error('Error in fetchSubscriber:', error);
      setSubscriber(null);
      setHasActiveSubscription(false);
    }
  }, [checkAdminSubscriptionOverride, checkAdminGrantedSubscription]);
  
  const refreshRoles = useCallback(async () => {
    if (user) {
      await fetchRoles(user.id);
    }
  }, [user, fetchRoles]);

  const refreshSubscriber = useCallback(async () => {
    if (user) {
      await fetchSubscriber(user.id);
    }
  }, [user, fetchSubscriber]);

  useEffect(() => {
    let mounted = true;
    
    const initializeAuth = async () => {
      try {
        // Get initial session
        const { data: { session: initialSession }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting initial session:', error);
        }
        
        if (mounted) {
          setSession(initialSession);
          setUser(initialSession?.user ?? null);
          
          if (initialSession?.user) {
            // Fetch additional data for authenticated user
            await Promise.all([
              fetchRoles(initialSession.user.id),
              fetchSubscriber(initialSession.user.id),
            ]);
          }
          
          setLoading(false);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        if (mounted) {
          setLoading(false);
        }
      }
    };

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state change:', event, session?.user?.id);
        
        if (!mounted) return;
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (event === 'SIGNED_OUT') {
          setRoles(null);
          setSubscriber(null);
          setHasActiveSubscription(false);
          navigate('/login');
        } else if (session?.user) {
          // Use setTimeout to avoid blocking the auth state change
          setTimeout(() => {
            if (mounted) {
              fetchRoles(session.user.id);
              fetchSubscriber(session.user.id);
            }
          }, 0);
        } else {
          setRoles(null);
          setSubscriber(null);
          setHasActiveSubscription(false);
        }
      }
    );

    // Initialize auth state
    initializeAuth();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [fetchRoles, fetchSubscriber, navigate]);

  const value = { user, session, loading, roles, subscriber, hasActiveSubscription, refreshRoles, refreshSubscriber };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
