
import { AdminManagementSection } from "./AdminManagementSection";
import { AuditTrailSection } from "./AuditTrailSection";

export function AdminManagement() {
  return (
    <div className="space-y-6">
      <AdminManagementSection />
      <AuditTrailSection />
    </div>
  );
}
