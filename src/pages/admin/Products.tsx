import React from "react";
import ProductAdminForm from "../../components/ProductAdminForm";
import { supabase } from "../../lib/supabaseClient";

export default function ProductsAdminPage() {
  const handleSave = async (productData) => {
    const { data, error } = await supabase
      .from("products")
      .upsert(productData, { onConflict: "id" });

    if (error) {
      alert("Error saving product: " + error.message);
    } else {
      alert("Product saved successfully!");
      // You can add a redirect or reload here later if you like
    }
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Add / Edit Product</h1>
      <ProductAdminForm onSave={handleSave} />
    </div>
  );
}
