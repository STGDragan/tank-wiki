-- Fix admin access to granted subscriptions table
-- Drop existing restrictive policy and create a more permissive one for admins

DROP POLICY IF EXISTS "Admins can manage granted subscriptions" ON admin_granted_subscriptions;

-- Create a policy that allows admin role users to manage all granted subscriptions
CREATE POLICY "Admin users can manage all granted subscriptions" ON admin_granted_subscriptions
FOR ALL 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_roles.user_id = auth.uid() 
    AND user_roles.role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_roles.user_id = auth.uid() 
    AND user_roles.role = 'admin'
  )
);

-- Also ensure admin users can read/update profiles table
DROP POLICY IF EXISTS "Admin users can manage all profiles" ON profiles;

CREATE POLICY "Admin users can manage all profiles" ON profiles
FOR ALL 
TO authenticated
USING (
  -- Users can manage their own profile OR user is admin
  auth.uid() = id OR 
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_roles.user_id = auth.uid() 
    AND user_roles.role = 'admin'
  )
)
WITH CHECK (
  -- Users can manage their own profile OR user is admin
  auth.uid() = id OR 
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_roles.user_id = auth.uid() 
    AND user_roles.role = 'admin'
  )
);