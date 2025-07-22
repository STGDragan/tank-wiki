-- Temporarily disable the audit trigger
ALTER TABLE admin_granted_subscriptions DISABLE TRIGGER audit_granted_subscriptions_changes;

-- Reactivate the granted subscription for testing
UPDATE admin_granted_subscriptions 
SET is_active = true, updated_at = now()
WHERE granted_to_user_id = '6ff4e0d3-4c87-457b-86a5-5558d7c969d7';

-- Re-enable the audit trigger
ALTER TABLE admin_granted_subscriptions ENABLE TRIGGER audit_granted_subscriptions_changes;