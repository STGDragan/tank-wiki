
-- Enable Row Level Security on the wishlist_items table
ALTER TABLE public.wishlist_items ENABLE ROW LEVEL SECURITY;

-- Allow users to view their own wishlist items
CREATE POLICY "Users can view their own wishlist items"
ON public.wishlist_items
FOR SELECT
USING (auth.uid() = user_id);

-- Allow users to add items to their own wishlist
CREATE POLICY "Users can create their own wishlist items"
ON public.wishlist_items
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own wishlist items
CREATE POLICY "Users can update their own wishlist items"
ON public.wishlist_items
FOR UPDATE
USING (auth.uid() = user_id);

-- Allow users to delete items from their own wishlist
CREATE POLICY "Users can delete their own wishlist items"
ON public.wishlist_items
FOR DELETE
USING (auth.uid() = user_id);
