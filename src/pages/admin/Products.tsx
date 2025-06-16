import React, { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function ProductAdminPage() {
  const [formData, setFormData] = useState({
    amazonUrl: "",
    name: "",
    description: "",
    images: [""],
    category: "",
    subcategory: "",
    affiliateProvider: "",
    affiliateUrl: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (index: number, value: string) => {
    const updatedImages = [...formData.images];
    updatedImages[index] = value;
    setFormData((prev) => ({ ...prev, images: updatedImages }));
  };

  const addImageField = () => {
    setFormData((prev) => ({ ...prev, images: [...prev.images, ""] }));
  };

  const removeImageField = (index: number) => {
    const updatedImages = [...formData.images];
    updatedImages.splice(index, 1);
    setFormData((prev) => ({ ...prev, images: updatedImages }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const productData = {
      ...formData,
      images: formData.images.filter((img) => img.trim() !== ""),
    };

    const { error } = await supabase.from("products").insert([productData]);
    if (error) {
      alert("Error saving product: " + error.message);
    } else {
      alert("Product saved successfully!");
      setFormData({
        amazonUrl: "",
        name: "",
        description: "",
        images: [""],
        category: "",
        subcategory: "",
        affiliateProvider: "",
        affiliateUrl: "",
      });
    }
  };

  const handleAutoFill = () => {
    alert("Auto-fill from Amazon coming soon! Paste your link for now.");
  };

  return (
    <div style={{ padding: "2rem", maxWidth: "700px", margin: "0 auto" }}>
      <h1 style={{ marginBottom: "1rem" }}>Add Product</h1>
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
          rows={3}
        />

        <div>
          <label style={{ fontWeight: "bold" }}>Product Images</label>
          {formData.images.map((img, index) => (
            <div key={index} style={{ display: "flex", gap: "0.5rem", alignItems: "center", marginBottom: "0.5rem" }}>
              <input
                type="text"
                value={img}
                onChange={(e) => handleImageChange(index, e.target.value)}
                placeholder={`Image URL ${index + 1}`}
                style={{ flexGrow: 1 }}
              />
              {img && (
                <img src={img} alt={`Preview ${index + 1}`} style={{ width: "50px", height: "50px", objectFit: "cover", borderRadius: "4px" }} />
              )}
              {formData.images.length > 1 && (
                <button type="button" onClick={() => removeImageField(index)}>❌</button>
              )}
            </div>
          ))}
          <button type="button" onClick={addImageField}>➕ Add Image</button>
        </div>

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

        <button type="submit" style={{ marginTop: "1rem", padding: "0.5rem", fontWeight: "bold" }}>
          💾 Save Product
        </button>
      </form>
    </div>
  );
}
