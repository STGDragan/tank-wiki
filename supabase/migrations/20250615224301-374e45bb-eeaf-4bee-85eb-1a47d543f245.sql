
-- Create a table to store aquarium share invitations
CREATE TABLE public.aquarium_share_invitations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  aquarium_id UUID NOT NULL REFERENCES public.aquariums(id) ON DELETE CASCADE,
  owner_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  invited_email TEXT NOT NULL,
  permission public.permission_level NOT NULL DEFAULT 'viewer',
  invitation_token UUID NOT NULL DEFAULT gen_random_uuid(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '7 days'),
  accepted_at TIMESTAMP WITH TIME ZONE NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(aquarium_id, invited_email)
);

-- Enable RLS for the invitations table
ALTER TABLE public.aquarium_share_invitations ENABLE ROW LEVEL SECURITY;

-- Create policies for the invitations table
CREATE POLICY "Owners can manage their invitations" ON public.aquarium_share_invitations 
  FOR ALL USING (auth.uid() = owner_user_id);

CREATE POLICY "Anyone can view invitations by token" ON public.aquarium_share_invitations 
  FOR SELECT USING (true);

-- Create a function to accept aquarium share invitations
CREATE OR REPLACE FUNCTION public.accept_aquarium_invitation(
  _invitation_token UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  _invitation RECORD;
  _user_email TEXT;
  _existing_share_id UUID;
BEGIN
  -- Get the current user's email
  SELECT email INTO _user_email FROM auth.users WHERE id = auth.uid();
  
  IF _user_email IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'User not authenticated');
  END IF;

  -- Get the invitation details
  SELECT * INTO _invitation 
  FROM public.aquarium_share_invitations 
  WHERE invitation_token = _invitation_token 
    AND invited_email = _user_email
    AND expires_at > now()
    AND accepted_at IS NULL;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Invalid or expired invitation');
  END IF;

  -- Check if user already has access to this aquarium
  SELECT id INTO _existing_share_id 
  FROM public.aquarium_shares 
  WHERE aquarium_id = _invitation.aquarium_id 
    AND shared_with_user_id = auth.uid();

  IF _existing_share_id IS NOT NULL THEN
    -- Update existing share permission if invitation has higher permission
    UPDATE public.aquarium_shares 
    SET permission = _invitation.permission
    WHERE id = _existing_share_id 
      AND _invitation.permission = 'editor'::public.permission_level;
  ELSE
    -- Create new share
    INSERT INTO public.aquarium_shares (
      aquarium_id, 
      owner_user_id, 
      shared_with_user_id, 
      permission
    ) VALUES (
      _invitation.aquarium_id,
      _invitation.owner_user_id,
      auth.uid(),
      _invitation.permission
    );
  END IF;

  -- Mark invitation as accepted
  UPDATE public.aquarium_share_invitations 
  SET accepted_at = now() 
  WHERE id = _invitation.id;

  RETURN jsonb_build_object('success', true, 'aquarium_id', _invitation.aquarium_id);
END;
$$;
