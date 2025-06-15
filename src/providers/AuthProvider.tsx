
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
  refreshRoles: () => Promise<void>;
  refreshSubscriber: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  roles: null,
  subscriber: null,
  refreshRoles: async () => {},
  refreshSubscriber: async () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [roles, setRoles] = useState<string[] | null>(null);
  const [subscriber, setSubscriber] = useState<Tables<'subscribers'> | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchRoles = useCallback(async (userId: string) => {
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
  }, []);

  const fetchSubscriber = useCallback(async (userId: string) => {
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
  }, []);
  
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
    setLoading(true);
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        Promise.all([
            fetchRoles(session.user.id),
            fetchSubscriber(session.user.id),
        ]).finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        if (_event === 'SIGNED_OUT') {
            navigate('/login');
        }
        if (session?.user) {
          fetchRoles(session.user.id);
          fetchSubscriber(session.user.id);
        } else {
          setRoles(null);
          setSubscriber(null);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [fetchRoles, navigate, fetchSubscriber]);

  const value = { user, session, loading, roles, subscriber, refreshRoles, refreshSubscriber };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
