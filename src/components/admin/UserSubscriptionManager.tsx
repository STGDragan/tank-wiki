
import { useSubscriptionData } from "./subscription/hooks/useSubscriptionData";
import { AdminOverrideSection } from "./subscription/AdminOverrideSection";
import { GrantSubscriptionSection } from "./subscription/GrantSubscriptionSection";
import { ActiveSubscriptionsTable } from "./subscription/ActiveSubscriptionsTable";
import { RevokedSubscriptionsTable } from "./subscription/RevokedSubscriptionsTable";

export function UserSubscriptionManager() {
  const { profiles, grantedSubscriptions, isLoading } = useSubscriptionData();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <AdminOverrideSection profiles={profiles} />
      <GrantSubscriptionSection profiles={profiles} />
      <ActiveSubscriptionsTable grantedSubscriptions={grantedSubscriptions} />
      <RevokedSubscriptionsTable grantedSubscriptions={grantedSubscriptions} />
    </div>
  );
}
