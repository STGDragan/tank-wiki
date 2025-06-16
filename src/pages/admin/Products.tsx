import React, { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

interface ProductFormData {
  amazonUrl: string;
  name: string;
  description: string;
  imageUrls: string[]; // multiple images
  category: string;
  subcategory: string;
  affiliateProvider: string;
  affiliateUrl: string;
}

export default function ProductAdminPage() {
  const [formData, setFormData] = useState<ProductFormData>({
    amazonUrl: "",
    name: "",
    description: "",
    imageUrls: [""], // start with one empty image url field
    category: "",
    subcategory: "",
    affiliateProvider: "",
    affiliateUrl: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    index?: number
  ) => {
    const { name, value } = e.target;
    if (name === "imageUrls" && typeof index === "number") {
      // Update specific image url in the array
      const newImageUrls = [...formData.imageUrls];
      newImageUrls[index] = value;
      setFormData((prev) => ({ ...prev, imageUrls: newImageUrls }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const addImageField = () => {
    setFormData((prev) => ({ ...prev, imageUrls: [...prev.imageUrls, ""] }));
  };

  const removeImageField = (index: number) => {
    if (formData.imageUrls.length === 1) return; // at least one field always
    const newImageUrls = formData.imageUrls.filter((_, i) => i !== index);
    setFormData((prev) => ({ ...prev, imageUrls: newImageUrls }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Flatten images to a JSON string or array depending on DB column type
    const productToInsert = {
      ...formData,
      imageUrls: JSON.stringify(formData.imageUrls),
    };

    const { error } = await supabase.from("products").insert([productToInsert]);
    if (error) {
      alert("Error saving product: " + error.message);
    } else {
      alert("Product saved successfully!");
      setFormData({
        amazonUrl: "",
        name: "",
        description: "",
        imageUrls: [""],
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
    <div style={{ maxWidth: 700, margin: "2rem auto", padding: "1rem" }}>
      <h1 style={{ marginBottom: "1rem" }}>Add / Edit Product</h1>
      <form onSubmit={handleSubmit} style={{ display: "grid", gap: "1rem" }}>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <input
            type="text"
            name="amazonUrl"
            placeholder="Paste Amazon URL"
            value={formData.amazonUrl}
            onChange={handleChange}
            style={{ flexGrow: 1, padding: "0.5rem" }}
          />
          <button
            type="button"
            onClick={handleAutoFill}
            style={{ padding: "0.5rem 1rem" }}
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
          style={{ padding: "0.5rem" }}
          required
        />
        <textarea
          name="description"
          placeholder="Description"
          value={formData.description}
          onChange={handleChange}
          style={{ padding: "0.5rem", minHeight: "100px" }}
          required
        />

        <div>
          <label style={{ fontWeight: "bold" }}>Image URLs:</label>
          {formData.imageUrls.map((url, index) => (
            <div
              key={index}
              style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}
            >
              <input
                type="text"
                name="imageUrls"
                placeholder={`Image URL #${index + 1}`}
                value={url}
                onChange={(e) => handleChange(e, index)}
                style={{ flexGrow: 1, padding: "0.5rem" }}
                required={index === 0} // require at least first image
              />
              {formData.imageUrls.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeImageField(index)}
                  style={{ padding: "0.25rem 0.5rem" }}
                >
                  ✕
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={addImageField}
            style={{ marginTop: "0.5rem", padding: "0.5rem 1rem" }}
          >
            + Add Image
          </button>
        </div>

        <input
          type="text"
          name="category"
          placeholder="Category"
          value={formData.category}
          onChange={handleChange}
          style={{ padding: "0.5rem" }}
          required
        />
        <input
          type="text"
          name="subcategory"
          placeholder="Subcategory"
          value={formData.subcategory}
          onChange={handleChange}
          style={{ padding: "0.5rem" }}
        />
        <input
          type="text"
          name="affiliateProvider"
          placeholder="Affiliate Provider"
          value={formData.affiliateProvider}
          onChange={handleChange}
          style={{ padding: "0.5rem" }}
          required
        />
        <input
          type="text"
          name="affiliateUrl"
          placeholder="Affiliate URL"
          value={formData.affiliateUrl}
          onChange={handleChange}
          style={{ padding: "0.5rem" }}
          required
        />

        <button type="submit" style={{ padding: "0.75rem", fontWeight: "bold" }}>
          Save Product
        </button>
      </form>
    </div>
  );
}
