
import { AdminRoute } from "@/components/admin/AdminRoute";
import ShoppingManagerConsole from "@/components/admin/ShoppingManagerConsole";

const AdminShoppingManager = () => {
  return (
    <AdminRoute>
      <div className="container mx-auto px-4 py-8">
        <ShoppingManagerConsole />
      </div>
    </AdminRoute>
  );
};

export default AdminShoppingManager;
