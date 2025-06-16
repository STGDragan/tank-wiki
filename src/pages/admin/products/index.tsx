import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "@/lib/supabaseClient";

type Product = {
  id: number;
  name: string;
  visible: boolean;
  featured: boolean;
  onSale: boolean;
  category: string | null;
  subcategory: string | null;
};

export default function ProductsListPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  async function fetchProducts() {
    setLoading(true);
    const { data, error } = await supabase
      .from("products")
      .select("id, name, visible, featured, onSale, category, subcategory")
      .order("id", { ascending: true });

    if (error) {
      alert("Error fetching products: " + error.message);
    } else {
      setProducts(data || []);
    }
    setLoading(false);
  }

  async function toggleFlag(productId: number, flag: keyof Product, currentValue: boolean) {
    const { error } = await supabase
      .from("products")
      .update({ [flag]: !currentValue })
      .eq("id", productId);

    if (error) {
      alert("Error updating product: " + error.message);
    } else {
      setProducts((prev) =>
        prev.map((p) => (p.id === productId ? { ...p, [flag]: !currentValue } : p))
      );
    }
  }

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Products</h1>

      <button
        style={{
          marginBottom: "1rem",
          padding: "0.5rem 1rem",
          cursor: "pointer",
          backgroundColor: "#0070f3",
          color: "white",
          border: "none",
          borderRadius: "4px",
          fontWeight: "bold",
        }}
        onClick={() => router.push("/admin/products/new")}
      >
        + Add Product
      </button>

      {loading ? (
        <p>Loading products...</p>
      ) : products.length === 0 ? (
        <p>No products found.</p>
      ) : (
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            textAlign: "left",
          }}
        >
          <thead>
            <tr>
              <th style={{ borderBottom: "1px solid #ddd", padding: "0.5rem" }}>Name</th>
              <th style={{ borderBottom: "1px solid #ddd", padding: "0.5rem" }}>Category</th>
              <th style={{ borderBottom: "1px solid #ddd", padding: "0.5rem" }}>Subcategory</th>
              <th style={{ borderBottom: "1px solid #ddd", padding: "0.5rem" }}>Visible</th>
              <th style={{ borderBottom: "1px solid #ddd", padding: "0.5rem" }}>Featured</th>
              <th style={{ borderBottom: "1px solid #ddd", padding: "0.5rem" }}>On Sale</th>
              <th style={{ borderBottom: "1px solid #ddd", padding: "0.5rem" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id} style={{ borderBottom: "1px solid #eee" }}>
                <td style={{ padding: "0.5rem" }}>{product.name}</td>
                <td style={{ padding: "0.5rem" }}>{product.category || "-"}</td>
                <td style={{ padding: "0.5rem" }}>{product.subcategory || "-"}</td>
                <td style={{ padding: "0.5rem", textAlign: "center" }}>
                  <input
                    type="checkbox"
                    checked={product.visible}
                    onChange={() => toggleFlag(product.id, "visible", product.visible)}
                  />
                </td>
                <td style={{ padding: "0.5rem", textAlign: "center" }}>
                  <input
                    type="checkbox"
                    checked={product.featured}
                    onChange={() => toggleFlag(product.id, "featured", product.featured)}
                  />
                </td>
                <td style={{ padding: "0.5rem", textAlign: "center" }}>
                  <input
                    type="checkbox"
                    checked={product.onSale}
                    onChange={() => toggleFlag(product.id, "onSale", product.onSale)}
                  />
                </td>
                <td style={{ padding: "0.5rem" }}>
                  <button
                    onClick={() => router.push(`/admin/products/${product.id}`)}
                    style={{
                      padding: "0.25rem 0.5rem",
                      cursor: "pointer",
                      backgroundColor: "#0070f3",
                      color: "white",
                      border: "none",
                      borderRadius: "4px",
                    }}
                  >
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
