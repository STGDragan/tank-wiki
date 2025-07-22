-- Create a new active granted subscription for testing
INSERT INTO admin_granted_subscriptions (
    granted_to_user_id,
    granted_by_admin_id, 
    subscription_tier,
    is_active,
    notes
) VALUES (
    '6ff4e0d3-4c87-457b-86a5-5558d7c969d7',
    '6ff4e0d3-4c87-457b-86a5-5558d7c969d7',
    'Pro',
    true,
    'Test active subscription for revoke button testing'
);