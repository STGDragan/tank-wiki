import React, { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function ProductAdminPage() {
  const [formData, setFormData] = useState({
    amazonUrl: "",
    name: "",
    description: "",
    imageUrl: "",
    category: "",
    subcategory: "",
    affiliateProvider: "",
    affiliateUrl: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { error } = await supabase.from("products").insert([formData]);
    if (error) {
      alert("Error saving product: " + error.message);
    } else {
      alert("Product saved successfully!");
      setFormData({
        amazonUrl: "",
        name: "",
        description: "",
        imageUrl: "",
        category: "",
        subcategory: "",
        affiliateProvider: "",
        affiliateUrl: "",
      });
    }
  };

  const handleAutoFill = () => {
    alert("Auto-fill from Amazon coming soon! Paste your link for now.");
    // Future: fetch data from API or scraper here
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Add Product</h1>
      <form onSubmit={handleSubmit} style={{ display: "grid", gap: "1rem" }}>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <input
            type="text"
            name="amazonUrl"
            placeholder="Paste Amazon URL"
            value={formData.amazonUrl}
            onChange={handleChange}
            style={{ flexGrow: 1 }}
          />
          <button type="button" onClick={handleAutoFill}>
            Auto-fill
          </button>
        </div>

        <input
          type="text"
          name="name"
          placeholder="Product Name"
          value={formData.name}
          onChange={handleChange}
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
          placeholder="Main Image URL"
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

        <button type="submit">Save</button>
      </form>
    </div>
  );
}
