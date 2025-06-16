import React, { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

function extractASIN(url: string) {
  // Matches Amazon product URLs for ASIN extraction
  // Example URLs:
  // https://www.amazon.com/dp/B08N5WRWNW/
  // https://www.amazon.com/gp/product/B08N5WRWNW/
  const regex = /\/(?:dp|gp\/product)\/([A-Z0-9]{10})/;
  const match = url.match(regex);
  return match ? match[1] : null;
}

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
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
    const asin = extractASIN(formData.amazonUrl);
    if (!asin) {
      alert("Could not find ASIN in the Amazon URL. Please check your link.");
      return;
    }

    // Placeholder auto-fill data
    setFormData((prev) => ({
      ...prev,
      name: `Sample Product Title for ASIN ${asin}`,
      description: "This is a placeholder description. Real data will be fetched here soon.",
      imageUrl: `https://images-na.ssl-images-amazon.com/images/I/${asin}.jpg`,
      category: "Example Category",
      subcategory: "Example Subcategory",
      affiliateProvider: "Amazon",
      affiliateUrl: formData.amazonUrl,
    }));
  };

  return (
    <div style={{ maxWidth: 600, margin: "2rem auto", fontFamily: "Arial, sans-serif" }}>
      <h1 style={{ textAlign: "center" }}>Add Product</h1>
      <form onSubmit={handleSubmit} style={{ display: "grid", gap: "1rem" }}>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <input
            type="text"
            name="amazonUrl"
            placeholder="Paste Amazon URL"
            value={formData.amazonUrl}
            onChange={handleChange}
            style={{ flexGrow: 1, padding: "0.5rem", fontSize: "1rem" }}
          />
          <button
            type="button"
            onClick={handleAutoFill}
            style={{
              padding: "0.5rem 1rem",
              backgroundColor: "#ff9900",
              border: "none",
              color: "white",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            Auto-fill
          </button>
        </div>

        <input
          type="text"
          name="name"
          placeholder="Product Name"
          value={formData.name}
          onChange={handleChange}
          style={{ padding: "0.5rem", fontSize: "1rem" }}
          required
        />

        <textarea
          name="description"
          placeholder="Description"
          value={formData.description}
          onChange={handleChange}
          rows={4}
          style={{ padding: "0.5rem", fontSize: "1rem", resize: "vertical" }}
        />

        <input
          type="text"
          name="imageUrl"
          placeholder="Main Image URL"
          value={formData.imageUrl}
          onChange={handleChange}
          style={{ padding: "0.5rem", fontSize: "1rem" }}
        />

        <input
          type="text"
          name="category"
          placeholder="Category"
          value={formData.category}
          onChange={handleChange}
          style={{ padding: "0.5rem", fontSize: "1rem" }}
        />

        <input
          type="text"
          name="subcategory"
          placeholder="Subcategory"
          value={formData.subcategory}
          onChange={handleChange}
          style={{ padding: "0.5rem", fontSize: "1rem" }}
        />

        <input
          type="text"
          name="affiliateProvider"
          placeholder="Affiliate Provider"
          value={formData.affiliateProvider}
          onChange={handleChange}
          style={{ padding: "0.5rem", fontSize: "1rem" }}
        />

        <input
          type="text"
          name="affiliateUrl"
          placeholder="Affiliate URL"
          value={formData.affiliateUrl}
          onChange={handleChange}
          style={{ padding: "0.5rem", fontSize: "1rem" }}
        />

        <button
          type="submit"
          style={{
            padding: "0.75rem",
            backgroundColor: "#0070f3",
            border: "none",
            color: "white",
            fontSize: "1rem",
            fontWeight: "bold",
            cursor: "pointer",
            borderRadius: 4,
          }}
        >
          Save Product
        </button>
      </form>
    </div>
  );
}
