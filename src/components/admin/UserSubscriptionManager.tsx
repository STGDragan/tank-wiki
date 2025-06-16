
import { useSubscriptionData } from "./subscription/hooks/useSubscriptionData";
import { AdminOverrideSection } from "./subscription/AdminOverrideSection";
import { GrantSubscriptionSection } from "./subscription/GrantSubscriptionSection";
import { GrantedSubscriptionsList } from "./subscription/GrantedSubscriptionsList";

export function UserSubscriptionManager() {
  const { profiles, grantedSubscriptions, isLoading } = useSubscriptionData();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <AdminOverrideSection profiles={profiles} />
      <GrantSubscriptionSection profiles={profiles} />
      <GrantedSubscriptionsList grantedSubscriptions={grantedSubscriptions} />
    </div>
  );
}
