
import React, { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/router";

export default function AddProductPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    imageUrl: "",
    category: "",
    subcategory: "",
    visible: true,
    featured: false,
    onSale: false,
    affiliateProvider: "",
    affiliateUrl: "",
    amazonUrl: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const { error } = await supabase.from("products").insert([formData]);
    if (error) {
      alert("Error saving product: " + error.message);
    } else {
      alert("Product added successfully!");
      router.push("/admin/products");
    }
  };

  return (
    <div style={{ padding: "2rem", maxWidth: 600, margin: "0 auto" }}>
      <h1>Add New Product</h1>
      <form onSubmit={handleSubmit} style={{ display: "grid", gap: "1rem" }}>
        <input
          type="text"
          name="name"
          placeholder="Product Name"
          value={formData.name}
          onChange={handleChange}
          required
        />

        <textarea
          name="description"
          placeholder="Description"
          value={formData.description}
          onChange={handleChange}
        />

        <input
          type="text"
          name="imageUrl"
          placeholder="Image URL"
          value={formData.imageUrl}
          onChange={handleChange}
        />

        <input
          type="text"
          name="category"
          placeholder="Category"
          value={formData.category}
          onChange={handleChange}
        />

        <input
          type="text"
          name="subcategory"
          placeholder="Subcategory"
          value={formData.subcategory}
          onChange={handleChange}
        />

        <input
          type="text"
          name="affiliateProvider"
          placeholder="Affiliate Provider"
          value={formData.affiliateProvider}
          onChange={handleChange}
        />

        <input
          type="text"
          name="affiliateUrl"
          placeholder="Affiliate URL"
          value={formData.affiliateUrl}
          onChange={handleChange}
        />

        <input
          type="text"
          name="amazonUrl"
          placeholder="Amazon URL"
          value={formData.amazonUrl}
          onChange={handleChange}
        />

        <label>
          <input
            type="checkbox"
            name="visible"
            checked={formData.visible}
            onChange={handleChange}
          />{" "}
          Visible
        </label>

        <label>
          <input
            type="checkbox"
            name="featured"
            checked={formData.featured}
            onChange={handleChange}
          />{" "}
          Featured
        </label>

        <label>
          <input
            type="checkbox"
            name="onSale"
            checked={formData.onSale}
            onChange={handleChange}
          />{" "}
          On Sale
        </label>

        <button
          type="submit"
          style={{
            padding: "0.5rem 1rem",
            backgroundColor: "#0070f3",
            color: "white",
            border: "none",
            borderRadius: 4,
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          Save Product
        </button>
      </form>
    </div>
  );
}
