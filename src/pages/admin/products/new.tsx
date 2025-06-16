// File: /pages/admin/products/new.tsx

import React from "react";
import { useRouter } from "next/router";
import { supabase } from "@/lib/supabaseClient";

export default function NewProductPage() {
  const router = useRouter();

  async function createProduct() {
    const { data, error } = await supabase
      .from("products")
      .insert([
        {
          name: "New Product",
          is_featured: false, // Adjust fields to your actual schema
          featured: false,
          price: null,
          category: null,
          subcategory: null,
          description: "",
          image_url: null,
        },
      ])
      .select()
      .single();

    if (error) {
      alert("Error creating product: " + error.message);
    } else {
      router.push(`/admin/products/${data.id}`);
    }
  }

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Create New Product</h1>
      <button
        onClick={createProduct}
        style={{
          padding: "0.5rem 1rem",
          cursor: "pointer",
          backgroundColor: "#0070f3",
          color: "white",
          border: "none",
          borderRadius: "4px",
        }}
      >
        Create Default Product
      </button>
    </div>
  );
}
