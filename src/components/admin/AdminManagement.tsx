
import { AdminManagementSection } from "./AdminManagementSection";
import { AuditTrailSection } from "./AuditTrailSection";
import { ManagementAnalytics } from "./ManagementAnalytics";

export function AdminManagement() {
  return (
    <div className="space-y-6">
      <ManagementAnalytics />
      <AdminManagementSection />
      <AuditTrailSection />
    </div>
  );
}
