import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function ProductAdminPage() {
  // Form state with images as an array
  const [formData, setFormData] = useState({
    amazonUrl: "",
    name: "",
    description: "",
    images: [""], // array of image URLs
    category: "",
    subcategory: "",
    affiliateProvider: "",
    affiliateUrl: "",
  });

  // Products list
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch products on load and after changes
  const fetchProducts = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("products").select("*").order("created_at", { ascending: false });
    if (error) {
      alert("Error loading products: " + error.message);
    } else {
      setProducts(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle image URL change by index
  const handleImageChange = (index, value) => {
    const newImages = [...formData.images];
    newImages[index] = value;
    setFormData((prev) => ({ ...prev, images: newImages }));
  };

  // Add new image input
  const addImageInput = () => {
    setFormData((prev) => ({ ...prev, images: [...prev.images, ""] }));
  };

  // Remove image input by index
  const removeImageInput = (index) => {
    if (formData.images.length === 1) return; // keep at least one input
    const newImages = formData.images.filter((_, i) => i !== index);
    setFormData((prev) => ({ ...prev, images: newImages }));
  };

  // Submit form to Supabase
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic validation example: require name and at least one image URL
    if (!formData.name.trim()) {
      alert("Product name is required");
      return;
    }
    if (!formData.images.some((img) => img.trim() !== "")) {
      alert("At least one image URL is required");
      return;
    }

    // Prepare payload - remove empty image URLs
    const payload = {
      ...formData,
      images: formData.images.filter((img) => img.trim() !== ""),
    };

    // Insert into Supabase
    const { error } = await supabase.from("products").insert([payload]);
    if (error) {
      alert("Error saving product: " + error.message);
    } else {
      alert("Product saved successfully!");
      // Reset form
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
      fetchProducts(); // refresh list
    }
  };

  // Placeholder for future auto-fill feature
  const handleAutoFill = () => {
    alert("Auto-fill from Amazon coming soon! Please paste your link for now.");
  };

  // Delete product handler
  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) {
      alert("Error deleting product: " + error.message);
    } else {
      fetchProducts();
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Add Product</h1>

      <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded shadow">
        <div>
          <label htmlFor="amazonUrl" className="block font-semibold mb-1">
            Amazon URL
          </label>
          <div className="flex gap-2">
            <input
              id="amazonUrl"
              name="amazonUrl"
              type="url"
              placeholder="Paste Amazon URL"
              value={formData.amazonUrl}
              onChange={handleChange}
              className="flex-grow border rounded px-3 py-2"
            />
            <button
              type="button"
              onClick={handleAutoFill}
              className="bg-blue-600 text-white px-4 rounded hover:bg-blue-700"
            >
              Auto-fill
            </button>
          </div>
        </div>

        <div>
          <label htmlFor="name" className="block font-semibold mb-1">
            Product Name <span className="text-red-600">*</span>
          </label>
          <input
            id="name"
            name="name"
            type="text"
            placeholder="Product Name"
            value={formData.name}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
            required
          />
        </div>

        <div>
          <label htmlFor="description" className="block font-semibold mb-1">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            placeholder="Description"
            value={formData.description}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2 min-h-[100px]"
          />
        </div>

        <div>
          <label className="block font-semibold mb-1">Image URLs <span className="text-red-600">*</span></label>
          {formData.images.map((url, idx) => (
            <div key={idx} className="flex gap-2 mb-2">
              <input
                type="url"
                placeholder="Image URL"
                value={url}
                onChange={(e) => handleImageChange(idx, e.target.value)}
                className="flex-grow border rounded px-3 py-2"
                required={idx === 0}
              />
              <button
                type="button"
                onClick={() => removeImageInput(idx)}
                disabled={formData.images.length === 1}
                className={`px-3 rounded ${
                  formData.images.length === 1 ? "bg-gray-300 cursor-not-allowed" : "bg-red-600 text-white hover:bg-red-700"
                }`}
                title={formData.images.length === 1 ? "At least one image is required" : "Remove this image"}
              >
                &times;
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={addImageInput}
            className="text-blue-600 hover:underline"
          >
            + Add another image
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="category" className="block font-semibold mb-1">
              Category
            </label>
            <input
              id="category"
              name="category"
              type="text"
              placeholder="Category"
              value={formData.category}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
            />
          </div>
          <div>
            <label htmlFor="subcategory" className="block font-semibold mb-1">
              Subcategory
            </label>
            <input
              id="subcategory"
              name="subcategory"
              type="text"
              placeholder="Subcategory"
              value={formData.subcategory}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="affiliateProvider" className="block font-semibold mb-1">
              Affiliate Provider
            </label>
            <input
              id="affiliateProvider"
              name="affiliateProvider"
              type="text"
              placeholder="Affiliate Provider"
              value={formData.affiliateProvider}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
            />
          </div>
          <div>
            <label htmlFor="affiliateUrl" className="block font-semibold mb-1">
              Affiliate URL
            </label>
            <input
              id="affiliateUrl"
              name="affiliateUrl"
              type="url"
              placeholder="Affiliate URL"
              value={formData.affiliateUrl}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
            />
          </div>
        </div>

        <button
          type="submit"
          className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
        >
          Save Product
        </button>
      </form>

      <hr className="my-8" />

      <h2 className="text-2xl font-semibold mb-4">Existing Products</h2>

      {loading ? (
        <p>Loading products...</p>
      ) : products.length === 0 ? (
        <p>No products found.</p>
      ) : (
        <div className="space-y-4">
          {products.map((product) => (
            <div key={product.id} className="border rounded p-4 flex flex-col md:flex-row md:items-center md:justify-between">
              <div className="flex items-center space-x-4">
                {product.images && product.images.length > 0 && (
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="w-24 h-24 object-cover rounded"
                  />
                )}
                <div>
                  <h3 className="text-lg font-bold">{product.name}</h3>
                  <p className="text-sm text-gray-600">{product.category} / {product.subcategory}</p>
                  <a
                    href={product.affiliateUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline text-sm"
                  >
                    Buy on {product.affiliateProvider || "affiliate site"}
                  </a>
                </div>
              </div>
              <button
                onClick={() => handleDelete(product.id)}
                className="mt-4 md:mt-0 bg-red-600 text-white px-4 py-1 rounded hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
